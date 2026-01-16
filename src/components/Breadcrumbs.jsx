import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ lastItemName }) => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);

    // Don't show on home page
    if (pathnames.length === 0) return null;

    return (
        <nav aria-label="Fil d'Ariane" style={{ marginBottom: '2rem', fontSize: '0.9rem', color: '#888' }}>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <li style={{ display: 'flex', alignItems: 'center' }}>
                    <Link to="/" style={{ color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#888'}>
                        <Home size={14} /> Accueil
                    </Link>
                </li>
                {pathnames.map((value, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;

                    // Customize names (optional mapping)
                    let displayName = value;
                    if (value === 'shop') displayName = 'Boutique';
                    if (value === 'projects') displayName = 'Portfolio';
                    if (value === 'product') displayName = 'Produit';
                    if (value === 'project') displayName = 'Projet';

                    // If last item and custom name provided, use it
                    if (isLast && lastItemName) displayName = lastItemName;

                    return (
                        <li key={to} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ChevronRight size={14} color="#444" />
                            {isLast ? (
                                <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', textTransform: 'capitalize' }} aria-current="page">
                                    {displayName}
                                </span>
                            ) : (
                                <Link to={to} style={{ color: '#888', textDecoration: 'none', textTransform: 'capitalize', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#888'}>
                                    {displayName}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
