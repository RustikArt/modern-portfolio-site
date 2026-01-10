import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { X } from 'lucide-react';

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
            console.log('AnnouncementBanner: dismissal key found:', key, 'dismissed:', dismissed);
            return !dismissed;
        }
        console.log('AnnouncementBanner: no dismissal key, showing banner');
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
        console.log('AnnouncementBanner: announcement state changed:', announcement);
        const height = (announcement && announcement.isActive && isVisible) ? (announcement.height || '40px') : '0px';
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
        console.log('AnnouncementBanner: text changed, resetting visibility');
        const key = getDismissalKey();
        if (key && localStorage.getItem(key) !== 'true') {
            console.log('AnnouncementBanner: setting visible to true');
            setIsVisible(true);
        } else if (key) {
            console.log('AnnouncementBanner: banner was dismissed, clearing dismissal and showing');
            localStorage.removeItem(key);
            setIsVisible(true);
        }
    }, [announcement?.text]);

    console.log('AnnouncementBanner render:', { announcement, isVisible });

    if (!announcement || !announcement.isActive || !isVisible) {
        console.log('AnnouncementBanner: not rendering - conditions not met');
        console.log('AnnouncementBanner: announcement:', announcement);
        console.log('AnnouncementBanner: isActive:', announcement?.isActive);
        console.log('AnnouncementBanner: isVisible:', isVisible);
        return null;
    }

    const bannerStyle = {
        backgroundColor: announcement.bgColor || '#d4af37',
        color: announcement.textColor || '#000',
        height: announcement.height || '40px',
        fontWeight: announcement.fontWeight || 'normal',
        fontStyle: announcement.fontStyle || 'normal',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 3rem',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 2001,
        fontSize: '0.85rem',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        gap: '1rem'
    };

    const closeButtonStyle = {
        position: 'absolute',
        right: '1rem',
        background: 'none',
        border: 'none',
        color: 'inherit',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.7,
        transition: 'opacity 0.2s'
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
            <button
                onClick={handleClose}
                style={closeButtonStyle}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                aria-label="Fermer"
            >
                <X size={16} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {renderTextWithLink()}
                {announcement.showTimer && timeLeft !== 'EXPIRE' && (
                    <span style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                        {timeLeft}
                    </span>
                )}
            </div>
        </div>
    );
};

export default AnnouncementBanner;

