import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

const LoadingScreen = ({ children }) => {
    const { settings, announcementLoaded } = useData();
    const [isLoading, setIsLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    // Minimum display time for smooth UX
    const MIN_LOADING_TIME = 800;

    useEffect(() => {
        // If loading screen is disabled in settings, skip it
        if (settings?.showLoadingScreen === false) {
            setIsLoading(false);
            return;
        }

        const startTime = Date.now();

        // Wait for critical data to load
        const checkReady = () => {
            if (announcementLoaded) {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);
                
                setTimeout(() => {
                    setFadeOut(true);
                    setTimeout(() => setIsLoading(false), 500); // Fade out duration
                }, remaining);
            }
        };

        checkReady();
        const interval = setInterval(checkReady, 100);
        return () => clearInterval(interval);
    }, [announcementLoaded, settings?.showLoadingScreen]);

    if (!isLoading) {
        return children;
    }

    return (
        <>
            <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
                <div className="loading-content">
                    {/* Logo or Brand */}
                    <div className="loading-logo">
                        <div className="logo-text">
                            {settings?.siteTitle || 'Portfolio'}
                        </div>
                    </div>
                    
                    {/* Modern Loader Animation */}
                    <div className="loader-container">
                        <div className="loader">
                            <div className="loader-dot"></div>
                            <div className="loader-dot"></div>
                            <div className="loader-dot"></div>
                        </div>
                    </div>
                    
                    {/* Optional Loading Text */}
                    <div className="loading-text">
                        Chargement...
                    </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="loading-decoration">
                    <div className="glow-circle glow-1"></div>
                    <div className="glow-circle glow-2"></div>
                </div>
            </div>

            <style>{`
                .loading-screen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 99999;
                    opacity: 1;
                    transition: opacity 0.5s ease-out;
                    overflow: hidden;
                }

                .loading-screen.fade-out {
                    opacity: 0;
                    pointer-events: none;
                }

                .loading-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2rem;
                    z-index: 2;
                }

                .loading-logo {
                    animation: logoFloat 2s ease-in-out infinite;
                }

                .logo-text {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    font-size: 2.5rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    letter-spacing: -0.02em;
                    text-shadow: 0 0 40px rgba(212, 175, 55, 0.3);
                }

                @keyframes logoFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                .loader-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                }

                .loader {
                    display: flex;
                    gap: 8px;
                }

                .loader-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #d4af37, #f4d03f);
                    animation: dotPulse 1.4s ease-in-out infinite both;
                    box-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
                }

                .loader-dot:nth-child(1) { animation-delay: -0.32s; }
                .loader-dot:nth-child(2) { animation-delay: -0.16s; }
                .loader-dot:nth-child(3) { animation-delay: 0s; }

                @keyframes dotPulse {
                    0%, 80%, 100% {
                        transform: scale(0.6);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .loading-text {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.5);
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    animation: textFade 2s ease-in-out infinite;
                }

                @keyframes textFade {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }

                .loading-decoration {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    overflow: hidden;
                }

                .glow-circle {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.15;
                }

                .glow-1 {
                    width: 400px;
                    height: 400px;
                    background: #d4af37;
                    top: -100px;
                    right: -100px;
                    animation: glowMove1 8s ease-in-out infinite;
                }

                .glow-2 {
                    width: 300px;
                    height: 300px;
                    background: #d4af37;
                    bottom: -50px;
                    left: -50px;
                    animation: glowMove2 10s ease-in-out infinite;
                }

                @keyframes glowMove1 {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-50px, 50px); }
                }

                @keyframes glowMove2 {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(50px, -30px); }
                }

                /* Alternative Spinner Style (can be toggled) */
                .spinner-ring {
                    width: 50px;
                    height: 50px;
                    border: 3px solid rgba(212, 175, 55, 0.1);
                    border-top: 3px solid #d4af37;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .logo-text {
                        font-size: 1.8rem;
                    }
                    
                    .loader-dot {
                        width: 10px;
                        height: 10px;
                    }
                    
                    .glow-1, .glow-2 {
                        width: 200px;
                        height: 200px;
                    }
                }
            `}</style>
        </>
    );
};

export default LoadingScreen;
