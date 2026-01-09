
import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnnouncementBanner from './components/AnnouncementBanner';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Shop from './pages/Shop';
import Contact from './pages/Contact';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { DataProvider } from './context/DataContext';

// Lazy loading Dashboard
const Dashboard = lazy(() => import('./pages/Dashboard'));
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import UserDashboard from './pages/UserDashboard';
import ProductDetail from './pages/ProductDetail';
import ProjectDetail from './pages/ProjectDetail';

function App() {
  return (
    <DataProvider>
      <AnnouncementBanner />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:id" element={<ProductDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<UserDashboard />} />
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
  );
}

export default App;
