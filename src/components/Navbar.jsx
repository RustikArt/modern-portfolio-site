import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { ShoppingCart, User, Menu, X, Search, Heart } from 'lucide-react';

// Import Logo
import logoSrc from '../assets/Logos/Orange.png';

import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { cart, currentUser } = useData();

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
    setIsSearchOpen(false);
  }, [location]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Menu principal">
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
        <Link to="/" className="logo" aria-label="Retour à l'accueil">
          <img src={logoSrc} alt="Logo Rustikop" className="logo-image" />
          <span>RUSTIKOP<span className="dot">.</span></span>
        </Link>

        {/* NAV LINKS (Desktop + Mobile Drawer) */}
        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Accueil</Link>
          <Link to="/projects" className={location.pathname === '/projects' ? 'active' : ''}>Projets</Link>
          <Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''}>Shop</Link>
          <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="nav-actions">
          {/* SEARCH BAR */}
          <div className={`search-container ${isSearchOpen ? 'active' : ''}`}>
            <button className="action-link icon-link search-toggle" onClick={toggleSearch} aria-label="Rechercher">
              <Search size={20} aria-hidden="true" />
            </button>
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Champ de recherche"
              />
            </div>
          </div>

          <Link to="/wishlist" className="action-link icon-link" title="Wishlist" aria-label="Ma Wishlist">
            <Heart size={20} aria-hidden="true" />
          </Link>

          <Link to="/cart" className="action-link icon-link" title="Panier" aria-label={`Panier, ${cartCount} articles`}>
            <ShoppingCart size={20} aria-hidden="true" />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>

          <Link to={currentUser ? "/profile" : "/login"} className="action-link icon-link" title={currentUser ? "Mon Compte" : "Connexion"} aria-label={currentUser ? "Accéder à mon compte" : "Se connecter"}>
            <User size={20} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
