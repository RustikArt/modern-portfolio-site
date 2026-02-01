import { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    CreditCard,
    Truck,
    ShoppingBag,
    Tag,
    ArrowRight,
    Loader2,
    Monitor
} from 'lucide-react';

const Checkout = () => {
    const { cart, currentUser, getCartTotal, promoCodes, applyPromoCode, activePromo, clearCart } = useData();
    const navigate = useNavigate();
    const [shipping, setShipping] = useState({ address: '', city: '', zip: '', country: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const hasProcessed = useRef(false);

    // Check if all products are digital (skip shipping step)
    const allDigital = useMemo(() => {
        return cart.every(item => item.isDigital === true || item.is_digital === true);
    }, [cart]);

    // Start at step 2 if all digital, otherwise step 1
    const [step, setStep] = useState(1);

    // Auto-skip to payment if all digital
    useEffect(() => {
        if (allDigital && step === 1 && !hasProcessed.current) {
            setStep(2);
        }
    }, [allDigital, step]);

    // Promo State
    const [promoInput, setPromoInput] = useState('');
    const [promoError, setPromoError] = useState('');

    // Success Popup State
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Handle Success Return from Stripe (Early in component to catch params)
    // NOTE: La création de commande est gérée par le webhook Stripe (stripe-webhook.js)
    // Ici on affiche seulement la confirmation et on nettoie le panier
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get('success') && !hasProcessed.current) {
            hasProcessed.current = true;

            // Mark as success internal state
            setShowSuccessModal(true);

            // Clear cart after successful payment (order is created by webhook)
            clearCart();

            // Clear promo code
            if (activePromo) {
                applyPromoCode('');
            }

            // Clean up URL and local storage
            window.history.replaceState({}, '', '/checkout');
            localStorage.removeItem('last_shipping');
        }
    }, [clearCart, applyPromoCode, activePromo]);

    if (cart.length === 0 && !showSuccessModal && !hasProcessed.current) {
        return (
            <div className="page" style={{ paddingTop: '100px', textAlign: 'center' }}>
                <h2>Votre panier est vide.</h2>
                <button className="btn btn-primary" onClick={() => navigate('/shop')}>Retourner à la boutique</button>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="page" style={{ paddingTop: '100px', textAlign: 'center' }}>
                <h2>Vous devez être connecté pour commander.</h2>
                <button className="btn btn-primary" onClick={() => navigate('/login')}>Se connecter / S'inscrire</button>
            </div>
        );
    }

    const calculateTotal = () => {
        let total = getCartTotal();
        if (activePromo) {
            if (activePromo.type === 'percent') {
                total -= total * (activePromo.value / 100);
            } else if (activePromo.type === 'fixed') {
                total -= activePromo.value;
            }
        }
        return Math.max(0, total).toFixed(2);
    };

    const handleApplyPromo = () => {
        setPromoError('');
        const code = promoInput.trim().toUpperCase();
        if (!code) return;

        if (applyPromoCode(code)) {
            setPromoInput('');
        }
    };

    const handleRemovePromo = () => {
        applyPromoCode(''); // Passing empty or invalid clears it
    }

    const handleStripeCheckout = async () => {
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

        if (!publishableKey || publishableKey.includes('YOUR_KEY')) {
            alert("Le système de paiement est actuellement en maintenance. Veuillez réessayer plus tard.");
            return;
        }

        setIsProcessing(true);
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart: cart.map(item => ({
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.image
                    })),
                    promo: activePromo ? {
                        code: activePromo.code,
                        type: activePromo.type,
                        value: activePromo.value
                    } : null,
                    success_url: window.location.origin + '/checkout?success=true',
                    cancel_url: window.location.origin + '/checkout?canceled=true',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erreur Serveur (${response.status})`);
            }

            const session = await response.json();
            localStorage.setItem('last_shipping', JSON.stringify(shipping));
            // activePromo is persisted by Context
            window.location.href = session.url;

        } catch (err) {
            console.error("Stripe Error:", err);
            alert(`Une erreur est survenue lors du paiement : ${err.message}. Veuillez vérifier vos informations.`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        navigate('/profile');
    };

    return (
        <div className="page" style={{ paddingTop: '100px', minHeight: '100vh', position: 'relative' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <h1 className="page-title">Finalisation de commande</h1>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                    {!allDigital ? (
                        <>
                            <span style={{ color: step >= 1 ? 'var(--color-accent)' : '#555', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Truck size={18} /> 1. Livraison
                            </span>
                            <span style={{ color: step >= 2 ? 'var(--color-accent)' : '#555', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CreditCard size={18} /> 2. Paiement
                            </span>
                        </>
                    ) : (
                        <span style={{ color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
                            <Monitor size={18} /> Produits digitaux - Livraison instantanée
                        </span>
                    )}
                </div>

                {step === 1 && !showSuccessModal && (
                    <div className="animate-in">
                        <h3>Adresse de livraison</h3>
                        <div className="form-group" style={{ marginTop: '1.5rem' }}>
                            <label>Adresse complète</label>
                            <input type="text" value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Ville</label>
                                <input type="text" value={shipping.city} onChange={e => setShipping({ ...shipping, city: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
                            </div>
                            <div className="form-group" style={{ width: '150px' }}>
                                <label>Code Postal</label>
                                <input type="text" value={shipping.zip} onChange={e => setShipping({ ...shipping, zip: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setStep(2)}
                            style={{ marginTop: '2rem', width: '100%', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}
                            disabled={!shipping.address || !shipping.city}
                        >
                            Suivant <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {step === 2 && !showSuccessModal && (
                    <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div>
                            <h3>Votre Panier</h3>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222', marginTop: '1rem' }}>
                                {cart.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
                                        <span>{item.name} x {item.quantity}</span>
                                        <span>{(item.price * item.quantity).toFixed(2)}€</span>
                                    </div>
                                ))}

                                <hr style={{ borderColor: '#222', margin: '1rem 0' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
                                    <span>Sous-total</span>
                                    <span>{getCartTotal().toFixed(2)}€</span>
                                </div>

                                {!activePromo ? (
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Code Promo"
                                            value={promoInput}
                                            onChange={e => setPromoInput(e.target.value)}
                                            style={{ padding: '0.6rem', background: '#111', border: '1px solid #333', color: 'white', flex: 1, borderRadius: '6px' }}
                                        />
                                        <button onClick={handleApplyPromo} className="btn" style={{ padding: '0.6rem 1rem' }}>Ok</button>
                                    </div>
                                ) : (
                                    <div style={{ background: 'rgba(76, 175, 80, 0.1)', padding: '0.8rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#4caf50' }}>Coupon <strong>{activePromo.code}</strong> (-{activePromo.value}{activePromo.type === 'percent' ? '%' : '€'})</span>

                                        <button onClick={handleRemovePromo} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>Retirer</button>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: '900' }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--color-accent)' }}>{calculateTotal()}€</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3>Paiement</h3>
                            <div style={{ marginTop: '1.5rem' }}>
                                <button
                                    onClick={handleStripeCheckout}
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} /> Connexion à Stripe...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard size={20} /> Payer avec Stripe
                                        </>
                                    )}
                                </button>
                                <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#444', textAlign: 'center', lineHeight: '1.4' }}>
                                    SSL Sécurisé. Règlement par carte bancaire. <br />
                                    Plateforme certifiée PCI-DSS.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Success Modal */}
            {showSuccessModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(5,5,5,0.95)', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(20px)'
                }}>
                    <div className="glass" style={{
                        padding: '4rem', width: '90%', maxWidth: '600px', borderRadius: '24px',
                        textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{
                            width: '100px', height: '100px', background: 'var(--color-accent)',
                            borderRadius: '50%', margin: '0 auto 2.5rem', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: 'black', boxShadow: '0 0 40px rgba(var(--color-accent-rgb), 0.4)'
                        }}>
                            <CheckCircle2 size={64} />
                        </div>

                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-1.5px' }}>PAIEMENT RÉUSSI</h2>
                        <p style={{ color: '#888', marginBottom: '1rem', fontSize: '1.1rem' }}>Votre commande a été enregistrée avec succès.</p>
                        <p style={{ color: 'var(--color-accent)', marginBottom: '3rem', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <AlertTriangle size={16} /> PENSEZ À VÉRIFIER VOS MAILS (ET VOS SPAMS)
                        </p>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', textAlign: 'left', marginBottom: '3rem' }}>
                            <div style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1.5px' }}>Confirmation</div>
                            <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                Un email de confirmation vous a été envoyé. Vous pouvez suivre votre commande depuis votre espace client.
                            </p>
                        </div>

                        <button onClick={handleCloseModal} className="btn btn-primary" style={{ width: '100%', borderRadius: '40px', padding: '1.2rem', fontWeight: 'bold', fontSize: '1rem' }}>
                            ACCÉDER AU SUIVI DE PRODUCTION
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
