import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Checkout = () => {
    const { cart, currentUser, placeOrder, getCartTotal, promoCodes } = useData();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [shipping, setShipping] = useState({ address: '', city: '', zip: '', country: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    // Promo State
    const [promoInput, setPromoInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoError, setPromoError] = useState('');

    // Success Popup State
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    if (cart.length === 0 && !showSuccessModal) {
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
            setPromoInput('');
        } else {
            setPromoError('Code invalide ou expiré.');
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoInput('');
    }

    const handleStripeCheckout = async () => {
        setIsProcessing(true);
        try {
            const stripe = await stripePromise;

            // 1. Create Checkout Session via our API
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart: cart.map(item => ({
                        ...item,
                        // Apply promo to items proportionally or handle it at session level
                        // For simplicity here, we inject a mock discount item if applied
                        price: appliedPromo ? (item.price * (1 - (appliedPromo.type === 'percent' ? appliedPromo.value / 100 : 0))).toFixed(2) : item.price
                    })),
                    success_url: window.location.origin + '/checkout?success=true',
                    cancel_url: window.location.origin + '/checkout?canceled=true',
                }),
            });

            const session = await response.json();

            if (session.error) {
                alert("Erreur Stripe : " + session.error);
                setIsProcessing(false);
                return;
            }

            // 2. Redirect to Stripe Checkout
            const result = await stripe.redirectToCheckout({
                sessionId: session.id,
            });

            if (result.error) {
                alert(result.error.message);
            }
        } catch (err) {
            console.error(err);
            alert("Une erreur est survenue lors de l'initialisation du paiement.");
        }
        setIsProcessing(false);
    };

    // Handle Success Return
    const query = new URLSearchParams(window.location.search);
    if (query.get('success') && !showSuccessModal) {
        // In a real app, you would verify the session ID with Stripe here
        // For this static repo, we'll finalize the order
        placeOrder(shipping, { id: 'STRIPE_SUCCESS', status: 'COMPLETED' });
        setShowSuccessModal(true);
        // Clear query params to prevent re-triggering
        window.history.replaceState({}, '', '/checkout');
    }

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        navigate('/profile');
    };

    return (
        <div className="page" style={{ paddingTop: '100px', minHeight: '100vh', position: 'relative' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <h1 className="page-title">Finaliser la commande</h1>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                    <span style={{ color: step >= 1 ? 'var(--color-accent)' : '#555' }}>1. Livraison</span>
                    <span style={{ color: step >= 2 ? 'var(--color-accent)' : '#555' }}>2. Paiement & Confirmation</span>
                </div>

                {step === 1 && (
                    <div>
                        <h3>Adresse de livraison</h3>
                        <div className="form-group">
                            <label>Adresse complète</label>
                            <input type="text" value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: 'white' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Ville</label>
                                <input type="text" value={shipping.city} onChange={e => setShipping({ ...shipping, city: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: 'white' }} />
                            </div>
                            <div className="form-group" style={{ width: '100px' }}>
                                <label>Code Postal</label>
                                <input type="text" value={shipping.zip} onChange={e => setShipping({ ...shipping, zip: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: 'white' }} />
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setStep(2)}
                            style={{ marginTop: '1rem' }}
                            disabled={!shipping.address || !shipping.city}
                        >
                            Continuer vers le paiement
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ display: 'grid', gap: '2rem' }}>
                        <div>
                            <h3>Récapitulatif de la commande</h3>
                            <div style={{ background: 'var(--color-surface)', padding: '1.5rem', marginBottom: '1rem' }}>
                                {cart.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>{item.name} x {item.quantity}</span>
                                        <span>{item.price * item.quantity}€</span>
                                    </div>
                                ))}

                                <hr style={{ borderColor: '#333', margin: '1rem 0' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#aaa', marginBottom: '0.5rem' }}>
                                    <span>Sous-total</span>
                                    <span>{getCartTotal()}€</span>
                                </div>

                                {!appliedPromo ? (
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Code Promo"
                                            value={promoInput}
                                            onChange={e => setPromoInput(e.target.value)}
                                            style={{ padding: '0.5rem', background: '#222', border: '1px solid #444', color: 'white', flex: 1 }}
                                        />
                                        <button onClick={handleApplyPromo} className="btn" style={{ padding: '0.5rem 1rem' }}>Appliquer</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', color: 'green' }}>
                                        <span>Code <strong>{appliedPromo.code}</strong> appliqué (-{appliedPromo.value}{appliedPromo.type === 'percent' ? '%' : '€'})</span>
                                        <button onClick={handleRemovePromo} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>Retirer</button>
                                    </div>
                                )}
                                {promoError && <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>{promoError}</p>}

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    <span>Total à payer</span>
                                    <span style={{ color: 'var(--color-accent)' }}>{calculateTotal()}€</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3>Paiement Sécurisé</h3>
                            <button
                                onClick={handleStripeCheckout}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1rem', fontSize: '1.2rem' }}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Chargement...' : 'Payer par Carte Bancaire (Stripe)'}
                            </button>
                            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
                                Paiement 100% sécurisé via Stripe. Aucune donnée bancaire n'est stockée sur nos serveurs.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {showSuccessModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div className="animate-in" style={{ background: '#111', padding: '3rem', width: '90%', maxWidth: '500px', borderRadius: '8px', border: '1px solid var(--color-accent)', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Paiement Validé !</h2>
                        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                            Merci pour votre commande.<br /><br />
                            <strong style={{ color: 'var(--color-accent)' }}>IMPORTANT :</strong><br />
                            Un artiste adapté viendra vite vers vous par email.<br />
                            La conversation se passera exclusivement par ce canal.<br /><br />
                            <span style={{ textDecoration: 'underline', color: 'gold' }}>SURVEILLEZ VOS SPAMS !</span>
                        </p>
                        <button onClick={handleCloseModal} className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>J'ai compris, voir ma commande</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
