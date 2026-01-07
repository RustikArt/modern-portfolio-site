import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { cart, currentUser } = useData();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-content">
        <Link to="/" className="logo">
          PORTFOLIO<span className="dot">.</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Accueil</Link>
          <Link to="/projects" className={location.pathname === '/projects' ? 'active' : ''}>Projets</Link>
          <Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''}>Shop</Link>
          <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
        </div>
        <div className="nav-actions">
          <Link to="/cart" className="action-link">
            Panier <span className="cart-badge">{cartCount > 0 ? `(${cartCount})` : ''}</span>
          </Link>
          {currentUser ? (
            <Link to="/profile" className="action-link">Mon Compte</Link>
          ) : (
            <Link to="/login" className="action-link">Connexion</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
