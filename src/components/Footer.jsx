import { Link } from 'react-router-dom';
import { Instagram, Twitter, MessageCircle } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-left">
                    <p>&copy; {year} Rustikop.</p>
                </div>
                <div className="footer-right">
                    <Link to="/admin" className="social-link" style={{ fontSize: '0.8rem', opacity: 0.5 }}>Admin</Link>
                    <a href="https://www.instagram.com/rustikop.art/" target="_blank" rel="noopener noreferrer" className="social-link" title="Instagram">
                        <Instagram size={20} />
                    </a>
                    <a href="https://x.com/rustikop" target="_blank" rel="noopener noreferrer" className="social-link" title="Twitter / X">
                        <Twitter size={20} />
                    </a>
                    <a href="https://discord.gg/uaKYcrfyN6" target="_blank" rel="noopener noreferrer" className="social-link" title="Discord">
                        <FaDiscord size={20} />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
