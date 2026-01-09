import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { X } from 'lucide-react';

const AnnouncementBanner = () => {
    const { announcement } = useData();
    const [isVisible, setIsVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
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

    if (!announcement || !announcement.isActive || !isVisible) return null;

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
        left: '1rem',
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

    const content = announcement.link ? (
        <a href={announcement.link} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ textDecoration: 'underline' }}>{announcement.text}</span>
            {announcement.showTimer && timeLeft !== 'EXPIRE' && (
                <span style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {timeLeft}
                </span>
            )}
        </a>
    ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>{announcement.text}</span>
            {announcement.showTimer && timeLeft !== 'EXPIRE' && (
                <span style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {timeLeft}
                </span>
            )}
        </div>
    );

    return (
        <div style={bannerStyle} className="announcement-banner">
            <button
                onClick={() => setIsVisible(false)}
                style={closeButtonStyle}
                onMouseEnter={(e) => e.target.style.opacity = 1}
                onMouseLeave={(e) => e.target.style.opacity = 0.7}
                aria-label="Fermer"
            >
                <X size={16} />
            </button>
            {content}
        </div>
    );
};

export default AnnouncementBanner;
