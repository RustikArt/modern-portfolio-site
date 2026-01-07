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
                    <a href="#" className="social-link">Instagram</a>
                    <a href="#" className="social-link">Twitter</a>
                    <a href="#" className="social-link">LinkedIn</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
