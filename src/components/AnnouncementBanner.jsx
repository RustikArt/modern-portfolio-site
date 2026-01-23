import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { X } from 'lucide-react';
import Logo from '../assets/Logos/OrangeNoir.png';

const AnnouncementBanner = () => {
    const { announcement } = useData();

    // Generate a unique key based on announcement text to track dismissal
    const getDismissalKey = () => {
        if (!announcement?.text) return null;
        return `banner_dismissed_${btoa(encodeURIComponent(announcement.text)).slice(0, 16)}`;
    };

    const [isVisible, setIsVisible] = useState(() => {
        const key = getDismissalKey();
        if (key) {
            const dismissed = localStorage.getItem(key) === 'true';
            return !dismissed;
        }
        return true;
    });
    const [timeLeft, setTimeLeft] = useState('');

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

    // Reset visibility when announcement text changes
    useEffect(() => {
        const key = getDismissalKey();
        if (key && localStorage.getItem(key) !== 'true') {
            setIsVisible(true);
        } else if (key) {
            localStorage.removeItem(key);
            setIsVisible(true);
        }
    }, [announcement?.text]);

    if (!announcement || !announcement.isActive || !isVisible) {
        return null;
    }

    const bannerStyle = {
        backgroundColor: announcement.bgColor ? `${announcement.bgColor}cc` : 'rgba(212, 175, 55, 0.9)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        color: announcement.textColor || '#111',
        height: announcement.height || '56px',
        fontWeight: announcement.fontWeight || '700',
        fontStyle: announcement.fontStyle || 'normal',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 2001,
        fontSize: '0.95rem',
        textAlign: 'left',
        transition: 'all 0.3s ease',
        gap: '1rem',
        boxShadow: '0 6px 30px rgba(0, 0, 0, 0.12)',
        borderBottom: '1px solid rgba(0,0,0,0.08)'
    };

    const closeButtonStyle = {
        background: 'none',
        border: 'none',
        color: 'inherit',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.8,
        transition: 'opacity 0.2s',
        padding: '0.4rem',
        borderRadius: '6px'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={Logo} alt="logo" style={{ height: '36px', width: 'auto', marginRight: '0.5rem' }} />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                    <div style={{ fontWeight: '700' }}>{renderTextWithLink()}</div>
                    {announcement.subtext && <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)' }}>{announcement.subtext}</div>}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {announcement.showTimer && timeLeft !== 'EXPIRE' && (
                    <span style={{ background: 'rgba(0,0,0,0.06)', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {timeLeft}
                    </span>
                )}

                {announcement.link && (
                    <a href={announcement.link} style={{ background: 'rgba(0,0,0,0.08)', padding: '8px 12px', borderRadius: '8px', color: 'inherit', textDecoration: 'none', fontWeight: '700' }}>
                        Voir
                    </a>
                )}

                <button
                    onClick={handleClose}
                    style={closeButtonStyle}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}
                    aria-label="Fermer"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default AnnouncementBanner;

