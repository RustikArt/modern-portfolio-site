import { useData } from '../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Sparkles, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import './Cart.css';

const Cart = () => {
    const { cart, removeFromCart, updateCartQuantity, getCartTotal } = useData();
    const navigate = useNavigate();

    const handleQuantityChange = (index, delta) => {
        const item = cart[index];
        const newQty = item.quantity + delta;
        if (newQty > 0) {
            updateCartQuantity(index, newQty);
        } else {
            removeFromCart(index);
        }
    };

    return (
        <div className="page-cart">
            <div className="container">
                {/* Header */}
                <div className="cart-header">
                    <div className="cart-title-group">
                        <div className="cart-icon">
                            <ShoppingBag size={28} />
                        </div>
                        <div>
                            <h1>Mon <span>Panier</span></h1>
                            <p>{cart.length} article{cart.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>

                {cart.length === 0 ? (
                    <div className="cart-empty">
                        <div className="empty-icon">
                            <Sparkles size={48} />
                        </div>
                        <h3>Votre panier est vide</h3>
                        <p>Découvrez nos créations et trouvez votre bonheur</p>
                        <Link to="/shop" className="btn btn-primary">
                            Explorer la boutique <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="cart-layout">
                        {/* Cart Items */}
                        <div className="cart-items">
                            {cart.map((item, index) => {
                                const isLucideIcon = item.image && item.image.startsWith('lucide:');
                                const LucideIcon = isLucideIcon ? LucideIcons[item.image.replace('lucide:', '')] : null;
                                return (
                                <div key={index} className="cart-item">
                                    <div className="cart-item-image">
                                        {isLucideIcon && LucideIcon ? (
                                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(var(--color-accent-rgb), 0.15) 0%, rgba(18, 18, 26, 0.95) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                                                <LucideIcon size={40} color="var(--color-accent)" />
                                            </div>
                                        ) : (
                                            <img src={item.image} alt={item.name} />
                                        )}
                                    </div>
                                    <div className="cart-item-details">
                                        <div className="cart-item-info">
                                            <h3>{item.name}</h3>
                                            {item.options && item.options.length > 0 && (
                                                <p className="cart-item-options">
                                                    {item.options.map(opt => `${opt.name}: ${opt.value}`).join(' • ')}
                                                </p>
                                            )}
                                        </div>
                                        <div className="cart-item-actions">
                                            <div className="quantity-control">
                                                <button 
                                                    className="qty-btn"
                                                    onClick={() => handleQuantityChange(index, -1)}
                                                    aria-label="Diminuer la quantité"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="qty-value">{item.quantity}</span>
                                                <button 
                                                    className="qty-btn"
                                                    onClick={() => handleQuantityChange(index, 1)}
                                                    aria-label="Augmenter la quantité"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <div className="cart-item-price">
                                                {(item.price * item.quantity).toFixed(2)}€
                                            </div>
                                            <button 
                                                className="remove-btn"
                                                onClick={() => removeFromCart(index)}
                                                aria-label="Supprimer l'article"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>

                        {/* Cart Summary */}
                        <div className="cart-summary-wrapper">
                            <div className="cart-summary">
                                <h3>Récapitulatif</h3>
                                
                                <div className="summary-lines">
                                    <div className="summary-line">
                                        <span>Sous-total</span>
                                        <span>{getCartTotal().toFixed(2)}€</span>
                                    </div>
                                    <div className="summary-line">
                                        <span>Livraison</span>
                                        <span className="free">Gratuite</span>
                                    </div>
                                </div>

                                <div className="summary-total">
                                    <span>Total</span>
                                    <span className="total-value">{getCartTotal().toFixed(2)}€</span>
                                </div>

                                <button
                                    className="btn btn-primary checkout-btn"
                                    onClick={() => navigate('/checkout')}
                                >
                                    Passer commande <ArrowRight size={18} />
                                </button>

                                <div className="summary-features">
                                    <div className="feature">
                                        <ShieldCheck size={18} />
                                        <span>Paiement sécurisé</span>
                                    </div>
                                    <div className="feature">
                                        <Truck size={18} />
                                        <span>Livraison rapide</span>
                                    </div>
                                    <div className="feature">
                                        <CreditCard size={18} />
                                        <span>CB, PayPal acceptés</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
