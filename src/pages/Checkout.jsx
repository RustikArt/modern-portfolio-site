import { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
    const { cart, currentUser, placeOrder, getCartTotal, promoCodes } = useData();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [shipping, setShipping] = useState({ address: '', city: '', zip: '', country: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const hasProcessed = useRef(false);

    // Promo State
    const [promoInput, setPromoInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoError, setPromoError] = useState('');

    // Success Popup State
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Handle Success Return from Stripe (Early in component to catch params)
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get('success') && !hasProcessed.current) {
            hasProcessed.current = true;

            // Retrieve shipping details and promo from storage
            const savedShipping = localStorage.getItem('last_shipping');
            const finalShipping = savedShipping ? JSON.parse(savedShipping) : shipping;

            const savedPromo = localStorage.getItem('last_promo');
            const finalPromo = savedPromo ? JSON.parse(savedPromo) : null;

            // Calculate final discounted total
            let finalTotal = getCartTotal();
            if (finalPromo) {
                if (finalPromo.type === 'percent') {
                    finalTotal -= finalTotal * (finalPromo.value / 100);
                } else if (finalPromo.type === 'fixed') {
                    finalTotal -= finalPromo.value;
                }
            }
            finalTotal = Math.max(0, finalTotal).toFixed(2);

            // Mark as success internal state
            setShowSuccessModal(true);

            // Create order with DISCOUNTED total
            placeOrder(finalShipping, { id: 'STRIPE_SUCCESS', status: 'COMPLETED' }, finalTotal);

            // Clean up
            window.history.replaceState({}, '', '/checkout');
            localStorage.removeItem('last_shipping');
            localStorage.removeItem('last_promo');
        }
    }, [getCartTotal, placeOrder, shipping]);

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
        if (appliedPromo) {
            if (appliedPromo.type === 'percent') {
                total -= total * (appliedPromo.value / 100);
            } else if (appliedPromo.type === 'fixed') {
                total -= appliedPromo.value;
            }
        }
        return Math.max(0, total).toFixed(2);
    };

    const handleApplyPromo = () => {
        setPromoError('');
        const code = promoInput.trim().toUpperCase();
        if (!code) return;

        const found = promoCodes.find(c => c.code === code);
        if (found) {
            setAppliedPromo(found);
            localStorage.setItem('last_promo', JSON.stringify(found));
            setPromoInput('');
        } else {
            setPromoError('Code invalide ou expiré.');
        }
    };

    const handleRemovePromo = () => {
        if (appliedPromo) setPromoInput(appliedPromo.code);
        setAppliedPromo(null);
        localStorage.removeItem('last_promo');
    }

    const handleStripeCheckout = async () => {
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

        if (!publishableKey || publishableKey.includes('YOUR_KEY')) {
            alert("Erreur Configuration : La clé Stripe est absente.");
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
                        price: appliedPromo ? (item.price * (1 - (appliedPromo.type === 'percent' ? appliedPromo.value / 100 : 0))).toFixed(2) : item.price,
                        quantity: item.quantity,
                        image: item.image
                    })),
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
            if (appliedPromo) {
                localStorage.setItem('last_promo', JSON.stringify(appliedPromo));
            }
            window.location.href = session.url;

        } catch (err) {
            console.error("Stripe Error:", err);
            alert(`Échec : ${err.message}`);
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
                    <span style={{ color: step >= 1 ? 'var(--color-accent)' : '#555' }}>1. Livraison</span>
                    <span style={{ color: step >= 2 ? 'var(--color-accent)' : '#555' }}>2. Paiement</span>
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
                            style={{ marginTop: '2rem', width: '100%', borderRadius: '30px' }}
                            disabled={!shipping.address || !shipping.city}
                        >
                            Suivant
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

                                {!appliedPromo ? (
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
                                        <span style={{ fontSize: '0.85rem', color: '#4caf50' }}>Coupon <strong>{appliedPromo.code}</strong> (-{appliedPromo.value}{appliedPromo.type === 'percent' ? '%' : '€'})</span>
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
                                    style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', borderRadius: '40px' }}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? 'Connexion à Stripe...' : 'Payer avec Stripe'}
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
                            alignItems: 'center', justifyContent: 'center', fontSize: '3rem',
                            color: 'black', boxShadow: '0 0 40px rgba(var(--color-accent-rgb), 0.4)'
                        }}>✓</div>

                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-1.5px' }}>PAIEMENT RÉUSSI</h2>
                        <p style={{ color: '#888', marginBottom: '1rem', fontSize: '1.1rem' }}>Votre commande a été enregistrée avec succès.</p>
                        <p style={{ color: 'var(--color-accent)', marginBottom: '2.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            ⚠️ PENSEZ À VÉRIFIER VOS MAILS (ET VOS SPAMS)
                        </p>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', textAlign: 'left', marginBottom: '3rem' }}>
                            <div style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1.5px' }}>Confirmation</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                <span>Montant réglé</span>
                                <span style={{ color: 'var(--color-accent)' }}>{calculateTotal()}€</span>
                            </div>
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
