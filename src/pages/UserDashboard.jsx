import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
    const { currentUser, orders, logout } = useData();
    const navigate = useNavigate();

    if (!currentUser) {
        navigate('/login');
        return null;
    }

    // Filter orders for current user
    const myOrders = orders.filter(o => o.userId === currentUser.id);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Réception': return '#ff4d4d';
            case 'En cours': return '#ffd700';
            case 'Terminé': return '#4caf50';
            default: return 'var(--color-accent)';
        }
    };

    return (
        <div className="page" style={{ paddingTop: '100px', minHeight: '100vh', background: '#080808' }}>
            <div className="container" style={{ maxWidth: '900px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid #222', paddingBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.2rem', letterSpacing: '-1px' }}>Espace Client</h1>
                        <p style={{ color: '#888' }}>Ravi de vous revoir, <strong style={{ color: 'white' }}>{currentUser.name}</strong></p>
                    </div>
                    <button onClick={handleLogout} className="btn" style={{ fontSize: '0.9rem' }}>Déconnexion</button>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📦</span> Mes Commandes
                    </h3>

                    {myOrders.length === 0 ? (
                        <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '12px' }}>
                            <p style={{ color: '#666', marginBottom: '1.5rem' }}>Vous n'avez pas encore passé de commande.</p>
                            <button className="btn btn-primary" onClick={() => navigate('/shop')}>Visiter la boutique</button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            {myOrders.map(order => (
                                <div key={order.id} className="glass" style={{
                                    padding: '2rem',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    transition: 'transform 0.3s ease'
                                }}>
                                    {/* Order Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                        <div>
                                            <span style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Commande #{order.id.slice(-6)}</span>
                                            <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.2rem' }}>
                                                Passée le {new Date(order.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                background: getStatusColor(order.status),
                                                color: 'black',
                                                padding: '0.4rem 1rem',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase'
                                            }}>
                                                {order.status}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Checklist Progress for Client */}
                                    <div style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <p style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.2rem' }}>Suivi de production</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                            {(order.checklist || []).map((step, idx) => (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', opacity: step.completed ? 1 : 0.4 }}>
                                                    <div style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        background: step.completed ? '#4caf50' : '#222',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px',
                                                        color: 'white'
                                                    }}>
                                                        {step.completed ? '✓' : idx + 1}
                                                    </div>
                                                    <span style={{ fontSize: '0.85rem', color: step.completed ? '#eee' : '#666' }}>{step.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Items & Total */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#aaa' }}>
                                            {order.items.length} produit(s)
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ color: '#666', fontSize: '0.8rem', marginRight: '0.5rem' }}>Total payé:</span>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>{order.total}€</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
