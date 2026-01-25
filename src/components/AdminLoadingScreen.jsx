/**
 * AdminLoadingScreen - Loading screen specific to admin dashboard
 * Displays a professional loading animation when accessing /admin
 * Can be enabled/disabled via settings.showAdminLoading
 */
import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Shield, Settings, Database, Users, ShoppingBag, BarChart3 } from 'lucide-react';

const AdminLoadingScreen = ({ children }) => {
    const { settings, settingsLoaded, currentUser } = useData();
    const [isLoading, setIsLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    const loadingSteps = [
        { icon: Shield, label: 'Vérification des permissions' },
        { icon: Database, label: 'Chargement des données' },
        { icon: Users, label: 'Synchronisation utilisateurs' },
        { icon: ShoppingBag, label: 'Mise à jour des commandes' },
        { icon: BarChart3, label: 'Préparation du tableau de bord' },
        { icon: Settings, label: 'Finalisation' }
    ];

    // Faster loading time for smoother UX
    const MIN_LOADING_TIME = 1000;

    useEffect(() => {
        // Quick check - if settings loaded and disabled, skip immediately
        if (settingsLoaded && settings?.showAdminLoading === false) {
            setIsLoading(false);
            return;
        }

        // If user is not admin, skip immediately
        if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
            setIsLoading(false);
            return;
        }

        // If we don't have a user yet, wait for auth check
        if (!currentUser && settingsLoaded) {
            // Brief timeout to allow auth to complete
            const authTimeout = setTimeout(() => {
                if (!currentUser) {
                    setIsLoading(false);
                }
            }, 500);
            return () => clearTimeout(authTimeout);
        }

        const startTime = Date.now();

        // Step progression - faster
        const stepInterval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev >= loadingSteps.length - 1) return prev;
                return prev + 1;
            });
        }, 150);

        // Simulate progress animation - faster
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return prev;
                return prev + Math.random() * 18;
            });
        }, 80);

        // Wait for settings to load
        const checkReady = () => {
            if (settingsLoaded) {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);

                setTimeout(() => {
                    setProgress(100);
                    setCurrentStep(loadingSteps.length - 1);
                    setTimeout(() => {
                        setFadeOut(true);
                        setTimeout(() => setIsLoading(false), 350);
                    }, 150);
                }, remaining);

                clearInterval(progressInterval);
                clearInterval(stepInterval);
            }
        };

        checkReady();
        const interval = setInterval(checkReady, 50);
        return () => {
            clearInterval(interval);
            clearInterval(progressInterval);
            clearInterval(stepInterval);
        };
    }, [settingsLoaded, settings?.showAdminLoading, currentUser]);

    if (!isLoading) {
        return children;
    }

    const CurrentIcon = loadingSteps[currentStep]?.icon || Shield;

    return (
        <>
            <div className={`admin-loading-screen ${fadeOut ? 'fade-out' : ''}`}>
                {/* Grid background */}
                <div className="admin-loading-grid"></div>

                {/* Hexagon pattern */}
                <div className="hexagon-pattern">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="hexagon" style={{ '--delay': `${i * 0.2}s` }}></div>
                    ))}
                </div>

                <div className="admin-loading-content">
                    {/* Shield Icon with animation */}
                    <div className="admin-icon-container">
                        <div className="icon-ring outer"></div>
                        <div className="icon-ring inner"></div>
                        <div className="icon-center">
                            <CurrentIcon size={48} />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="admin-loading-title">
                        <span className="title-text">Dashboard Admin</span>
                        <span className="title-accent"></span>
                    </div>

                    {/* Steps indicator */}
                    <div className="loading-steps">
                        {loadingSteps.map((step, index) => {
                            const StepIcon = step.icon;
                            const isActive = index === currentStep;
                            const isComplete = index < currentStep;
                            return (
                                <div
                                    key={index}
                                    className={`step-item ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
                                >
                                    <StepIcon size={16} />
                                </div>
                            );
                        })}
                    </div>

                    {/* Current step label */}
                    <div className="step-label">
                        {loadingSteps[currentStep]?.label || 'Chargement...'}
                    </div>

                    {/* Progress bar */}
                    <div className="admin-progress-container">
                        <div className="admin-progress-bar">
                            <div className="admin-progress-fill" style={{ width: `${progress}%` }}>
                                <div className="admin-progress-glow"></div>
                            </div>
                        </div>
                        <div className="admin-progress-text">{Math.round(progress)}%</div>
                    </div>
                </div>

                {/* Security badge */}
                <div className="security-badge">
                    <Shield size={14} />
                    <span>Connexion Sécurisée</span>
                </div>
            </div>

            <style>{`
                .admin-loading-screen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 99999;
                    opacity: 1;
                    transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                }

                .admin-loading-screen.fade-out {
                    opacity: 0;
                    pointer-events: none;
                }

                /* Grid background */
                .admin-loading-grid {
                    position: absolute;
                    inset: 0;
                    background-image: 
                        linear-gradient(rgba(212, 175, 55, 0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(212, 175, 55, 0.02) 1px, transparent 1px);
                    background-size: 40px 40px;
                    mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
                }

                /* Hexagon pattern */
                .hexagon-pattern {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                }

                .hexagon {
                    position: absolute;
                    width: 200px;
                    height: 200px;
                    border: 1px solid rgba(212, 175, 55, 0.1);
                    border-radius: 50%;
                    animation: hexPulse 3s ease-in-out infinite;
                    animation-delay: var(--delay);
                }

                .hexagon:nth-child(2) { width: 280px; height: 280px; }
                .hexagon:nth-child(3) { width: 360px; height: 360px; }
                .hexagon:nth-child(4) { width: 440px; height: 440px; }
                .hexagon:nth-child(5) { width: 520px; height: 520px; }
                .hexagon:nth-child(6) { width: 600px; height: 600px; }

                @keyframes hexPulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.02); }
                }

                .admin-loading-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2rem;
                    z-index: 2;
                }

                /* Icon container */
                .admin-icon-container {
                    position: relative;
                    width: 140px;
                    height: 140px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .icon-ring {
                    position: absolute;
                    border-radius: 50%;
                    border: 2px solid rgba(212, 175, 55, 0.3);
                }

                .icon-ring.outer {
                    width: 140px;
                    height: 140px;
                    animation: ringRotate 8s linear infinite;
                    border-style: dashed;
                }

                .icon-ring.inner {
                    width: 110px;
                    height: 110px;
                    animation: ringRotate 6s linear infinite reverse;
                }

                @keyframes ringRotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .icon-center {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #d4af37;
                    animation: iconPulse 2s ease-in-out infinite;
                }

                @keyframes iconPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.3); }
                    50% { box-shadow: 0 0 30px 10px rgba(212, 175, 55, 0.1); }
                }

                /* Title */
                .admin-loading-title {
                    text-align: center;
                    position: relative;
                }

                .title-text {
                    font-family: 'Inter', system-ui, sans-serif;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }

                .title-accent {
                    display: block;
                    width: 60px;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #d4af37, transparent);
                    margin: 0.75rem auto 0;
                }

                /* Steps indicator */
                .loading-steps {
                    display: flex;
                    gap: 0.75rem;
                }

                .step-item {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255, 255, 255, 0.3);
                    transition: all 0.3s ease;
                }

                .step-item.active {
                    background: rgba(212, 175, 55, 0.2);
                    border-color: #d4af37;
                    color: #d4af37;
                    transform: scale(1.1);
                }

                .step-item.complete {
                    background: rgba(212, 175, 55, 0.1);
                    border-color: rgba(212, 175, 55, 0.5);
                    color: #d4af37;
                }

                /* Step label */
                .step-label {
                    font-family: 'Inter', system-ui, sans-serif;
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.6);
                    min-height: 1.5rem;
                    transition: opacity 0.3s ease;
                }

                /* Progress bar */
                .admin-progress-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    width: 220px;
                }

                .admin-progress-bar {
                    width: 100%;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .admin-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #d4af37, #f4d03f);
                    border-radius: 4px;
                    transition: width 0.2s ease-out;
                    position: relative;
                }

                .admin-progress-glow {
                    position: absolute;
                    right: 0;
                    top: -4px;
                    width: 20px;
                    height: 12px;
                    background: radial-gradient(ellipse at center, rgba(212, 175, 55, 0.8), transparent);
                    filter: blur(4px);
                }

                .admin-progress-text {
                    font-family: 'Inter', system-ui, sans-serif;
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: rgba(212, 175, 55, 0.8);
                    letter-spacing: 0.1em;
                }

                /* Security badge */
                .security-badge {
                    position: absolute;
                    bottom: 30px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 100px;
                    font-family: 'Inter', system-ui, sans-serif;
                    font-size: 0.7rem;
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .security-badge svg {
                    color: #4caf50;
                }

                @media (max-width: 768px) {
                    .admin-icon-container {
                        width: 100px;
                        height: 100px;
                    }

                    .icon-ring.outer { width: 100px; height: 100px; }
                    .icon-ring.inner { width: 80px; height: 80px; }
                    .icon-center { width: 60px; height: 60px; }
                    .icon-center svg { width: 32px; height: 32px; }

                    .title-text { font-size: 1.2rem; }
                    .loading-steps { gap: 0.5rem; }
                    .step-item { width: 28px; height: 28px; }
                    .step-item svg { width: 12px; height: 12px; }
                    .admin-progress-container { width: 180px; }
                }
            `}</style>
        </>
    );
};

export default AdminLoadingScreen;
