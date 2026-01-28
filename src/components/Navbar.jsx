import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { ShoppingCart, User, Menu, X, Search, Heart, LayoutDashboard } from 'lucide-react';

// Import Logo
import logoSrc from '../assets/Logos/PurpleLogoTransparent.png';

import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, currentUser, settings } = useData();

  // Check if current user is admin
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin' || currentUser.role === 'editor');
  
  // Check if maintenance mode is active and user is not admin (links should be disabled)
  const isMaintenanceForUser = settings?.maintenanceMode && !isAdmin;

  // Get navbar padding class
  const navbarPaddingClass = settings?.navbarPadding || 'normal';

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} navbar-${navbarPaddingClass}`} role="navigation" aria-label="Menu principal">
      <div className="container navbar-content">

        {/* HAMBURGER BUTTON (Mobile) */}
        <button
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* LOGO */}
        <Link 
          to="/" 
          className="logo" 
          aria-label="Retour à l'accueil"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img src={logoSrc} alt="Logo Rustikop" className="logo-image" />
          <span style={{ textTransform: 'uppercase' }}>{settings?.siteTitle || 'RUSTIKOP'}<span className="dot">.</span></span>
        </Link>

        {/* NAV LINKS (Desktop + Mobile Drawer) */}
        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {isMaintenanceForUser ? (
            <>
              <span className="nav-link-disabled">Accueil</span>
              <span className="nav-link-disabled">Projets</span>
              <span className="nav-link-disabled">Boutique</span>
              <span className="nav-link-disabled">Contact</span>
            </>
          ) : (
            <>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Accueil</Link>
              <Link to="/projects" className={location.pathname === '/projects' ? 'active' : ''}>Projets</Link>
              <Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''}>Boutique</Link>
              <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
            </>
          )}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="nav-actions">
          {/* Admin Dashboard Button */}
          {isAdmin && (
            <Link to="/admin" className="action-link icon-link" title="Dashboard Admin" aria-label="Accéder au Dashboard Admin">
              <LayoutDashboard size={20} aria-hidden="true" />
            </Link>
          )}

          {isMaintenanceForUser ? (
            <>
              <span className="action-link icon-link disabled" title="Wishlist indisponible" aria-label="Wishlist indisponible">
                <Heart size={20} aria-hidden="true" />
              </span>
              <span className="action-link icon-link disabled" title="Panier indisponible" aria-label="Panier indisponible">
                <ShoppingCart size={20} aria-hidden="true" />
              </span>
            </>
          ) : (
            <>
              <Link to="/wishlist" className="action-link icon-link" title="Wishlist" aria-label="Ma Wishlist">
                <Heart size={20} aria-hidden="true" />
              </Link>

              <Link to="/cart" className="action-link icon-link" title="Panier" aria-label={`Panier, ${cartCount} articles`}>
                <ShoppingCart size={20} aria-hidden="true" />
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Link>
            </>
          )}

          <Link to={currentUser ? "/profile" : "/login"} className="action-link icon-link" title={currentUser ? "Mon Compte" : "Connexion"} aria-label={currentUser ? "Accéder à mon compte" : "Se connecter"}>
            <User size={20} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
