import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-left">
                    <p>&copy; {year} Portfolio.</p>
                </div>
                <div className="footer-right">
                    <Link to="/admin" className="social-link" style={{ fontSize: '0.8rem', opacity: 0.5 }}>Admin</Link>
                    <a href="https://www.instagram.com/rustikop.art/" target="_blank" className="social-link">Instagram</a>
                    <a href="https://x.com/rustikop" target="_blank" className="social-link">Twitter</a>
                    <a href="#" className="social-link">A venir...</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;