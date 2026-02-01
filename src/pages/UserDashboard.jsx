import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    Diamond,
    Zap,
    Rocket,
    FileText,
    Inbox,
    Package,
    Check,
    Mail,
    LogOut,
    User,
    Shield,
    Clock,
    ChevronRight,
    Eye,
    EyeOff,
    Lock,
    Star,
    Sparkles,
    MessageSquare,
    ArrowRight
} from 'lucide-react';
import './UserDashboard.css';

const UserDashboard = () => {
    const { currentUser, orders, logout, sendOrderConfirmation, showToast, getUserCustomOrders } = useData();
    const navigate = useNavigate();
    const [oldPwd, setOldPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [changingPwd, setChangingPwd] = useState(false);
    const [showOldPwd, setShowOldPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [activeTab, setActiveTab] = useState('orders');
    const [customOrders, setCustomOrders] = useState([]);
    const [loadingCustomOrders, setLoadingCustomOrders] = useState(true);

    // Load custom orders
    useEffect(() => {
        const loadCustomOrders = async () => {
            if (currentUser && getUserCustomOrders) {
                setLoadingCustomOrders(true);
                const data = await getUserCustomOrders(currentUser.id);
                setCustomOrders(data);
                setLoadingCustomOrders(false);
            }
        };
        loadCustomOrders();
    }, [currentUser, getUserCustomOrders]);

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
        <div className="page-profile">
            <div className="container">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-user">
                        <div className="profile-avatar">
                            <User size={32} />
                        </div>
                        <div className="profile-info">
                            <h1>Bienvenue, <span>{currentUser.name}</span></h1>
                            <p>{currentUser.email}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-logout">
                        <LogOut size={18} />
                        Se déconnecter
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="profile-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <Package size={18} />
                        Mes Commandes
                        {myOrders.length > 0 && <span className="tab-badge">{myOrders.length}</span>}
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
                        onClick={() => setActiveTab('custom')}
                    >
                        <Sparkles size={18} />
                        Projets Sur-Mesure
                        {customOrders.length > 0 && <span className="tab-badge">{customOrders.length}</span>}
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <Shield size={18} />
                        Sécurité
                    </button>
                </div>

                {/* Tab Content */}
                <div className="profile-content">
                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="orders-section">
                            {myOrders.length === 0 ? (
                                <div className="orders-empty">
                                    <div className="empty-icon">
                                        <Inbox size={48} />
                                    </div>
                                    <h3>Aucune commande</h3>
                                    <p>Vous n'avez pas encore passé de commande</p>
                                    <button className="btn btn-primary" onClick={() => navigate('/shop')}>
                                        Découvrir la boutique
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="orders-list">
                                    {myOrders.map(order => {
                                        const statusInfo = getClientStatus(order.status);
                                        return (
                                            <div key={order.id} className="order-card">
                                                {/* Order Header */}
                                                <div className="order-header">
                                                    <div className="order-meta">
                                                        <span className="order-id">#{String(order.id).slice(-8).toUpperCase()}</span>
                                                        <span className="order-date">
                                                            <Clock size={14} />
                                                            {new Date(order.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className="order-status" style={{ '--status-color': statusInfo.color }}>
                                                        {statusInfo.icon}
                                                        <span>{statusInfo.label}</span>
                                                    </div>
                                                </div>

                                                {/* Progress Tracker */}
                                                {order.checklist && order.checklist.length > 0 && (
                                                    <div className="order-progress">
                                                        <div className="progress-bar">
                                                            {order.checklist.map((step, idx) => (
                                                                <div 
                                                                    key={idx} 
                                                                    className={`progress-step ${step.completed ? 'completed' : ''}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <div className="progress-steps">
                                                            {order.checklist.map((step, idx) => (
                                                                <div 
                                                                    key={idx} 
                                                                    className={`step-item ${step.completed ? 'completed' : ''}`}
                                                                >
                                                                    <span className="step-number">0{idx + 1}</span>
                                                                    <span className="step-label">{getClientLabel(step.label)}</span>
                                                                    {step.completed && (
                                                                        <span className="step-check"><Check size={12} /></span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Order Footer */}
                                                <div className="order-footer">
                                                    <div className="order-items">
                                                        {(order.items || []).map((it, idx) => (
                                                            <div key={idx} className="order-item-tag">
                                                                {it.name}
                                                                <span>×{it.quantity}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="order-total">
                                                        <span className="total-label">Total</span>
                                                        <span className="total-value">{order.total}€</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Custom Orders Tab */}
                    {activeTab === 'custom' && (
                        <div className="custom-orders-section">
                            {loadingCustomOrders ? (
                                <div className="orders-empty">
                                    <div className="empty-icon">
                                        <Sparkles size={48} className="spin" />
                                    </div>
                                    <p>Chargement de vos demandes...</p>
                                </div>
                            ) : customOrders.length === 0 ? (
                                <div className="orders-empty">
                                    <div className="empty-icon">
                                        <Sparkles size={48} />
                                    </div>
                                    <h3>Aucune demande en cours</h3>
                                    <p>Vous n'avez pas encore fait de demande de projet personnalisé</p>
                                    <Link to="/custom-order" className="btn btn-primary">
                                        Créer une demande
                                        <ArrowRight size={18} />
                                    </Link>
                                </div>
                            ) : (
                                <div className="custom-orders-list">
                                    {customOrders.map(order => {
                                        const statusLabels = {
                                            pending: { label: 'En attente', color: '#ffbe4d' },
                                            reviewed: { label: 'En analyse', color: '#4d94ff' },
                                            quoted: { label: 'Devis envoyé', color: '#a78bfa' },
                                            accepted: { label: 'Accepté', color: '#4caf50' },
                                            rejected: { label: 'Refusé', color: '#ff4d4d' },
                                            completed: { label: 'Terminé', color: '#4caf50' }
                                        };
                                        const status = statusLabels[order.status] || statusLabels.pending;
                                        
                                        return (
                                            <div key={order.id} className="custom-order-card">
                                                <div className="custom-order-header">
                                                    <div>
                                                        <h3>{order.title}</h3>
                                                        <p className="custom-order-date">
                                                            <Clock size={14} />
                                                            {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <span className="custom-order-status" style={{ '--status-color': status.color }}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                
                                                <p className="custom-order-description">{order.description.slice(0, 150)}...</p>
                                                
                                                {order.quoted_price && (
                                                    <div className="custom-order-quote">
                                                        <span>Prix proposé :</span>
                                                        <strong>{order.quoted_price.toFixed(2)}€</strong>
                                                    </div>
                                                )}
                                                
                                                {order.admin_response && (
                                                    <div className="custom-order-response">
                                                        <div className="response-header">
                                                            <MessageSquare size={16} />
                                                            <span>Réponse</span>
                                                        </div>
                                                        <p>{order.admin_response}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    
                                    <Link to="/custom-order" className="new-custom-order-btn">
                                        <Sparkles size={20} />
                                        Nouvelle demande
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="security-section">
                            <div className="security-card">
                                <div className="security-header">
                                    <Lock size={24} />
                                    <div>
                                        <h3>Modifier le mot de passe</h3>
                                        <p>Assurez-vous d'utiliser un mot de passe fort</p>
                                    </div>
                                </div>
                                
                                <form onSubmit={handleChangePassword} className="password-form">
                                    <div className="form-group">
                                        <label>Mot de passe actuel</label>
                                        <div className="input-wrapper">
                                            <input
                                                type={showOldPwd ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={oldPwd}
                                                onChange={(e) => setOldPwd(e.target.value)}
                                                disabled={changingPwd}
                                                required
                                            />
                                            <button 
                                                type="button" 
                                                className="toggle-pwd"
                                                onClick={() => setShowOldPwd(!showOldPwd)}
                                            >
                                                {showOldPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Nouveau mot de passe</label>
                                        <div className="input-wrapper">
                                            <input
                                                type={showNewPwd ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={newPwd}
                                                onChange={(e) => setNewPwd(e.target.value)}
                                                disabled={changingPwd}
                                                required
                                            />
                                            <button 
                                                type="button" 
                                                className="toggle-pwd"
                                                onClick={() => setShowNewPwd(!showNewPwd)}
                                            >
                                                {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Confirmer le nouveau mot de passe</label>
                                        <div className="input-wrapper">
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={confirmPwd}
                                                onChange={(e) => setConfirmPwd(e.target.value)}
                                                disabled={changingPwd}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={changingPwd}
                                    >
                                        {changingPwd ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                {/* Help Footer */}
                <div className="profile-help">
                    <div className="help-content">
                        <div className="help-icon">
                            <Mail size={24} />
                        </div>
                        <div className="help-text">
                            <h4>Besoin d'aide ?</h4>
                            <p>Une question sur une commande ou un projet ?</p>
                            <a href="mailto:rustikop@outlook.fr" className="help-link">
                                rustikop@outlook.fr
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
