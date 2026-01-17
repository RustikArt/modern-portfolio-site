
import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import { DataProvider } from './context/DataContext';

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

function App() {
  return (
    <HelmetProvider>
      <DataProvider>
        <AnnouncementBanner />
        <CookieConsent />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/shop/:id" element={<ProductDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<UserDashboard />} />
            <Route path="/profile" element={<UserDashboard />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/legal" element={<LegalMentions />} />
            <Route path="/terms" element={<CGV />} />
            <Route path="/sitemap" element={<Sitemap />} />
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
      </DataProvider>
    </HelmetProvider>
  );
}

export default App;
