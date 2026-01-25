import { useState, useEffect, useRef, useCallback } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const AnalyticsChart = ({ data, title }) => {
    // data expected format: [{ name: 'Jan', value: 400 }, ...]
    const containerRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const observerRef = useRef(null);

    const checkDimensions = useCallback(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Ensure container has valid dimensions
            if (rect.width > 50 && rect.height > 50) {
                setIsReady(true);
                return true;
            }
        }
        return false;
    }, []);

    useEffect(() => {
        // Multiple attempts to catch when container is ready
        const timers = [];
        
        // Quick check
        if (checkDimensions()) return;
        
        // Delayed checks
        [50, 150, 300, 500, 1000].forEach(delay => {
            timers.push(setTimeout(() => {
                if (!isReady) checkDimensions();
            }, delay));
        });

        // Use ResizeObserver for dynamic updates
        if (containerRef.current && typeof ResizeObserver !== 'undefined') {
            observerRef.current = new ResizeObserver(() => {
                if (!isReady) checkDimensions();
            });
            observerRef.current.observe(containerRef.current);
        }

        // Fallback resize listener
        const handleResize = () => {
            if (!isReady) checkDimensions();
        };
        window.addEventListener('resize', handleResize);
        
        return () => {
            timers.forEach(t => clearTimeout(t));
            window.removeEventListener('resize', handleResize);
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [checkDimensions, isReady]);

    const cardStyle = {
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '1.5rem',
    };

    return (
        <div style={cardStyle}>
            {title && <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>{title}</h3>}
            <div 
                ref={containerRef}
                style={{ 
                    width: '100%', 
                    height: 280, 
                    minHeight: 200,
                    minWidth: 100,
                    position: 'relative' 
                }}
            >
                {isReady ? (
                    <ResponsiveContainer width="99%" height="99%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#666"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#666"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}€`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                                itemStyle={{ color: '#d4af37' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#d4af37"
                                fillOpacity={1}
                                fill="url(#colorValue)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%',
                        color: '#666' 
                    }}>
                        Chargement du graphique...
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsChart;
