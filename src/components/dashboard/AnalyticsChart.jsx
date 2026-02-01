import { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const AnalyticsChart = ({ data, title }) => {
    // data expected format: [{ name: 'Jan', value: 400, originalValue: 450 }, ...]
    // value = actual revenue (with discounts)
    // originalValue = original revenue (without discounts)
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
                                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.6} />
                                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorOriginal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#555"
                            fontSize={11}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis
                            stroke="#555"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}€`}
                        />
                        <Tooltip
                            cursor={{ stroke: 'rgba(167, 139, 250, 0.3)', strokeWidth: 1 }}
                            isAnimationActive={false}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const actualValue = payload.find(p => p.dataKey === 'value')?.value || 0;
                                    const originalValue = payload.find(p => p.dataKey === 'originalValue')?.value || actualValue;
                                    const discount = originalValue - actualValue;
                                    return (
                                        <div style={{
                                            background: 'rgba(10, 10, 15, 0.95)',
                                            border: '1px solid rgba(167, 139, 250, 0.2)',
                                            borderRadius: '8px',
                                            padding: '10px 14px',
                                            fontSize: '0.75rem',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                        }}>
                                            <div style={{ color: '#888', marginBottom: '6px', fontWeight: 500 }}>{label}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '4px' }}>
                                                <span style={{ color: '#a78bfa' }}>Revenus</span>
                                                <span style={{ color: '#f0f0f0', fontWeight: 600 }}>{actualValue.toFixed(2)} €</span>
                                            </div>
                                            {originalValue > actualValue && (
                                                <>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '4px' }}>
                                                        <span style={{ color: '#60a5fa' }}>Sans réduction</span>
                                                        <span style={{ color: '#94a3b8' }}>{originalValue.toFixed(2)} €</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px', marginTop: '4px' }}>
                                                        <span style={{ color: '#f87171' }}>Réductions</span>
                                                        <span style={{ color: '#f87171' }}>-{discount.toFixed(2)} €</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend 
                            verticalAlign="top" 
                            height={36}
                            formatter={(value) => {
                                if (value === 'value') return <span style={{ color: '#a78bfa', fontSize: '0.7rem' }}>Revenus réels</span>;
                                if (value === 'originalValue') return <span style={{ color: '#60a5fa', fontSize: '0.7rem' }}>Sans réduction</span>;
                                return value;
                            }}
                        />
                        {/* Original value area (background - without discount) */}
                        <Area
                            type="monotone"
                            dataKey="originalValue"
                            stroke="#60a5fa"
                            fillOpacity={1}
                            fill="url(#colorOriginal)"
                            strokeWidth={1.5}
                            strokeDasharray="4 2"
                            name="originalValue"
                        />
                        {/* Actual value area (foreground - with discount) */}
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#a78bfa"
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            strokeWidth={2}
                            name="value"
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
