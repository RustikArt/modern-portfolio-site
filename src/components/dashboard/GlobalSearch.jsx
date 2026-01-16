import { useState, useEffect, useRef } from 'react';
import { Search, Package, ShoppingBag, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = ({ data }) => {
    const { products, orders, users } = data;
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const newResults = [];

        // Search Orders
        orders.forEach(order => {
            if (order.id.toString().includes(lowerQuery) ||
                order.customerName.toLowerCase().includes(lowerQuery) ||
                order.email.toLowerCase().includes(lowerQuery)) {
                newResults.push({ type: 'order', item: order, label: `Commande #${order.id} - ${order.customerName}` });
            }
        });

        // Search Products
        products.forEach(product => {
            if (product.name.toLowerCase().includes(lowerQuery)) {
                newResults.push({ type: 'product', item: product, label: product.name });
            }
        });

        // Search Users
        users.forEach(user => {
            if (user.name.toLowerCase().includes(lowerQuery) || user.email.toLowerCase().includes(lowerQuery)) {
                newResults.push({ type: 'user', item: user, label: user.name });
            }
        });

        setResults(newResults.slice(0, 5)); // Limit to 5 results
        setIsOpen(true);
    }, [query, orders, products, users]);

    const handleSelect = (result) => {
        // Here we could emit an event to the parent to switch tab and highlight item
        // For now, let's just log it or maybe setup a callback prop if needed
        // Ideally: onNavigate(result.type, result.item.id)
        console.log('Selected:', result);
        setIsOpen(false);
        setQuery('');
        // This part would ideally be connected to the Dashboard's state to switch tabs
    };

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }} ref={searchRef}>
            <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                    type="text"
                    placeholder="Recherche globale (Cmd, Produit, Client)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        padding: '0.6rem 1rem 0.6rem 2.5rem',
                        color: 'white',
                        outline: 'none',
                        fontSize: '0.9rem'
                    }}
                />
            </div>

            {isOpen && results.length > 0 && (
                <div className="glass animate-in" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.5rem',
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    zIndex: 100,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                    {results.map((res, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleSelect(res)}
                            style={{
                                padding: '0.8rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem',
                                cursor: 'pointer',
                                borderBottom: idx !== results.length - 1 ? '1px solid #222' : 'none',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#252525'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <span style={{ color: 'var(--color-accent)' }}>
                                {res.type === 'order' && <Package size={16} />}
                                {res.type === 'product' && <ShoppingBag size={16} />}
                                {res.type === 'user' && <User size={16} />}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: '#ddd' }}>{res.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
