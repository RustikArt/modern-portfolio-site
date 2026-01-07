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

    return (
        <div className="page" style={{ paddingTop: '100px', minHeight: '100vh' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Mon Compte</h1>
                        <p style={{ color: '#888' }}>Bonjour, {currentUser.name}</p>
                    </div>
                    <button onClick={handleLogout} className="btn">Déconnexion</button>
                </div>

                <h3>Mes Commandes</h3>
                {myOrders.length === 0 ? (
                    <p>Vous n'avez pas encore passé de commande.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                        {myOrders.map(order => (
                            <div key={order.id} style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '4px', border: '1px solid #333' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ color: '#888' }}>Commande #{order.id}</span>
                                    <span style={{
                                        color: order.status === 'Expédié' ? '#4CAF50' :
                                            order.status === 'En attente' ? '#FFC107' : 'white',
                                        fontWeight: 'bold'
                                    }}>
                                        {order.status}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    {new Date(order.date).toLocaleDateString()}
                                </div>
                                <div>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#ccc' }}>
                                            <span>{item.name} x {item.quantity}</span>
                                            <span>{item.price}€</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '1rem', borderTop: '1px solid #333', paddingTop: '1rem', textAlign: 'right' }}>
                                    <strong>Total: {order.total}€</strong>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
