import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'accepted');
        // Dispatch event to enable analytics
        window.dispatchEvent(new Event('cookie_consent_changed'));
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'declined');
        // Dispatch event to ensure analytics stays disabled
        window.dispatchEvent(new Event('cookie_consent_changed'));
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            right: '20px',
            maxWidth: '600px',
            background: 'rgba(5, 5, 5, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '1.5rem',
            borderRadius: '12px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <Shield size={24} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Confidentialité et Cookies</h3>
                    <p style={{ fontSize: '0.9rem', color: '#ccc', lineHeight: '1.5' }}>
                        Nous utilisons des cookies d'analyse (Vercel Analytics) pour comprendre comment notre site est utilisé.
                        Ces données sont anonymisées et ne sont jamais vendues. 
                        <a href="/privacy" style={{ color: 'var(--color-accent)', marginLeft: '4px' }}>Politique de Confidentialité</a>
                    </p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                    onClick={handleDecline}
                    style={{
                        padding: '0.6rem 1.2rem',
                        background: 'transparent',
                        border: '1px solid #444',
                        color: '#fff',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    Refuser
                </button>
                <button
                    onClick={handleAccept}
                    style={{
                        padding: '0.6rem 1.2rem',
                        background: 'var(--color-accent)',
                        border: 'none',
                        color: '#000',
                        fontWeight: 'bold',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    Accepter
                </button>
            </div>
        </div>
    );
};

export default CookieConsent;
