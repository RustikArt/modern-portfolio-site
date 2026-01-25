import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useLocation } from 'react-router-dom';

const LoadingScreen = ({ children }) => {
    const { settings, settingsLoaded, announcementLoaded } = useData();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [progress, setProgress] = useState(0);

    // Skip loading screen for admin routes (they have their own)
    const isAdminRoute = location.pathname.startsWith('/admin');

    // Minimum display time for smooth UX
    const MIN_LOADING_TIME = 800;

    useEffect(() => {
        // Skip for admin routes
        if (isAdminRoute) {
            setIsLoading(false);
            return;
        }

        // If loading screen is disabled in settings, skip it immediately
        if (settingsLoaded && settings?.showLoadingScreen === false) {
            setIsLoading(false);
            return;
        }

        const startTime = Date.now();
        
        // Simulate progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) return prev;
                return prev + Math.random() * 18;
            });
        }, 100);

        // Wait for critical data to load
        const checkReady = () => {
            // Wait for both settings and announcement to load
            if (settingsLoaded && announcementLoaded) {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);
                
                setTimeout(() => {
                    setProgress(100);
                    setTimeout(() => {
                        setFadeOut(true);
                        setTimeout(() => setIsLoading(false), 400);
                    }, 150);
                }, remaining);
                
                clearInterval(progressInterval);
            }
        };

        checkReady();
        const interval = setInterval(checkReady, 50);
        return () => {
            clearInterval(interval);
            clearInterval(progressInterval);
        };
    }, [settingsLoaded, announcementLoaded, settings?.showLoadingScreen, isAdminRoute]);

    if (!isLoading) {
        return children;
    }

    return (
        <>
            <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
                {/* Animated background grid */}
                <div className="loading-grid"></div>
                
                {/* Floating particles */}
                <div className="particles">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="particle" style={{
                            '--delay': `${Math.random() * 5}s`,
                            '--x': `${Math.random() * 100}%`,
                            '--duration': `${3 + Math.random() * 4}s`
                        }}></div>
                    ))}
                </div>
                
                <div className="loading-content">
                    {/* Logo with glow effect */}
                    <div className="loading-logo">
                        <div className="logo-glow"></div>
                        <div className="logo-text">
                            {settings?.siteTitle || 'Portfolio'}
                        </div>
                        <div className="logo-accent"></div>
                    </div>
                    
                    {/* Modern Progress Bar */}
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }}>
                                <div className="progress-shine"></div>
                            </div>
                        </div>
                        <div className="progress-text">{Math.round(progress)}%</div>
                    </div>
                    
                    {/* Loading message */}
                    <div className="loading-text">
                        <span className="loading-word">Chargement</span>
                        <span className="loading-dots">
                            <span>.</span><span>.</span><span>.</span>
                        </span>
                    </div>
                </div>
                
                {/* Corner decorations */}
                <div className="corner-decoration top-left"></div>
                <div className="corner-decoration top-right"></div>
                <div className="corner-decoration bottom-left"></div>
                <div className="corner-decoration bottom-right"></div>
            </div>

            <style>{`
                .loading-screen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: #030303;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 99999;
                    opacity: 1;
                    transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                }

                .loading-screen.fade-out {
                    opacity: 0;
                    pointer-events: none;
                }
                
                /* Animated grid background */
                .loading-grid {
                    position: absolute;
                    inset: 0;
                    background-image: 
                        linear-gradient(rgba(212, 175, 55, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(212, 175, 55, 0.03) 1px, transparent 1px);
                    background-size: 50px 50px;
                    animation: gridMove 20s linear infinite;
                }
                
                @keyframes gridMove {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(50px, 50px); }
                }
                
                /* Floating particles */
                .particles {
                    position: absolute;
                    inset: 0;
                    overflow: hidden;
                    pointer-events: none;
                }
                
                .particle {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: linear-gradient(135deg, #d4af37, #f4d03f);
                    border-radius: 50%;
                    left: var(--x);
                    bottom: -10px;
                    opacity: 0;
                    animation: particleFloat var(--duration) ease-in-out var(--delay) infinite;
                }
                
                @keyframes particleFloat {
                    0% { 
                        transform: translateY(0) scale(0);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.8;
                        transform: scale(1);
                    }
                    90% {
                        opacity: 0.3;
                    }
                    100% { 
                        transform: translateY(-100vh) scale(0.5);
                        opacity: 0;
                    }
                }

                .loading-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2.5rem;
                    z-index: 2;
                }

                .loading-logo {
                    position: relative;
                    animation: logoEntrance 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                
                @keyframes logoEntrance {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.9);
                        filter: blur(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                        filter: blur(0);
                    }
                }
                
                .logo-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 200px;
                    height: 200px;
                    background: radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%);
                    border-radius: 50%;
                    animation: logoGlow 3s ease-in-out infinite;
                }
                
                @keyframes logoGlow {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
                    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
                }

                .logo-text {
                    font-family: 'Inter', system-ui, sans-serif;
                    font-size: clamp(2rem, 5vw, 3rem);
                    font-weight: 700;
                    background: linear-gradient(135deg, #d4af37 0%, #f4d03f 40%, #d4af37 60%, #f4d03f 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    letter-spacing: -0.02em;
                    animation: textShimmer 3s linear infinite;
                    position: relative;
                    z-index: 1;
                }
                
                @keyframes textShimmer {
                    0% { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }
                
                .logo-accent {
                    position: absolute;
                    bottom: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 60px;
                    height: 3px;
                    background: linear-gradient(90deg, transparent, #d4af37, transparent);
                    border-radius: 2px;
                    animation: accentPulse 2s ease-in-out infinite;
                }
                
                @keyframes accentPulse {
                    0%, 100% { width: 60px; opacity: 0.8; }
                    50% { width: 100px; opacity: 1; }
                }
                
                /* Progress bar */
                .progress-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    width: 200px;
                    animation: progressEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
                }
                
                @keyframes progressEntrance {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .progress-bar {
                    width: 100%;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 4px;
                    overflow: hidden;
                    position: relative;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #d4af37, #f4d03f);
                    border-radius: 4px;
                    transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative;
                    overflow: hidden;
                }
                
                .progress-shine {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    animation: progressShine 1.5s ease-in-out infinite;
                }
                
                @keyframes progressShine {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
                
                .progress-text {
                    font-family: 'Inter', system-ui, sans-serif;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #d4af37;
                    letter-spacing: 0.1em;
                }

                .loading-text {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-family: 'Inter', system-ui, sans-serif;
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.5);
                    letter-spacing: 0.05em;
                    animation: textEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
                }
                
                @keyframes textEntrance {
                    from {
                        opacity: 0;
                        transform: translateY(15px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .loading-dots span {
                    animation: dotBounce 1.4s ease-in-out infinite;
                    display: inline-block;
                }
                
                .loading-dots span:nth-child(1) { animation-delay: 0s; }
                .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
                .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
                
                @keyframes dotBounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-5px); }
                }
                
                /* Corner decorations */
                .corner-decoration {
                    position: absolute;
                    width: 80px;
                    height: 80px;
                    border: 1px solid rgba(212, 175, 55, 0.15);
                    pointer-events: none;
                }
                
                .corner-decoration.top-left {
                    top: 30px;
                    left: 30px;
                    border-right: none;
                    border-bottom: none;
                }
                
                .corner-decoration.top-right {
                    top: 30px;
                    right: 30px;
                    border-left: none;
                    border-bottom: none;
                }
                
                .corner-decoration.bottom-left {
                    bottom: 30px;
                    left: 30px;
                    border-right: none;
                    border-top: none;
                }
                
                .corner-decoration.bottom-right {
                    bottom: 30px;
                    right: 30px;
                    border-left: none;
                    border-top: none;
                }

                @media (max-width: 768px) {
                    .logo-text {
                        font-size: 1.8rem;
                    }
                    
                    .progress-container {
                        width: 160px;
                    }
                    
                    .corner-decoration {
                        width: 40px;
                        height: 40px;
                    }
                    
                    .corner-decoration.top-left,
                    .corner-decoration.top-right,
                    .corner-decoration.bottom-left,
                    .corner-decoration.bottom-right {
                        top: 15px;
                        bottom: 15px;
                        left: 15px;
                        right: 15px;
                    }
                }
            `}</style>
        </>
    );
};

export default LoadingScreen;
