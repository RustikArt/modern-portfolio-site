import { Link } from 'react-router-dom';
import { Instagram, Twitter, MessageCircle, Settings } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import { useData } from '../context/DataContext';
import './Footer.css';

const Footer = () => {
    const { currentUser } = useData();
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-left">
                    <p>&copy; {year} Rustikop.</p>
                </div>
                <div className="footer-right">
                    <a href="https://www.instagram.com/rustikop.art/" target="_blank" rel="noopener noreferrer" className="social-link" title="Instagram">
                        <Instagram size={20} />
                    </a>
                    <a href="https://x.com/rustikop" target="_blank" rel="noopener noreferrer" className="social-link" title="Twitter / X">
                        <Twitter size={20} />
                    </a>
                    <a href="https://discord.gg/uaKYcrfyN6" target="_blank" rel="noopener noreferrer" className="social-link" title="Discord">
                        <FaDiscord size={20} />
                    </a>
                    {currentUser?.role === 'admin' && (
                        <Link to="/admin" className="social-link" style={{ marginLeft: '1rem' }} title="Admin">
                            <Settings size={20} />
                        </Link>
                    )}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
