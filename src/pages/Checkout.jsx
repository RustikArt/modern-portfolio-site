import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

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
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

        if (!publishableKey || publishableKey.includes('YOUR_KEY')) {
            alert("Erreur Configuration : La clé Stripe (VITE_STRIPE_PUBLISHABLE_KEY) est absente dans vos paramètres Vercel ou votre fichier .env.");
            return;
        }

        setIsProcessing(true);
        try {
            console.log("Démarrage du paiement Stripe...");

            // 1. Create Checkout Session
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart: cart.map(item => ({
                        name: item.name,
                        price: appliedPromo ? (item.price * (1 - (appliedPromo.type === 'percent' ? appliedPromo.value / 100 : 0))).toFixed(2) : item.price,
                        quantity: item.quantity,
                        image: item.image // Server will sanitize this
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
            console.log("Session Stripe créée :", session.id);

            // 2. Save shipping info to localStorage before redirect
            localStorage.setItem('last_shipping', JSON.stringify(shipping));

            // 3. Redirect to Stripe (Modern Way)
            console.log("Redirection vers Stripe...");
            window.location.href = session.url;

        } catch (err) {
            console.error("Détails de l'erreur Stripe:", err);
            alert(`Échec du paiement : ${err.message}\n\nConseil : Vérifiez vos clés secrètes dans les paramètres Vercel.`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle Success Return from Stripe
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get('success') && !showSuccessModal) {
            // Retrieve shipping details from storage if they were saved before redirect
            const savedShipping = localStorage.getItem('last_shipping');
            const finalShipping = savedShipping ? JSON.parse(savedShipping) : shipping;

            placeOrder(finalShipping, { id: 'STRIPE_SUCCESS', status: 'COMPLETED' });
            setShowSuccessModal(true);

            // Clean up
            window.history.replaceState({}, '', '/checkout');
            localStorage.removeItem('last_shipping');
        }
    }, []); // Run once on mount

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
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div className="glass animate-in" style={{
                        padding: '3rem',
                        width: '90%',
                        maxWidth: '600px',
                        borderRadius: '20px',
                        textAlign: 'center',
                        animation: 'popIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'var(--color-accent)',
                            borderRadius: '50%',
                            margin: '0 auto 2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            color: 'black',
                            boxShadow: '0 0 30px var(--color-accent-glow)'
                        }}>
                            ✓
                        </div>

                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '-1px' }}>Merci pour votre confiance</h2>
                        <p style={{ color: '#aaa', marginBottom: '2rem' }}>Votre projet commence maintenant.</p>

                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', textAlign: 'left', marginBottom: '2rem' }}>
                            <p style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Récapitulatif</p>
                            {cart.map((item, id) => (
                                <div key={id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#eee' }}>{item.name} x{item.quantity}</span>
                                    <span style={{ fontWeight: 'bold' }}>{item.price * item.quantity}€</span>
                                </div>
                            ))}
                            <div style={{ borderTop: '1px solid #333', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                <span>Total Payé</span>
                                <span style={{ color: 'var(--color-accent)' }}>{calculateTotal()}€</span>
                            </div>
                        </div>

                        <p style={{ fontSize: '1rem', marginBottom: '2rem', lineHeight: '1.6', color: '#ccc' }}>
                            <strong style={{ color: 'var(--color-accent)' }}>PROCHAINE ÉTAPE :</strong><br />
                            Un créatif va analyser votre demande. <br />
                            Tout se passera désormais par email.<br />
                            <span style={{ color: '#d4af37', fontWeight: 'bold' }}>⚠️ Vérifiez vos SPAMS d'ici quelques heures.</span>
                        </p>

                        <button onClick={handleCloseModal} className="btn btn-primary" style={{ width: '100%', borderRadius: '40px', py: '1.5rem' }}>
                            Accéder à mon espace client
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
