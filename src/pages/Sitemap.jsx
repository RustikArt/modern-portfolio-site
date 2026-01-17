import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { Home, Briefcase, ShoppingBag, Mail, User, Shield, FileText, Info, HelpCircle, BookOpen } from 'lucide-react';

const Sitemap = () => {
    const linkStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '0.8rem 1rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '8px',
        color: '#ccc',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        border: '1px solid rgba(255,255,255,0.05)'
    };

    const sectionStyle = {
        marginBottom: '2.5rem'
    };

    const titleStyle = {
        fontSize: '1.2rem',
        marginBottom: '1rem',
        color: 'var(--color-accent)',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1rem'
    };

    return (
        <div className="page" style={{ paddingTop: '120px', minHeight: '100vh' }}>
            <SEO
                title="Plan du Site | Rustikop"
                description="Plan du site Rustikop - Navigation rapide vers toutes les pages du site."
            />
            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h1 className="page-title">Plan du Site</h1>

                <section style={sectionStyle}>
                    <h2 style={titleStyle}>Navigation principale</h2>
                    <div style={gridStyle}>
                        <Link to="/" style={linkStyle} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.02)'}>
                            <Home size={18} /> Accueil
                        </Link>
                        <Link to="/projects" style={linkStyle} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.02)'}>
                            <Briefcase size={18} /> Projets
                        </Link>
                        <Link to="/shop" style={linkStyle} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.02)'}>
                            <ShoppingBag size={18} /> Boutique
                        </Link>
                        <Link to="/contact" style={linkStyle} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.02)'}>
                            <Mail size={18} /> Contact
                        </Link>
                    </div>
                </section>

                <section style={sectionStyle}>
                    <h2 style={titleStyle}>Compte</h2>
                    <div style={gridStyle}>
                        <Link to="/login" style={linkStyle} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.02)'}>
                            <User size={18} /> Connexion
                        </Link>
                        <Link to="/profile" style={linkStyle} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.02)'}>
                            <User size={18} /> Mon Compte
                        </Link>
                        <Link to="/cart" style={linkStyle} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.02)'}>
                            <ShoppingBag size={18} /> Panier
                        </Link>
                        <Link to="/wishlist" style={linkStyle} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.02)'}>
                            <ShoppingBag size={18} /> Wishlist
                        </Link>
                    </div>
                </section>

                <section style={sectionStyle}>
                    <h2 style={titleStyle}>Informations</h2>
                    <div style={gridStyle}>
                        <Link to="/about" style={linkStyle} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.02)'}>
                            <Info size={18} /> À propos
                        </Link>
                        <Link to="/faq" style={linkStyle} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.02)'}>
                            <HelpCircle size={18} /> FAQ
                        </Link>
                        <Link to="/blog" style={linkStyle} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.02)'}>
                            <BookOpen size={18} /> Blog
                        </Link>
                    </div>
                </section>

                <section style={sectionStyle}>
                    <h2 style={titleStyle}>Légal</h2>
                    <div style={gridStyle}>
                        <Link to="/legal" style={linkStyle} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.02)'}>
                            <FileText size={18} /> Mentions Légales
                        </Link>
                        <Link to="/privacy" style={linkStyle} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.02)'}>
                            <Shield size={18} /> Confidentialité
                        </Link>
                        <Link to="/terms" style={linkStyle} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.02)'}>
                            <FileText size={18} /> CGV
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Sitemap;
