import { useState, useEffect, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { X } from 'lucide-react';

const AnnouncementBanner = () => {
    const { announcement } = useData();
    const [isVisible, setIsVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');

    // Generate a unique key based on announcement text to track dismissal
    const getDismissalKey = useCallback(() => {
        if (!announcement?.text) return null;
        return `banner_dismissed_${btoa(encodeURIComponent(announcement.text)).slice(0, 16)}`;
    }, [announcement?.text]);

    // Check dismissal status when announcement changes
    useEffect(() => {
        const key = getDismissalKey();
        if (key) {
            const wasDismissed = localStorage.getItem(key) === 'true';
            setIsVisible(!wasDismissed);
        } else {
            setIsVisible(true);
        }
    }, [getDismissalKey]);

    const handleClose = () => {
        const key = getDismissalKey();
        if (key) {
            localStorage.setItem(key, 'true');
        }
        setIsVisible(false);
    };

    useEffect(() => {
        const height = (announcement && announcement.isActive && isVisible) ? (announcement.height || '56px') : '0px';
        document.documentElement.style.setProperty('--banner-height', height);
    }, [announcement, isVisible]);

    useEffect(() => {
        if (!announcement?.showTimer || !announcement?.timerEnd || !isVisible) return;

        const calculateTimeLeft = () => {
            const difference = +new Date(announcement.timerEnd) - +new Date();
            if (difference > 0) {
                const parts = {
                    d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    h: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    m: Math.floor((difference / 1000 / 60) % 60),
                    s: Math.floor((difference / 1000) % 60)
                };
                return `${parts.d > 0 ? parts.d + 'j ' : ''}${String(parts.h).padStart(2, '0')}h ${String(parts.m).padStart(2, '0')}m ${String(parts.s).padStart(2, '0')}s`;
            }
            return 'EXPIRE';
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        setTimeLeft(calculateTimeLeft());
        return () => clearInterval(timer);
    }, [announcement, isVisible]);

    if (!announcement || !announcement.isActive || !isVisible) {
        return null;
    }

    const bannerStyle = {
        backgroundColor: 'rgba(5, 5, 5, 0.95)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        color: '#ffffff',
        height: announcement.height || '56px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 2001,
        fontSize: '0.95rem',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontWeight: '500',
        textAlign: 'left',
        transition: 'all 0.3s ease',
        gap: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    };

    const closeButtonStyle = {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        color: '#a0a0a0',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1,
        transition: 'all 0.2s ease',
        padding: '0.5rem',
        borderRadius: '6px',
        flexShrink: 0
    };

    // Render text with embedded link using [lien] placeholder
    const renderTextWithLink = () => {
        const text = announcement.text || '';
        const link = announcement.link || '';

        if (link && text.includes('[lien]')) {
            const parts = text.split('[lien]');
            return (
                <span>
                    {parts[0]}
                    <a href={link} style={{ color: 'inherit', textDecoration: 'underline' }}>lien</a>
                    {parts[1] || ''}
                </span>
            );
        } else if (link) {
            // If link exists but no placeholder, make entire text clickable
            return (
                <a href={link} style={{ color: 'inherit', textDecoration: 'underline' }}>
                    {text}
                </a>
            );
        }
        return <span>{text}</span>;
    };

    return (
        <div style={bannerStyle} className="announcement-banner">
            {/* Left: Message content */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ 
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span style={{ color: '#d4af37', fontSize: '1.1rem' }}>✨</span>
                        {renderTextWithLink()}
                    </div>
                    {announcement.subtext && (
                        <div style={{ 
                            fontSize: '0.8rem', 
                            color: '#a0a0a0',
                            lineHeight: '1.3'
                        }}>
                            {announcement.subtext}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Actions */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                flexShrink: 0
            }}>
                {announcement.showTimer && timeLeft !== 'EXPIRE' && (
                    <div style={{ 
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(212, 175, 55, 0.15)',
                        padding: '0.35rem 0.75rem', 
                        borderRadius: '6px', 
                        fontWeight: '500', 
                        fontFamily: 'monospace', 
                        fontSize: '0.8rem',
                        color: '#d4af37'
                    }}>
                        {timeLeft}
                    </div>
                )}

                {announcement.link && (
                    <a href={announcement.link} style={{ 
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: '1px solid rgba(212, 175, 55, 0.25)',
                        padding: '0.4rem 1rem', 
                        borderRadius: '6px', 
                        color: '#d4af37', 
                        textDecoration: 'none', 
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.25)';
                    }}>
                        Lire Plus
                    </a>
                )}

                <button
                    onClick={handleClose}
                    style={closeButtonStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = '#a0a0a0';
                    }}
                    aria-label="Fermer"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default AnnouncementBanner;

