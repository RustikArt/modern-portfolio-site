import { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnnouncementBanner from './components/AnnouncementBanner';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Shop from './pages/Shop';
import Wishlist from './pages/Wishlist';
import Contact from './pages/Contact';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { DataProvider, useData } from './context/DataContext';
import { CheckCircle2, Wrench, Send } from 'lucide-react';

// Lazy loading
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const CookieConsent = lazy(() => import('./components/CookieConsent'));
const About = lazy(() => import('./pages/About'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Blog = lazy(() => import('./pages/Blog'));
const LegalMentions = lazy(() => import('./pages/LegalMentions'));
const CGV = lazy(() => import('./pages/CGV'));
const Sitemap = lazy(() => import('./pages/Sitemap'));

// Page de maintenance avec formulaire de contact
const MaintenancePage = () => {
  const { settings, addNotification } = useData();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Merci de remplir tous les champs.");
      return;
    }
    setStatus('sending');
    
    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        setTimeout(() => setStatus('success'), 1000);
        return;
      }

      const adminParams = {
        name: formData.name,
        message: `[MESSAGE PENDANT MAINTENANCE]\n\n${formData.message}`,
        reply_to: formData.email,
        to_email: settings?.contactEmail || 'rustikop@outlook.fr',
        title: '⚠️ Message reçu pendant maintenance'
      };

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, templateId, templateParams: adminParams, publicKey })
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        if (addNotification) addNotification('contact', `Message maintenance de ${formData.name}`);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(180deg, #050505 0%, #0a0a0a 100%)', 
      color: '#fff', 
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'rgba(212, 175, 55, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 2rem'
        }}>
          <Wrench size={36} style={{ color: 'var(--color-accent)' }} />
        </div>
        
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>
          Site en Maintenance
        </h1>
        <p style={{ color: '#888', marginBottom: '2rem', lineHeight: '1.6' }}>
          Nous effectuons actuellement des améliorations pour vous offrir une meilleure expérience.
          <br />Nous serons bientôt de retour !
        </p>

        {/* Formulaire de contact */}
        <div style={{ 
          background: 'rgba(255,255,255,0.02)', 
          border: '1px solid rgba(255,255,255,0.05)', 
          borderRadius: '16px', 
          padding: '2rem',
          textAlign: 'left'
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#ccc' }}>
            Une urgence ? Contactez-nous
          </h3>
          
          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <CheckCircle2 size={48} style={{ color: '#4caf50', marginBottom: '1rem' }} />
              <p style={{ color: '#4caf50' }}>Message envoyé ! Nous vous répondrons dès que possible.</p>
              <button 
                onClick={() => setStatus('idle')} 
                style={{ 
                  marginTop: '1rem', 
                  padding: '0.5rem 1rem', 
                  background: 'transparent', 
                  border: '1px solid #333', 
                  color: '#888', 
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Votre nom"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  padding: '0.8rem 1rem',
                  background: '#111',
                  border: '1px solid #222',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
                required
              />
              <input
                type="email"
                placeholder="Votre email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  padding: '0.8rem 1rem',
                  background: '#111',
                  border: '1px solid #222',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
                required
              />
              <textarea
                placeholder="Votre message..."
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                style={{
                  padding: '0.8rem 1rem',
                  background: '#111',
                  border: '1px solid #222',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  resize: 'vertical'
                }}
                required
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                style={{
                  padding: '0.8rem 1.5rem',
                  background: 'var(--color-accent)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  fontWeight: '600',
                  cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  opacity: status === 'sending' ? 0.7 : 1
                }}
              >
                <Send size={16} />
                {status === 'sending' ? 'Envoi...' : 'Envoyer'}
              </button>
              {status === 'error' && (
                <p style={{ color: '#ff4d4d', fontSize: '0.85rem', textAlign: 'center' }}>
                  Une erreur est survenue. Veuillez réessayer.
                </p>
              )}
            </form>
          )}
        </div>

        <Link to="/login" style={{ 
          marginTop: '2rem', 
          color: '#333', 
          textDecoration: 'none', 
          fontSize: '0.75rem',
          display: 'inline-block'
        }}>
          Admin Login
        </Link>
      </div>
    </div>
  );
};

const MaintenanceChecker = ({ children }) => {
  const { settings, currentUser } = useData();
  const location = useLocation();

  if (settings?.maintenanceMode && !currentUser && location.pathname !== '/login' && location.pathname !== '/maintenance') {
    return <Navigate to="/maintenance" replace />;
  }
  return children;
};

// Route wrapper for individual routes to check maintenance
const RouteGuard = ({ element }) => {
  return <MaintenanceChecker>{element}</MaintenanceChecker>;
};

function App() {
  return (
    <HelmetProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </HelmetProvider>
  );
}

const AppContent = () => {
  const { settings } = useData();

  useEffect(() => {
    if (settings?.grainEffect) {
      document.body.classList.add('enable-grain');
    } else {
      document.body.classList.remove('enable-grain');
    }
  }, [settings?.grainEffect]);

  return (
    <>
      <AnnouncementBanner />
      <CookieConsent />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<RouteGuard element={<Home />} />} />
          <Route path="/projects" element={<RouteGuard element={<Projects />} />} />
          <Route path="/projects/:id" element={<RouteGuard element={<ProjectDetail />} />} />
          <Route path="/shop" element={<RouteGuard element={<Shop />} />} />
          <Route path="/wishlist" element={<RouteGuard element={<Wishlist />} />} />
          <Route path="/shop/:id" element={<RouteGuard element={<ProductDetail />} />} />
          <Route path="/contact" element={<RouteGuard element={<Contact />} />} />

          <Route path="/login" element={<Login />} />

          <Route path="/cart" element={<RouteGuard element={<Cart />} />} />
          <Route path="/checkout" element={<RouteGuard element={<Checkout />} />} />
          <Route path="/profile" element={<RouteGuard element={<UserDashboard />} />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/legal" element={<LegalMentions />} />
          <Route path="/terms" element={<CGV />} />
          <Route path="/sitemap" element={<Sitemap />} />

          <Route path="/maintenance" element={<MaintenancePage />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Suspense fallback={<div className="container" style={{ paddingTop: '100px' }}>Chargement du tableau de bord...</div>}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
