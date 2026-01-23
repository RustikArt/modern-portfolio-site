import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import {
    Diamond,
    Zap,
    Rocket,
    FileText,
    Inbox,
    Package,
    Check,
    Mail,
    ExternalLink
} from 'lucide-react';

const UserDashboard = () => {
    const { currentUser, orders, logout, sendOrderConfirmation, showToast } = useData();
    const navigate = useNavigate();
    const [oldPwd, setOldPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [changingPwd, setChangingPwd] = useState(false);

    if (!currentUser) {
        navigate('/login');
        return null;
    }

    // Filter orders for current user
    const myOrders = orders.filter(o => o.userId === currentUser.id);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPwd !== confirmPwd) {
            alert('Les mots de passe ne correspondent pas.');
            return;
        }
        if (newPwd.length < 6) {
            alert('Le nouveau mot de passe doit faire au moins 6 caractères.');
            return;
        }
        
        setChangingPwd(true);
        try {
            const res = await fetch('/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser.email, oldPassword: oldPwd, newPassword: newPwd })
            });

            if (res.ok) {
                alert('Mot de passe changé avec succès.');
                setOldPwd('');
                setNewPwd('');
                setConfirmPwd('');
            } else {
                const err = await res.json().catch(() => ({}));
                alert(err.error || 'Impossible de changer le mot de passe.');
            }
        } catch (e) {
            console.error('Change password error:', e);
            alert('Erreur réseau.');
        } finally {
            setChangingPwd(false);
        }
    };

    // Client-friendly status mapping
    const getClientStatus = (status) => {
        switch (status) {
            case 'Réception':
            case 'Payé':
                return { label: 'Commande Validée', color: '#ff4d4d', icon: <Diamond size={18} /> };
            case 'En cours':
                return { label: 'En Production', color: '#ffd700', icon: <Zap size={18} /> };
            case 'Terminé':
                return { label: 'Projet Finalisé', color: '#4caf50', icon: <Rocket size={18} /> };
            case 'En attente':
                return { label: 'Besoin d\'infos', color: '#ff8c00', icon: <FileText size={18} /> };
            default:
                return { label: status, color: 'var(--color-accent)', icon: <Package size={18} /> };
        }
    };

    // Client-friendly checklist labels
    const getClientLabel = (label) => {
        const mapping = {
            'Brief client reçu': 'Analyse de votre brief',
            'Concept design validé': 'Validation du concept',
            'Production / Création': 'Phase de création active',
            'Envoi finalisé': 'Livraison des fichiers'
        };
        return mapping[label] || label;
    };

    return (
        <div className="page" style={{ paddingTop: '100px', minHeight: '100vh', background: '#050505' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', paddingBottom: '2rem', borderBottom: '1px solid #111' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-2px', textTransform: 'uppercase' }}>Mon Espace <span style={{ color: 'var(--color-accent)' }}>Privé</span></h1>
                        <p style={{ color: '#444', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.7rem' }}>Bienvenue {currentUser.name}</p>
                    </div>
                    <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #333', color: '#666', borderRadius: '30px', padding: '0.6rem 1.5rem', cursor: 'pointer', transition: 'all 0.3s' }}>
                        Se déconnecter
                    </button>
                </header>

                {/* PASSWORD CHANGE SECTION */}
                <div style={{ marginBottom: '3rem', maxWidth: '500px' }}>
                    <h3 style={{ fontSize: '1rem', color: '#888', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '1rem' }}>Sécurité</h3>
                    <form onSubmit={handleChangePassword} className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1rem' }}>Changer le mot de passe</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                type="password"
                                placeholder="Mot de passe actuel"
                                value={oldPwd}
                                onChange={(e) => setOldPwd(e.target.value)}
                                disabled={changingPwd}
                                required
                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #222', background: '#0a0a0a', color: '#fff' }}
                            />
                            <input
                                type="password"
                                placeholder="Nouveau mot de passe"
                                value={newPwd}
                                onChange={(e) => setNewPwd(e.target.value)}
                                disabled={changingPwd}
                                required
                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #222', background: '#0a0a0a', color: '#fff' }}
                            />
                            <input
                                type="password"
                                placeholder="Confirmer le nouveau mot de passe"
                                value={confirmPwd}
                                onChange={(e) => setConfirmPwd(e.target.value)}
                                disabled={changingPwd}
                                required
                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #222', background: '#0a0a0a', color: '#fff' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={changingPwd}
                            style={{
                                marginTop: '1.5rem',
                                padding: '0.8rem 1.5rem',
                                background: changingPwd ? '#555' : 'var(--color-accent)',
                                color: '#000',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: changingPwd ? 'not-allowed' : 'pointer',
                                width: '100%'
                            }}
                        >
                            {changingPwd ? 'En cours...' : 'Mettre à jour'}
                        </button>
                    </form>
                </div>

                <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{ fontSize: '1rem', color: '#888', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '2rem' }}>Historique de vos projets</h3>

                    {myOrders.length === 0 ? (
                        <div style={{ padding: '6rem 2rem', textAlign: 'center', background: '#0a0a0a', border: '1px dashed #222', borderRadius: '24px' }} className="glass">
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: '#333' }}>
                                <Inbox size={64} />
                            </div>
                            <p style={{ color: '#555', fontSize: '1.1rem', marginBottom: '2rem' }}>Aucune commande en cours pour le moment.</p>
                            <button className="btn btn-primary" onClick={() => navigate('/shop')} style={{ borderRadius: '40px', padding: '1rem 2rem' }}>Découvrir la boutique</button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '3rem' }}>
                            {myOrders.map(order => {
                                const statusInfo = getClientStatus(order.status);
                                return (
                                    <div key={order.id} className="glass" style={{
                                        borderRadius: '24px',
                                        padding: '2.5rem',
                                        marginBottom: '2rem'
                                    }}>
                                        {/* Row 1: ID & Badge */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                                            <div>
                                                <div style={{ color: '#333', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>ID Projet: {String(order.id).slice(-8).toUpperCase()}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#666' }}>Posté le {new Date(order.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                            </div>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '0.8rem',
                                                background: 'rgba(255,255,255,0.03)', padding: '0.6rem 1.2rem',
                                                borderRadius: '50px', border: `1px solid ${statusInfo.color}33`
                                            }}>
                                                <span style={{ fontSize: '1.2rem' }}>{statusInfo.icon}</span>
                                                <span style={{ color: statusInfo.color, fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase' }}>{statusInfo.label}</span>
                                            </div>
                                        </div>

                                        {/* Row 2: Progress Tracker */}
                                        <div style={{ marginBottom: '3rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                                                {(order.checklist || []).map((step, idx) => (
                                                    <div key={idx} style={{
                                                        flex: 1, height: '4px',
                                                        background: step.completed ? 'var(--color-accent)' : '#222',
                                                        borderRadius: '2px',
                                                        transition: 'all 0.5s ease',
                                                        boxShadow: step.completed ? '0 0 10px var(--color-accent-glow)' : 'none'
                                                    }}></div>
                                                ))}
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                                                {(order.checklist || []).map((step, idx) => (
                                                    <div key={idx} style={{
                                                        display: 'flex', flexDirection: 'column', gap: '0.8rem',
                                                        opacity: step.completed ? 1 : 0.2,
                                                        transition: 'opacity 0.3s'
                                                    }}>
                                                        <div style={{ fontSize: '0.7rem', color: '#555', fontWeight: 'bold' }}>ÉTAPE 0{idx + 1}</div>
                                                        <div style={{ fontSize: '0.9rem', color: step.completed ? 'white' : '#888', fontWeight: step.completed ? 'bold' : 'normal' }}>
                                                            {getClientLabel(step.label)}
                                                        </div>
                                                        {step.completed && <div style={{ color: 'var(--color-accent)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>Complété <Check size={12} /></div>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Row 3: Items & Action */}
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            paddingTop: '2rem', borderTop: '1px solid #111'
                                        }}>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                {(order.items || []).map((it, idx) => (
                                                    <div key={idx} style={{ background: '#0a0a0a', padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid #111', fontSize: '0.8rem', color: '#999' }}>
                                                        {it.name} <span style={{ color: '#333', marginLeft: '0.5rem' }}>x{it.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#444', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Total Investi</div>
                                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', letterSpacing: '-1px' }}>{order.total}€</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <footer className="glass" style={{ marginTop: '6rem', padding: '3rem', borderRadius: '24px', textAlign: 'center' }}>
                    <p style={{ color: '#555', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                        <span>Besoin d'aide sur une commande ?</span>
                        <a href="mailto:rustikop@outlook.fr" style={{ color: 'var(--color-accent)', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={18} /> rustikop@outlook.fr
                        </a>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default UserDashboard;
