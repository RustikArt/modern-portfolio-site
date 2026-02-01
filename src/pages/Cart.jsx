import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Sparkles, ShieldCheck, Truck, CreditCard, Zap, Clock, Crown, Check, Info } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import './Cart.css';

// Delivery tiers configuration
const DELIVERY_TIERS = [
    {
        id: 'standard',
        name: 'Livraison Normale',
        description: 'Délai standard de traitement',
        delay: '5-7 jours ouvrés',
        price: 0,
        icon: Clock,
        color: '#888'
    },
    {
        id: 'priority',
        name: 'Livraison Prioritaire',
        description: 'Traitement accéléré',
        delay: '2-3 jours ouvrés',
        price: 9.99,
        icon: Zap,
        color: '#f0a'
    },
    {
        id: 'professional',
        name: 'Livraison Pro',
        description: 'Priorité maximale + support dédié',
        delay: '24-48h',
        price: 24.99,
        icon: Crown,
        color: 'var(--color-accent)',
        badge: 'Recommandé'
    }
];

const Cart = () => {
    const { cart, removeFromCart, updateCartQuantity, getCartTotal, selectedDelivery, setSelectedDelivery } = useData();
    const navigate = useNavigate();
    const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);

    const handleQuantityChange = (index, delta) => {
        const item = cart[index];
        const newQty = item.quantity + delta;
        if (newQty > 0) {
            updateCartQuantity(index, newQty);
        } else {
            removeFromCart(index);
        }
    };

    const currentDelivery = DELIVERY_TIERS.find(t => t.id === selectedDelivery) || DELIVERY_TIERS[0];
    const subtotal = getCartTotal();
    const total = subtotal + currentDelivery.price;

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
                                
                                {/* Delivery Tier Selector */}
                                <div className="delivery-selector">
                                    <div className="delivery-header">
                                        <h4>
                                            <Truck size={16} />
                                            Mode de livraison
                                        </h4>
                                        <button 
                                            className="info-btn"
                                            onClick={() => setShowDeliveryInfo(!showDeliveryInfo)}
                                            aria-label="Informations livraison"
                                        >
                                            <Info size={14} />
                                        </button>
                                    </div>
                                    
                                    {showDeliveryInfo && (
                                        <div className="delivery-info-tooltip">
                                            <p>Les délais sont indicatifs et peuvent varier selon la complexité de votre commande.</p>
                                        </div>
                                    )}
                                    
                                    <div className="delivery-options">
                                        {DELIVERY_TIERS.map(tier => {
                                            const Icon = tier.icon;
                                            const isSelected = selectedDelivery === tier.id;
                                            return (
                                                <button
                                                    key={tier.id}
                                                    className={`delivery-option ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => setSelectedDelivery(tier.id)}
                                                    style={{ '--tier-color': tier.color }}
                                                >
                                                    <div className="option-radio">
                                                        {isSelected && <Check size={12} />}
                                                    </div>
                                                    <div className="option-icon">
                                                        <Icon size={18} />
                                                    </div>
                                                    <div className="option-content">
                                                        <div className="option-header">
                                                            <span className="option-name">{tier.name}</span>
                                                            {tier.badge && <span className="option-badge">{tier.badge}</span>}
                                                        </div>
                                                        <span className="option-delay">{tier.delay}</span>
                                                    </div>
                                                    <div className="option-price">
                                                        {tier.price === 0 ? 'Gratuit' : `+${tier.price.toFixed(2)}€`}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="summary-lines">
                                    <div className="summary-line">
                                        <span>Sous-total</span>
                                        <span>{subtotal.toFixed(2)}€</span>
                                    </div>
                                    <div className="summary-line">
                                        <span>Livraison ({currentDelivery.name})</span>
                                        <span className={currentDelivery.price === 0 ? 'free' : ''}>
                                            {currentDelivery.price === 0 ? 'Gratuite' : `${currentDelivery.price.toFixed(2)}€`}
                                        </span>
                                    </div>
                                </div>

                                <div className="summary-total">
                                    <span>Total</span>
                                    <span className="total-value">{total.toFixed(2)}€</span>
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
                                        <span>Suivi en temps réel</span>
                                    </div>
                                    <div className="feature">
                                        <CreditCard size={18} />
                                        <span>CB, PayPal acceptés</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Custom Order CTA */}
                            <div className="custom-order-cta">
                                <div className="cta-icon">
                                    <Sparkles size={20} />
                                </div>
                                <div className="cta-content">
                                    <h4>Besoin d'un projet sur-mesure ?</h4>
                                    <p>Décrivez votre projet et recevez un devis personnalisé</p>
                                </div>
                                <Link to="/custom-order" className="btn btn-outline-accent">
                                    Demander un devis
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
