/**
 * GrainOverlay - Film grain effect overlay component
 * Creates a subtle film grain texture over the entire site
 * Uses isolation to prevent interference with backdrop-filter
 */
import { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';

const GrainOverlay = () => {
    const { settings, settingsLoaded } = useData();
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        // Only check after settings are loaded
        if (!settingsLoaded) return;
        
        const shouldEnable = settings?.grainEffect === true;
        console.log('[GrainOverlay] Settings loaded, grainEffect:', settings?.grainEffect, 'enabling:', shouldEnable);
        setIsEnabled(shouldEnable);
    }, [settings?.grainEffect, settingsLoaded]);

    // Don't render anything if disabled
    if (!isEnabled) {
        return null;
    }

    return (
        <div
            aria-hidden="true"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 9998,
                opacity: 0.07,
                isolation: 'isolate',
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
            }}
        />
    );
};

export default GrainOverlay;
