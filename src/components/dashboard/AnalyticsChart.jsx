import { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const AnalyticsChart = ({ data, title }) => {
    // data expected format: [{ name: 'Jan', value: 400 }, ...]
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 400, height: 250 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                if (clientWidth > 0 && clientHeight > 0) {
                    setDimensions({
                        width: Math.max(clientWidth - 20, 100),
                        height: Math.max(clientHeight - 10, 150)
                    });
                }
            }
        };

        // Initial measurement after a short delay to ensure DOM is ready
        const initialTimer = setTimeout(updateDimensions, 100);
        const secondTimer = setTimeout(updateDimensions, 500);

        // Use ResizeObserver for responsive updates
        let observer = null;
        if (containerRef.current && typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(updateDimensions);
            observer.observe(containerRef.current);
        }

        // Fallback resize listener
        window.addEventListener('resize', updateDimensions);
        
        return () => {
            clearTimeout(initialTimer);
            clearTimeout(secondTimer);
            window.removeEventListener('resize', updateDimensions);
            if (observer) observer.disconnect();
        };
    }, []);

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
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {dimensions.width > 100 ? (
                    <AreaChart 
                        width={dimensions.width} 
                        height={dimensions.height} 
                        data={data} 
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
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
                            cursor={{ stroke: '#a78bfa', strokeWidth: 1, strokeDasharray: '3 3' }}
                            isAnimationActive={false}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div style={{
                                            background: 'rgba(10, 10, 15, 0.9)',
                                            border: '1px solid rgba(167, 139, 250, 0.3)',
                                            borderRadius: '6px',
                                            padding: '6px 10px',
                                            fontSize: '0.75rem'
                                        }}>
                                            <span style={{ color: '#a78bfa', fontWeight: 500 }}>{label}</span>
                                            <span style={{ color: '#94a3b8', marginLeft: '6px' }}>{payload[0].value} €</span>
                                        </div>
                                    );
                                }
                                return null;
                                }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#a78bfa"
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                ) : (
                    <div style={{ 
                        color: '#666',
                        fontSize: '0.9rem'
                    }}>
                        Chargement du graphique...
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsChart;
