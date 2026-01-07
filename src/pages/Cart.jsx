import { useData } from '../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cart, removeFromCart, getCartTotal } = useData();
    const navigate = useNavigate();

    return (
        <div className="page page-cart" style={{ paddingTop: '100px', minHeight: '80vh' }}>
            <div className="container">
                <h1 className="page-title">Votre Panier</h1>

                {cart.length === 0 ? (
                    <div>
                        <p>Votre panier est vide.</p>
                        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1rem' }}>Retourner à la boutique</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                        <div className="cart-items">
                            {cart.map((item, index) => (
                                <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '1rem', background: 'var(--color-surface)', borderRadius: '4px' }}>
                                    <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                                    <div style={{ flex: 1 }}>
                                        <h3>{item.name}</h3>
                                        {item.options && item.options.length > 0 && (
                                            <p style={{ fontSize: '0.8rem', color: '#888' }}>
                                                {item.options.map(opt => `${opt.name}: ${opt.value}`).join(', ')}
                                            </p>
                                        )}
                                        <p style={{ color: 'var(--color-accent)' }}>{item.price}€ x {item.quantity}</p>
                                    </div>
                                    <button onClick={() => removeFromCart(index)} style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer' }}>
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary" style={{ background: 'var(--color-surface)', padding: '1.5rem', height: 'fit-content' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Résumé</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span>Total</span>
                                <span style={{ fontSize: '1.2rem', color: 'var(--color-accent)' }}>{getCartTotal()}€</span>
                            </div>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                                onClick={() => navigate('/checkout')}
                            >
                                Commander
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
