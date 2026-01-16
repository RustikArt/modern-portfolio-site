import { intervalToDuration, formatDuration } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Activity, ShoppingCart, User, Edit, Trash2, Plus } from 'lucide-react';

const ActivityLog = ({ logs = [] }) => {
    // logs example: [{ id: 1, type: 'order', message: 'Commande #123 créée', date: '...' }]

    return (
        <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' }}>
                Activités Récentes
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {logs.length === 0 ? (
                    <p style={{ color: '#444', fontStyle: 'italic', fontSize: '0.8rem' }}>Aucune activité récente.</p>
                ) : (
                    logs.slice(0, 5).map(log => (
                        <div key={log.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: log.type === 'order' ? 'var(--color-accent)' : '#fff'
                            }}>
                                {log.type === 'order' && <ShoppingCart size={14} />}
                                {log.type === 'user' && <User size={14} />}
                                {log.type === 'product' && <Plus size={14} />}
                                {log.type === 'system' && <Activity size={14} />}
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#ccc' }}>{log.message}</p>
                                <span style={{ fontSize: '0.7rem', color: '#555' }}>
                                    {new Date(log.date).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
