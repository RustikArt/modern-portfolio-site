/**
 * SiteBanner - Announcement Banner Component
 * Displays a dismissible banner at the top of the site
 * 
 * Features:
 * - Countdown timer support
 * - Custom icons via Lucide
 * - Dismissible with localStorage persistence
 * - Dynamic height adjustment
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { X, Sparkles, Star, Bell, Gift, Tag, Percent, ShoppingBag, Truck, Clock, AlertCircle, Info, Megaphone, Flame, Crown, Trophy, Rocket, Zap, Heart } from 'lucide-react';

// Icon mapping
const ICONS = {
    Sparkles, Star, Bell, Gift, Tag, Percent, ShoppingBag, Truck, Clock, 
    AlertCircle, Info, Megaphone, Flame, Crown, Trophy, Rocket, Zap, Heart
};

const SiteBanner = () => {
    const { announcement, announcementLoaded } = useData();
    const [visible, setVisible] = useState(false);
    const [countdown, setCountdown] = useState('');

    // Create a stable dismissal key
    const dismissKey = useMemo(() => {
        if (!announcement?.text) return null;
        try {
            return `banner_${btoa(unescape(encodeURIComponent(announcement.text.slice(0, 50)))).slice(0, 20)}`;
        } catch {
            return `banner_${announcement.text.slice(0, 20).replace(/\s/g, '_')}`;
        }
    }, [announcement?.text]);

    // Check visibility on mount and when announcement changes
    useEffect(() => {
        if (!announcementLoaded) {
            console.log('[SiteBanner] Waiting for announcement data...');
            return;
        }

        console.log('[SiteBanner] Announcement data:', announcement);

        // Validate announcement
        if (!announcement || announcement.isActive !== true || !announcement.text?.trim()) {
            console.log('[SiteBanner] Banner not active or no text');
            setVisible(false);
            document.documentElement.style.setProperty('--banner-height', '0px');
            return;
        }

        // Check if dismissed
        if (dismissKey && localStorage.getItem(dismissKey) === 'dismissed') {
            console.log('[SiteBanner] Banner was dismissed');
            setVisible(false);
            document.documentElement.style.setProperty('--banner-height', '0px');
            return;
        }

        console.log('[SiteBanner] Showing banner');
        setVisible(true);
        document.documentElement.style.setProperty('--banner-height', announcement.height || '50px');
    }, [announcement, announcementLoaded, dismissKey]);

    // Countdown timer
    useEffect(() => {
        if (!visible || !announcement?.showTimer || !announcement?.timerEnd) {
            setCountdown('');
            return;
        }

        const updateCountdown = () => {
            const now = new Date().getTime();
            const end = new Date(announcement.timerEnd).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setCountdown('TERMINÉ');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            let str = '';
            if (days > 0) str += `${days}j `;
            str += `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            setCountdown(str);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [visible, announcement?.showTimer, announcement?.timerEnd]);

    // Handle dismiss
    const handleDismiss = useCallback(() => {
        if (dismissKey) {
            localStorage.setItem(dismissKey, 'dismissed');
        }
        setVisible(false);
        document.documentElement.style.setProperty('--banner-height', '0px');
    }, [dismissKey]);

    // Don't render if not visible
    if (!visible || !announcement) {
        return null;
    }

    // Get icon component
    const IconComponent = ICONS[announcement.icon] || Sparkles;
    const height = announcement.height || '50px';

    return (
        <div
            role="banner"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: height,
                backgroundColor: '#0a0a0a',
                borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 60px 0 20px',
                zIndex: 2000,
                fontFamily: 'Inter, system-ui, sans-serif',
                color: '#ffffff',
                fontSize: '0.9rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}
        >
            {/* Content */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                maxWidth: '1200px',
                width: '100%',
                justifyContent: announcement.textAlign === 'center' ? 'center' : 'flex-start'
            }}>
                {/* Icon */}
                {announcement.icon && announcement.icon !== 'none' && (
                    <IconComponent size={18} style={{ color: '#d4af37', flexShrink: 0 }} />
                )}

                {/* Text */}
                <span style={{ fontWeight: 500 }}>
                    {announcement.link ? (
                        <a 
                            href={announcement.link} 
                            style={{ color: 'inherit', textDecoration: 'underline' }}
                        >
                            {announcement.text}
                        </a>
                    ) : (
                        announcement.text
                    )}
                </span>

                {/* Countdown */}
                {countdown && (
                    <span style={{
                        backgroundColor: 'rgba(212, 175, 55, 0.15)',
                        color: '#d4af37',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        marginLeft: '10px'
                    }}>
                        {countdown}
                    </span>
                )}
            </div>

            {/* Close button */}
            <button
                onClick={handleDismiss}
                aria-label="Fermer la bannière"
                style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#888',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = '#888';
                }}
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default SiteBanner;
