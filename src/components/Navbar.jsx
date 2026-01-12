import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { ShoppingCart, User } from 'lucide-react';

// --- Correction 1 : Importer l'image directement ---
// Placez votre image (par exemple, Orange.png) dans le même dossier (ou un sous-dossier comme /assets)
// et ajustez le chemin d'importation.
import logoSrc from '../assets/Orange.png'; // Assurez-vous que ce chemin est correct

import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { cart, currentUser } = useData();

  useEffect(() => {
    const handleScroll = () => {
      // Optimisation : évite les re-rendus inutiles si l'état est déjà le même.
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]); // Ajout de 'scrolled' comme dépendance pour respecter les bonnes pratiques

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-content">
        <Link to="/" className="logo" aria-label="Retour à l'accueil">
          {/* --- Correction 2 : Utiliser l'image importée --- */}
          <img src={logoSrc} alt="Logo Rustikop" className="logo-image" />
          <span>RUSTIKOP<span className="dot">.</span></span>
        </Link>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Accueil</Link>
          <Link to="/projects" className={location.pathname === '/projects' ? 'active' : ''}>Projets</Link>
          <Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''}>Shop</Link>
          <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
        </div>
        <div className="nav-actions">
          <Link to="/cart" className="action-link icon-link" title="Panier">
            <ShoppingCart size={20} aria-hidden="true" />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
          <Link to={currentUser ? "/profile" : "/login"} className="action-link icon-link" title={currentUser ? "Mon Compte" : "Connexion"}>
            <User size={20} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
