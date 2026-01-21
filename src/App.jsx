import { Suspense, lazy, useEffect } from 'react';
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

          <Route path="/maintenance" element={
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#fff', textAlign: 'center' }}>
              <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Site en Maintenance</h1>
              <p style={{ color: '#888' }}>Nous revenons très bientôt avec de nouvelles créations.</p>
              <Link to="/login" style={{ marginTop: '2rem', color: '#444', textDecoration: 'none', fontSize: '0.8rem' }}>Admin Login</Link>
            </div>
          } />

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
