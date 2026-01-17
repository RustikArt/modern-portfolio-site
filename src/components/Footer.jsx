import { Link } from 'react-router-dom';
import { Instagram, Twitter, Settings, Mail, MapPin } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import { useData } from '../context/DataContext';
import './Footer.css';

const Footer = () => {
    const { currentUser } = useData();
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Column 1: Brand */}
                    <div className="footer-col">
                        <h4>RUSTIKOP.</h4>
                        <p>Artisanat numérique et design immersif.</p>
                        <div className="social-links">
                            <a href="https://www.instagram.com/rustikop.art/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={20} /></a>
                            <a href="https://x.com/rustikop" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><Twitter size={20} /></a>
                            <a href="https://discord.gg/uaKYcrfyN6" target="_blank" rel="noopener noreferrer" aria-label="Discord"><FaDiscord size={20} /></a>
                        </div>
                    </div>

                    {/* Column 2: Navigation */}
                    <div className="footer-col">
                        <h4>Navigation</h4>
                        <ul>
                            <li><Link to="/">Accueil</Link></li>
                            <li><Link to="/projects">Projets</Link></li>
                            <li><Link to="/shop">Boutique</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Legal */}
                    <div className="footer-col">
                        <h4>Légal</h4>
                        <ul>
                            <li><Link to="/legal">Mentions Légales</Link></li>
                            <li><Link to="/privacy">Confidentialité</Link></li>
                            <li><Link to="/terms">CGV</Link></li>
                            <li><Link to="/sitemap">Plan du site</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact */}
                    <div className="footer-col">
                        <h4>Contact</h4>
                        <ul className="contact-list">
                            <li><Mail size={16} /> rustikop@outlook.fr</li>
                            <li><MapPin size={16} /> Paris, France</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {year} Rustikop. Tous droits réservés.</p>
                    {currentUser?.role === 'admin' && (
                        <Link to="/admin" className="admin-link-icon" title="Administration">
                            <Settings size={18} /> Admin
                        </Link>
                    )}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
