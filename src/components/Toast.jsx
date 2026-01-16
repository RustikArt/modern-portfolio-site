
import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ id, type, message, duration = 3000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);
        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    let bg = '#333';
    let icon = <Info size={18} />;

    if (type === 'success') {
        bg = 'rgba(76, 175, 80, 0.9)';
        icon = <CheckCircle size={18} />;
    } else if (type === 'error') {
        bg = 'rgba(239, 68, 68, 0.9)';
        icon = <AlertCircle size={18} />;
    } else if (type === 'info') {
        bg = 'rgba(59, 130, 246, 0.9)';
        icon = <Info size={18} />;
    }

    return (
        <div className="animate-in" style={{
            background: bg,
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            marginBottom: '0.8rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            minWidth: '300px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            {icon}
            <span style={{ flex: 1, fontSize: '0.9rem' }}>{message}</span>
            <button onClick={() => onClose(id)} style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                opacity: 0.7
            }}>
                <X size={14} />
            </button>
        </div>
    );
};

export default Toast;
