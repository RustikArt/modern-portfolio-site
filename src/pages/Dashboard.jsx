import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { WEBSITE_VERSION, VERSION_DETAILS } from '../version';
import BlockEditor from '../components/BlockEditor';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Plus,
    Zap,
    FileCode,
    Layers,
    Shield,
    Globe,
    Save,
    Edit,
    Trash2,
    CheckCircle,
    Clock,
    Package,
    AlertCircle,
    Search,
    LogOut,
    ExternalLink,
    Timer,
    Star,
    FolderArchive,
    Ticket,
    Palette,
    ChevronDown,
    ChevronUp,
    Bell,
    Settings,
    X,
    Mail,
    UserPlus,
    ShoppingCart,
    RotateCcw,
    Percent,
    MapPin,
    Check,
    User,
    TrendingUp
} from 'lucide-react';
import AnalyticsChart from '../components/dashboard/AnalyticsChart';
import ActivityLog from '../components/dashboard/ActivityLog';
import { downloadCSV } from '../utils/export';
import { sendShippingUpdate, sendVideoProof } from '../utils/emailService';

const Dashboard = () => {
    const {
        projects, products, orders, users, promoCodes,
        addProject, deleteProject, updateProject,
        addProduct, updateProduct, deleteProduct,
        updateOrderStatus, toggleChecklistItem, updateOrderNotes, addPromoCode, deletePromoCode,
        secureFullReset, logout,
        announcement, updateAnnouncement,
        notifications, markNotificationAsRead, deleteNotification, markAllNotificationsAsRead,
        homeContent, setHomeContent,
        reviews, deleteReview,
        currentUser, register, checkPermission, loginHistory,
        showToast,
        settings, updateSettings
    } = useData();

    const [showVersionDetails, setShowVersionDetails] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeTab, setActiveTab] = useState('orders');
    const [expandedOrders, setExpandedOrders] = useState({});
    const navigate = useNavigate();
    const notificationRef = React.useRef(null);

    // Click outside to close notifications
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    const toggleOrderExpansion = (orderId) => {
        setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
    };

    // --- ARCHIVING LOGIC ---
    // Orders in "Terminé" for more than 7 days
    const isArchived = (order) => {
        if (order.status !== 'Terminé') return false;
        const completionDate = order.completionDate || order.date; // Fallback to date if completionDate missing
        const diffTime = Math.abs(new Date() - new Date(completionDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 7;
    };

    // --- FORMS STATES ---
    const [projectForm, setProjectForm] = useState({ editId: null, title: '', category: '', image: '', content: '', blocks: [] });

    const [productForm, setProductForm] = useState({
        editId: null,
        name: '', price: '', discountType: 'none', discountValue: '',
        image: '', category: '', tags: '', is_featured: false,
        alertMessage: '', // New field
        options: []
    });

    const [optionBuilder, setOptionBuilder] = useState({ name: '', type: 'select', valuesInput: '' });
    const [promoForm, setPromoForm] = useState({ code: '', type: 'percent', value: '', minAmount: '', maxUses: '', expirationDate: '' });

    // Product Filters
    const [productFilter, setProductFilter] = useState({ category: 'all', promoOnly: false, search: '' });

    const [announcementForm, setAnnouncementForm] = useState({ ...announcement });

    // --- USER MANAGEMENT STATES ---
    const [selectedMember, setSelectedMember] = useState(null);
    const [showMemberPassword, setShowMemberPassword] = useState(false);
    const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', password: '', permissions: [] });

    const handleCreateAdmin = async () => {
        if (!newAdminForm.name || !newAdminForm.email || !newAdminForm.password) {
            showToast("Veuillez remplir tous les champs", "error");
            return;
        }
        try {
            const adminData = {
                ...newAdminForm,
                role: 'admin',
                roleTitle: 'Administrateur'
            };
            const result = await register(adminData);
            if (result.success) {
                showToast(`Compte admin pour ${newAdminForm.name} créé !`, "success");
                setNewAdminForm({ name: '', email: '', password: '', permissions: [] });
            } else {
                showToast(result.message || "Erreur de création", "error");
            }
        } catch (err) {
            showToast("Une erreur est survenue", "error");
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleAddOption = () => {
        if (!optionBuilder.name) return;
        let parsedValues = [];
        if (optionBuilder.type === 'select') {
            parsedValues = optionBuilder.valuesInput.split(',').map(v => {
                const parts = v.split(':');
                const label = parts[0].trim();
                const modifier = parts[1] ? parseFloat(parts[1]) : 0;
                return { label, priceModifier: modifier };
            });
        }
        setProductForm(prev => ({
            ...prev,
            options: [...prev.options, {
                id: Date.now(),
                name: optionBuilder.name,
                type: optionBuilder.type,
                requiresQuote: optionBuilder.requiresQuote || false, // New field for free text
                values: parsedValues
            }]
        }));
        setOptionBuilder({ name: '', type: 'select', valuesInput: '' });
    };

    const handleRemoveOption = (id) => {
        setProductForm(prev => ({
            ...prev,
            options: prev.options.filter(o => o.id !== id)
        }));
    };

    const handleEditProduct = (product) => {
        let dType = 'none';
        let dValue = '';
        if (product.promoPrice) {
            dType = 'fixed';
            dValue = (product.price - product.promoPrice).toFixed(2);
        }
        setProductForm({
            editId: product.id,
            name: product.name,
            price: product.price,
            discountType: dType,
            discountValue: dValue,
            image: product.image,
            category: product.category,
            tags: product.tags ? product.tags.join(', ') : '',
            is_featured: product.is_featured || false,
            alertMessage: product.alertMessage || '',
            options: product.options || []
        });
        window.scrollTo(0, 0);
    };

    const handleProductSubmit = (e) => {
        e.preventDefault();
        if (!productForm.name) return;
        const tagsArray = productForm.tags.split(',').map(t => t.trim()).filter(t => t);
        let finalPromoPrice = null;
        const price = parseFloat(productForm.price);
        const dVal = parseFloat(productForm.discountValue);
        if (productForm.discountType === 'percent' && dVal > 0) {
            finalPromoPrice = price - (price * (dVal / 100));
        } else if (productForm.discountType === 'fixed' && dVal > 0) {
            finalPromoPrice = price - dVal;
        }
        if (finalPromoPrice && finalPromoPrice < 0) finalPromoPrice = 0;

        const productData = {
            name: productForm.name,
            price: price,
            promoPrice: finalPromoPrice,
            image: productForm.image || 'https://placehold.co/400x400/333?text=Product',
            category: productForm.category,
            tags: tagsArray,
            is_featured: productForm.is_featured || false,
            alertMessage: productForm.alertMessage,
            options: productForm.options || []
        };
        if (productForm.editId) {
            updateProduct(productForm.editId, productData);
        } else {
            addProduct(productData);
        }
        setProductForm({
            editId: null, name: '', price: '', discountType: 'none', discountValue: '',
            image: '', category: '', tags: '', is_featured: false, options: []
        });
    };

    const handlePromoSubmit = (e) => {
        e.preventDefault();
        if (!promoForm.code) return;
        addPromoCode({
            ...promoForm,
            code: promoForm.code.toUpperCase(),
            value: parseFloat(promoForm.value),
            minAmount: promoForm.minAmount ? parseFloat(promoForm.minAmount) : null,
            maxUses: promoForm.maxUses ? parseInt(promoForm.maxUses) : null,
            expirationDate: promoForm.expirationDate || null
        });
        setPromoForm({ code: '', type: 'percent', value: '', minAmount: '', maxUses: '', expirationDate: '' });
    };

    const handleProjectSubmit = (e) => {
        e.preventDefault();
        if (!projectForm.title) return;
        const projectData = {
            title: projectForm.title,
            category: projectForm.category,
            image: projectForm.image || 'https://placehold.co/600x400/333?text=Project',
            content: projectForm.content || '',
            blocks: projectForm.blocks || []
        };
        if (projectForm.editId) {
            updateProject(projectForm.editId, projectData);
        } else {
            addProject(projectData);
        }
        setProjectForm({ editId: null, title: '', category: '', image: '', content: '', blocks: [] });
    };

    const handleEditProject = (project) => {
        setProjectForm({
            editId: project.id,
            title: project.title,
            category: project.category,
            image: project.image,
            content: project.content || '',
            blocks: project.blocks || []
        });
        setActiveTab('projects');
        window.scrollTo(0, 0);
    };

    const handleExportOrders = () => {
        const dataToExport = orders.map(o => ({
            ID: o.id,
            Date: new Date(o.date).toLocaleDateString(),
            Client: o.customerName,
            Email: o.email,
            Total: o.total,
            Status: o.status,
            Items: o.items.map(i => `${i.name} (x${i.quantity})`).join('; ')
        }));
        downloadCSV(dataToExport, `commandes_rustikop_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleExportProducts = () => {
        const dataToExport = products.map(p => ({
            ID: p.id,
            Name: p.name,
            Category: p.category,
            Price: p.price,
            Promo_Price: p.promoPrice || '',
            Stock: 'N/A'
        }));
        downloadCSV(dataToExport, `produits_rustikop_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleFullReset = () => {
        const pass = prompt("ENTREZ LE MOT DE PASSE ADMIN POUR RÉINITIALISER TOUTE LA PLATEFORME :");
        if (pass) {
            if (pass) {
                if (secureFullReset(pass)) {
                    showToast("Réinitialisation réussie. Redirection...", 'success');
                } else {
                    showToast("Mot de passe incorrect.", 'error');
                }
            }
        }
    };

    const sideBtnStyle = (isActive) => ({
        ...btnModern,
        width: '100%',
        marginBottom: '0.8rem',
        background: isActive ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.02)',
        color: isActive ? 'var(--color-accent)' : '#888',
        border: '1px solid',
        borderColor: isActive ? 'var(--color-accent-glow)' : 'rgba(255,255,255,0.05)',
        fontWeight: isActive ? 'bold' : 'normal',
        borderLeft: isActive ? '4px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.05)',
        paddingLeft: isActive ? '1.2rem' : '1.5rem',
        boxShadow: isActive ? '0 4px 15px rgba(212, 175, 55, 0.1)' : 'none'
    });

    const stats = {
        totalRevenue: orders.reduce((acc, o) => acc + parseFloat(o.total || 0), 0).toFixed(2),
        totalOrders: orders.length,
        activeOrders: orders.filter(o => o.status !== 'Terminé').length,
        totalUsers: users.length
    };

    // --- CHART DATA PREP ---
    const getChartData = () => {
        // Group by Month (simple version)
        const data = {};
        orders.forEach(order => {
            const date = new Date(order.date);
            const month = date.toLocaleString('default', { month: 'short' });
            data[month] = (data[month] || 0) + parseFloat(order.total || 0);
        });
        return Object.keys(data).map(key => ({ name: key, value: data[key] }));
    };

    const chartData = getChartData().length > 0 ? getChartData() : [{ name: 'Jan', value: 0 }, { name: 'Feb', value: 0 }];

    // --- ACTIVITY LOGS (MOCK FROM NOTIFICATIONS FOR NOW) ---
    // In a real app, this would be a separate 'logs' table
    const recentActivity = notifications.slice(0, 10).map(n => ({
        id: n.id,
        type: n.type || 'system',
        message: n.message,
        date: n.date
    }));

    const inputStyle = {
        padding: '0.8rem',
        background: '#121212',
        border: '1px solid #222',
        color: 'white',
        borderRadius: '8px',
        width: '100%',
        transition: 'border-color 0.3s'
    };

    const cardStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
    };

    const btnModern = {
        padding: '0.8rem 1.5rem',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.02)',
        color: '#888',
        cursor: 'pointer',
        fontSize: '0.85rem',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        textAlign: 'left'
    };

    const btnPrimaryModern = {
        ...btnModern,
        background: 'rgba(255,255,255,0.9)',
        borderColor: 'transparent',
        color: '#000',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    };


    return (
        <div className="page" style={{ paddingTop: '100px', minHeight: '100vh', background: '#050505', color: '#eee' }}>
            <div className="container" style={{ maxWidth: '1400px' }}>
                {/* Header V2.2 */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid #222', paddingBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: '900', letterSpacing: '-2px', textTransform: 'uppercase' }}>
                            Admin <span style={{ color: 'var(--color-accent)' }}>Panel</span>
                        </h1>
                        <p
                            onClick={() => setShowVersionDetails(!showVersionDetails)}
                            style={{
                                color: '#444',
                                margin: '5px 0 0',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                fontSize: '0.7rem',
                                cursor: 'help',
                                userSelect: 'none',
                                transition: 'color 0.3s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = 'var(--color-accent)'}
                            onMouseLeave={(e) => e.target.style.color = '#444'}
                        >
                            {WEBSITE_VERSION} {showVersionDetails ? '▴' : '▾'}
                        </p>
                        {showVersionDetails && (
                            <div className="animate-in" style={{
                                marginTop: '10px',
                                padding: '10px 15px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                fontSize: '0.75rem',
                                color: '#888',
                                whiteSpace: 'pre-line',
                                lineHeight: '1.6'
                            }}>
                                {VERSION_DETAILS}
                            </div>
                        )}
                    </div>


                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        {/* Notification Bell */}
                        <div style={{ position: 'relative' }} ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: showNotifications ? 'var(--color-accent)' : '#888',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'color 0.3s'
                                }}
                            >
                                <Bell size={24} />
                                {notifications.filter(n => !n.isRead).length > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-5px',
                                        right: '-5px',
                                        background: '#ff4d4d',
                                        color: 'white',
                                        fontSize: '0.6rem',
                                        padding: '2px 5px',
                                        borderRadius: '10px',
                                        fontWeight: 'bold',
                                        border: '2px solid #050505'
                                    }}>
                                        {notifications.filter(n => !n.isRead).length}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="glass animate-fade-in" style={{
                                    position: 'absolute',
                                    top: '40px',
                                    right: 0,
                                    width: '350px',
                                    maxHeight: '500px',
                                    zIndex: 1000,
                                    padding: '1.5rem',
                                    overflowY: 'auto'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #222', paddingBottom: '0.8rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Notifications</h4>
                                        <button
                                            onClick={markAllNotificationsAsRead}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: '0.7rem', cursor: 'pointer' }}
                                        >
                                            Tout lire
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        {notifications.length === 0 ? (
                                            <p style={{ textAlign: 'center', color: '#444', fontSize: '0.8rem', padding: '2rem 0' }}>Aucune notification</p>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id} style={{
                                                    background: n.isRead ? 'rgba(255,255,255,0.01)' : 'rgba(212,175,55,0.05)',
                                                    padding: '1rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid',
                                                    borderColor: n.isRead ? 'rgba(255,255,255,0.03)' : 'rgba(212,175,55,0.1)',
                                                    display: 'flex',
                                                    gap: '1rem',
                                                    position: 'relative'
                                                }}>
                                                    <div style={{ color: n.isRead ? '#444' : 'var(--color-accent)' }}>
                                                        {n.type === 'order' && <ShoppingCart size={18} />}
                                                        {n.type === 'account' && <UserPlus size={18} />}
                                                        {n.type === 'contact' && <Mail size={18} />}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ fontSize: '0.8rem', margin: '0 0 0.3rem', color: n.isRead ? '#888' : '#eee' }}>{n.message}</p>
                                                        <span style={{ fontSize: '0.65rem', color: '#444' }}>{new Date(n.date).toLocaleString('fr-FR')}</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                                                        style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', padding: '5px' }}
                                                        onMouseEnter={e => e.target.style.color = '#ff4d4d'}
                                                        onMouseLeave={e => e.target.style.color = '#444'}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '0.5rem 1rem', background: '#111', borderRadius: '30px', border: '1px solid #333', fontSize: '0.85rem' }}>
                            <span style={{ color: '#666' }}>{currentUser?.name || 'root'}@</span><strong>{settings.siteTitle?.toLowerCase() || 'rustikop'}</strong>
                        </div>
                        <button onClick={handleLogout} className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', borderRadius: '30px' }}>Logout</button>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3rem' }}>
                    {/* SIDE PANEL */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '0.65rem', color: '#444', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '2rem 0 1rem 1.5rem', fontWeight: 'bold' }}>Gestion</h3>
                        <button onClick={() => setActiveTab('overview')} style={sideBtnStyle(activeTab === 'overview')}><LayoutDashboard size={18} /> Vue d'ensemble</button>
                        <button onClick={() => setActiveTab('orders')} style={sideBtnStyle(activeTab === 'orders')}><ShoppingBag size={18} /> Commandes</button>
                        <button onClick={() => setActiveTab('clients')} style={sideBtnStyle(activeTab === 'clients')}><Users size={18} /> Clients</button>

                        <h3 style={{ fontSize: '0.65rem', color: '#444', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '2rem 0 1rem 1.5rem', fontWeight: 'bold' }}>Boutique</h3>
                        <button onClick={() => setActiveTab('products')} style={sideBtnStyle(activeTab === 'products')}><Plus size={18} /> Produits</button>
                        <button onClick={() => setActiveTab('promos')} style={sideBtnStyle(activeTab === 'promos')}><Zap size={18} /> Codes Promo</button>
                        <button onClick={() => setActiveTab('reviews')} style={sideBtnStyle(activeTab === 'reviews')}><Star size={18} /> Avis Clients</button>

                        <h3 style={{ fontSize: '0.65rem', color: '#444', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '2rem 0 1rem 1.5rem', fontWeight: 'bold' }}>Contenu</h3>
                        <button onClick={() => setActiveTab('projects')} style={sideBtnStyle(activeTab === 'projects')}><FileCode size={18} /> Projets / Portfolio</button>
                        <button onClick={() => setActiveTab('homeEditor')} style={sideBtnStyle(activeTab === 'homeEditor')}><Layers size={18} /> Editeur Accueil</button>

                        <h3 style={{ fontSize: '0.65rem', color: '#444', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '2rem 0 1rem 1.5rem', fontWeight: 'bold' }}>Système</h3>
                        <button onClick={() => setActiveTab('security')} style={sideBtnStyle(activeTab === 'security')}><Shield size={18} /> Sécurité</button>
                        <button onClick={() => setActiveTab('settings')} style={sideBtnStyle(activeTab === 'settings')}><Globe size={18} /> Paramètres</button>
                    </div>

                    {/* MAIN CONTENT */}
                    <main>
                        {/* --- OVERVIEW TAB --- */}
                        {activeTab === 'overview' && (
                            <div className="animate-in">
                                <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Vue d'ensemble</h2>

                                {/* KPI CARDS */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                                    <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' }}>
                                        <div style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Chiffre d'Affaires</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>{stats.totalRevenue} €</div>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Commandes Totales</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalOrders}</div>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Utilisateurs</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalUsers}</div>
                                    </div>
                                    {/* QUICK ACTION CARD */}
                                    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
                                        <div style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Accès Rapide</div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => setActiveTab('products')} style={{ ...btnModern, flex: 1, padding: '0.5rem', justifyContent: 'center' }}><Plus size={16} /> Produit</button>
                                            <button onClick={() => setActiveTab('projects')} style={{ ...btnModern, flex: 1, padding: '0.5rem', justifyContent: 'center' }}><FileCode size={16} /> Projet</button>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        <AnalyticsChart
                                            data={chartData}
                                            title="Revenus Mensuels (€)"
                                        />

                                        {/* ADMIN NOTEPAD WIDGET */}
                                        <div style={cardStyle}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <h3 style={{ fontSize: '1rem' }}>Bloc-notes Admin</h3>
                                                <Save size={16} color="#888" />
                                            </div>
                                            <textarea
                                                placeholder="Notes rapides, idées, tâches à faire..."
                                                style={{
                                                    width: '100%', minHeight: '120px', background: '#111', border: 'none',
                                                    color: '#ccc', padding: '1rem', borderRadius: '8px', resize: 'vertical',
                                                    fontSize: '0.9rem', lineHeight: '1.5'
                                                }}
                                                defaultValue={localStorage.getItem('admin_notes') || ''}
                                                onChange={(e) => localStorage.setItem('admin_notes', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div style={cardStyle}>
                                        <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Dernière Activité</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                            {recentActivity.slice(0, 5).map(log => (
                                                <div key={log.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                                                    <div style={{ color: 'var(--color-accent)', minWidth: '40px' }}>
                                                        <Timer size={14} />
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem' }}>
                                                        <div style={{ color: '#eee' }}>{log.message}</div>
                                                        <div style={{ color: '#444', fontSize: '0.7rem' }}>{new Date(log.date).toLocaleTimeString()}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            {recentActivity.length === 0 && <p style={{ fontSize: '0.8rem', color: '#444' }}>Aucune activité récente.</p>}
                                        </div>

                                        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #222' }}>
                                            <h4 style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem', textTransform: 'uppercase' }}>Système</h4>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>
                                                <span>Version</span>
                                                <span style={{ color: 'var(--color-accent)' }}>{WEBSITE_VERSION}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888' }}>
                                                <span>Status DB</span>
                                                <span style={{ color: '#4caf50' }}>Connecté</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- ORDERS & ARCHIVES TABS --- */}
                        {(activeTab === 'orders' || activeTab === 'archives') && (
                            <div className="animate-in">
                                {(activeTab === 'orders' ? ['Réception', 'En cours', 'Terminé', 'En attente'] : ['Archives']).map(cat => {
                                    const filteredOrders = orders.filter(o => {
                                        if (activeTab === 'archives') return isArchived(o);
                                        if (isArchived(o)) return false;
                                        if (cat === 'Réception') return o.status === 'Réception' || o.status === 'Payé';
                                        return o.status === cat;
                                    });

                                    if (filteredOrders.length === 0 && activeTab === 'archives') return null;

                                    return (
                                        <div key={cat} style={{ marginBottom: '3rem' }}>
                                            <h3 style={{
                                                marginBottom: '1.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px',
                                                color: cat === 'Terminé' ? '#444' : cat === 'En attente' ? '#ff8c00' : 'var(--color-accent)',
                                                display: 'flex', alignItems: 'center', gap: '0.8rem',
                                                justifyContent: 'space-between'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat === 'Réception' ? '#ff4d4d' : cat === 'En cours' ? '#ffd700' : cat === 'Terminé' ? '#4caf50' : '#ff8c00' }}></span>
                                                    {cat === 'Terminé' ? 'Completed (Recent)' : cat === 'En attente' ? 'Problèmes / En attente' : cat === 'Archives' ? 'Archives (+7 jours)' : cat}
                                                </div>
                                                {cat === 'Réception' && (
                                                    <button onClick={handleExportOrders} style={{ ...btnModern, fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
                                                        <FileCode size={14} /> Export CSV
                                                    </button>
                                                )}
                                            </h3>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                                {filteredOrders.length === 0 ? (
                                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#333', border: '1px dashed #222', borderRadius: '12px' }}>
                                                        Aucune commande dans cette catégorie.
                                                    </div>
                                                ) : (
                                                    filteredOrders.map(order => {
                                                        const isExpanded = expandedOrders[order.id];
                                                        return (
                                                            <div key={order.id} style={{ ...cardStyle, padding: isExpanded ? '2rem' : '1.2rem 2rem' }}>
                                                                <div
                                                                    onClick={() => toggleOrderExpansion(order.id)}
                                                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                                                >
                                                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5rem' }}>
                                                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', minWidth: '150px' }}>{order.customerName}</div>
                                                                        <div style={{ color: '#444', fontSize: '0.75rem', fontFamily: 'monospace' }}>#{String(order.id).slice(-8).toUpperCase()}</div>
                                                                        <div style={{ color: '#666', fontSize: '0.8rem' }}>{new Date(order.date).toLocaleDateString()}</div>
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                                                        <div style={{ color: 'var(--color-accent)', fontSize: '1.1rem', fontWeight: 'bold' }}>{order.total}€</div>
                                                                        <div style={{ color: '#444', fontSize: '1rem', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>▼</div>
                                                                    </div>
                                                                </div>

                                                                {isExpanded && (
                                                                    <div className="animate-in" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                                                            <div>
                                                                                <div style={{ color: '#888', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>Contact & Livraison</div>
                                                                                <div style={{ color: '#ccc', fontSize: '0.9rem' }}>{order.email}</div>
                                                                                {order.shipping && (
                                                                                    <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.8rem', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                                        <MapPin size={14} /> {order.shipping.address}, {order.shipping.city} ({order.shipping.zip})
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div style={{ textAlign: 'right' }}>
                                                                                <div style={{ color: '#888', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' }}>Action</div>
                                                                                <select
                                                                                    value={order.status}
                                                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                                                    style={{ background: '#111', border: '1px solid #222', color: 'white', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem' }}
                                                                                >
                                                                                    <option value="Réception">Réception</option>
                                                                                    <option value="En cours">En cours</option>
                                                                                    <option value="Terminé">Terminé</option>
                                                                                    <option value="En attente">En attente (Problème)</option>
                                                                                </select>
                                                                            </div>
                                                                        </div>

                                                                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '12px', marginBottom: '2rem' }}>
                                                                            {(order.items || []).map((it, idx) => (
                                                                                <div key={idx} style={{ marginBottom: '1rem', borderBottom: idx === order.items.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
                                                                                    <div style={{ fontSize: '0.9rem', color: 'white', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                                                                        <span>{it.name} x{it.quantity}</span>
                                                                                        <span>{it.price}€</span>
                                                                                    </div>
                                                                                    {it.selectedOptions && it.selectedOptions.length > 0 && (
                                                                                        <div style={{ marginTop: '0.5rem', paddingLeft: '0.5rem', borderLeft: '2px solid var(--color-accent)' }}>
                                                                                            {(it.selectedOptions || []).map((opt, oIdx) => (
                                                                                                <div key={oIdx} style={{ fontSize: '0.75rem', color: '#888' }}>
                                                                                                    <strong style={{ color: '#aaa' }}>{opt.name}:</strong> {opt.value}
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>

                                                                        {order.checklist && (
                                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem', marginBottom: '2rem' }}>
                                                                                {(order.checklist || []).map(item => (
                                                                                    <div
                                                                                        key={item.id}
                                                                                        onClick={() => toggleChecklistItem(order.id, item.id)}
                                                                                        style={{
                                                                                            display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer',
                                                                                            padding: '1rem', borderRadius: '12px', background: item.completed ? 'rgba(76,175,80,0.05)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)'
                                                                                        }}>
                                                                                        <div style={{
                                                                                            width: '20px', height: '20px', border: '2px solid #333', borderRadius: '6px',
                                                                                            background: item.completed ? '#4caf50' : 'transparent', borderColor: item.completed ? '#4caf50' : '#333',
                                                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                                                                        }}>{item.completed && <Check size={12} strokeWidth={4} />}</div>
                                                                                        <span style={{ fontSize: '0.85rem', color: item.completed ? '#666' : '#ccc', textDecoration: item.completed ? 'line-through' : 'none' }}>{item.label}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}

                                                                        <textarea
                                                                            value={order.notes || ''}
                                                                            onChange={(e) => updateOrderNotes(order.id, e.target.value)}
                                                                            placeholder="Notes sur la commande..."
                                                                            style={{ width: '100%', background: '#080808', border: '1px solid #222', borderRadius: '12px', padding: '1rem', color: 'white', fontSize: '0.85rem', minHeight: '100px' }}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* --- PRODUCTS TAB --- */}
                        {activeTab === 'products' && (
                            <div className="animate-in">
                                <section style={{ ...cardStyle, marginBottom: '3rem' }}>
                                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>{productForm.editId ? 'Edit Product' : 'Add New Product'}</h2>
                                    <form onSubmit={handleProductSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                            <input type="text" placeholder="Product Name" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} style={inputStyle} required />
                                            <input type="number" placeholder="Price €" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} style={inputStyle} required />
                                        </div>

                                        <div style={{ ...cardStyle, background: '#0a0a0a', border: '1px dashed #222' }}>
                                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem', textTransform: 'uppercase' }}>Advanced Option Builder</p>

                                            {/* Options List */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                                {productForm.options.map(opt => (
                                                    <div key={opt.id} style={{ padding: '0.5rem 1rem', background: '#181818', borderRadius: '30px', border: '1px solid #333', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem' }}>
                                                        <strong>{opt.name}</strong>
                                                        <span style={{ color: '#555' }}>|</span>
                                                        <span style={{ color: 'var(--color-accent)' }}>{opt.type === 'select' ? `${opt.values.length} choices` : 'Free Text'}</span>
                                                        <button onClick={() => handleRemoveOption(opt.id)} style={{ border: 'none', background: 'none', color: '#ff4d4d', cursor: 'pointer', padding: 0 }}>✕</button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.7rem', color: '#555' }}>Option Name (ex: Taille)</label>
                                                    <input type="text" value={optionBuilder.name} onChange={e => setOptionBuilder({ ...optionBuilder, name: e.target.value })} style={inputStyle} placeholder="Label" />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.7rem', color: '#555' }}>Type</label>
                                                    <select value={optionBuilder.type} onChange={e => setOptionBuilder({ ...optionBuilder, type: e.target.value })} style={inputStyle}>
                                                        <option value="select">Dropdown (Select)</option>
                                                        <option value="text">Text Input (Client Brief)</option>
                                                    </select>
                                                </div>
                                                {optionBuilder.type === 'text' && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', paddingBottom: '0.5rem' }}>
                                                        <input
                                                            type="checkbox"
                                                            id="reqQuote"
                                                            checked={optionBuilder.requiresQuote || false}
                                                            onChange={e => setOptionBuilder({ ...optionBuilder, requiresQuote: e.target.checked })}
                                                        />
                                                        <label htmlFor="reqQuote" style={{ fontSize: '0.75rem', color: '#ffcc00', cursor: 'pointer' }}>Demande de devis ?</label>
                                                    </div>
                                                )}
                                                <button type="button" onClick={handleAddOption} style={{ ...btnModern, padding: '0.8rem' }}>Add</button>
                                            </div>
                                            {optionBuilder.type === 'select' && (
                                                <input
                                                    type="text"
                                                    placeholder="Values: Label:PriceModifier, Label (ex: S:0, XL:5, XXL:10)"
                                                    value={optionBuilder.valuesInput}
                                                    onChange={e => setOptionBuilder({ ...optionBuilder, valuesInput: e.target.value })}
                                                    style={{ ...inputStyle, marginTop: '1rem' }}
                                                />
                                            )}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <input type="text" placeholder="Category" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} style={inputStyle} />
                                            <input type="text" placeholder="Tags (comma separated)" value={productForm.tags} onChange={e => setProductForm({ ...productForm, tags: e.target.value })} style={inputStyle} />
                                        </div>
                                        <textarea
                                            placeholder="Message d'alerte / Note importante (ex: Délais rallongés)"
                                            value={productForm.alertMessage}
                                            onChange={e => setProductForm({ ...productForm, alertMessage: e.target.value })}
                                            style={{ ...inputStyle, minHeight: '60px', borderRadius: '8px' }}
                                        />
                                        <input type="text" placeholder="Image URL" value={productForm.image} onChange={e => setProductForm({ ...productForm, image: e.target.value })} style={inputStyle} />

                                        <button type="submit" style={{ ...btnPrimaryModern, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
                                            {productForm.editId ? <><Save size={18} /> Save Changes</> : <><Plus size={18} /> Publish Product</>}
                                        </button>
                                    </form>
                                </section>

                                {/* Product Filters */}
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                        <input
                                            type="text"
                                            placeholder="Rechercher..."
                                            value={productFilter.search}
                                            onChange={e => setProductFilter({ ...productFilter, search: e.target.value })}
                                            style={{ ...inputStyle, paddingLeft: '40px' }}
                                        />
                                    </div>
                                    <select
                                        value={productFilter.category}
                                        onChange={e => setProductFilter({ ...productFilter, category: e.target.value })}
                                        style={{ ...inputStyle, width: 'auto', minWidth: '180px' }}
                                    >
                                        <option value="all">Toutes les catégories</option>
                                        {[...new Set(products.map(p => p.category))].map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => setProductFilter({ ...productFilter, promoOnly: !productFilter.promoOnly })}
                                        style={{
                                            ...btnModern,
                                            background: productFilter.promoOnly ? 'var(--color-accent)' : 'rgba(255,255,255,0.02)',
                                            color: productFilter.promoOnly ? 'black' : '#888',
                                            border: productFilter.promoOnly ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontWeight: productFilter.promoOnly ? 'bold' : 'normal'
                                        }}
                                    >
                                        <Percent size={16} /> En Promo
                                    </button>
                                    <span style={{ fontSize: '0.8rem', color: '#555' }}>
                                        {products.filter(p => {
                                            const matchCategory = productFilter.category === 'all' || p.category === productFilter.category;
                                            const matchPromo = !productFilter.promoOnly || p.promoPrice;
                                            const matchSearch = !productFilter.search || p.name.toLowerCase().includes(productFilter.search.toLowerCase()) || p.tags?.some(t => t.toLowerCase().includes(productFilter.search.toLowerCase()));
                                            return matchCategory && matchPromo && matchSearch;
                                        }).length} produit(s)
                                    </span>
                                    <button onClick={handleExportProducts} style={{ ...btnModern, fontSize: '0.75rem', padding: '0.4rem 0.8rem', marginLeft: 'auto' }}>
                                        <FileCode size={14} /> Export CSV
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                    {products
                                        .filter(p => {
                                            const matchCategory = productFilter.category === 'all' || p.category === productFilter.category;
                                            const matchPromo = !productFilter.promoOnly || p.promoPrice;
                                            const matchSearch = !productFilter.search || p.name.toLowerCase().includes(productFilter.search.toLowerCase()) || p.tags?.some(t => t.toLowerCase().includes(productFilter.search.toLowerCase()));
                                            return matchCategory && matchPromo && matchSearch;
                                        })
                                        .map(p => (
                                            <div key={p.id} style={{ ...cardStyle, position: 'relative' }}>
                                                {p.promoPrice && (
                                                    <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--color-accent)', color: 'black', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                        PROMO
                                                    </span>
                                                )}
                                                <img src={`${p.image}?v=${WEBSITE_VERSION}`} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} alt="" />
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{p.name}</h4>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            {p.promoPrice ? (
                                                                <>
                                                                    <span style={{ color: '#555', textDecoration: 'line-through', fontSize: '0.85rem' }}>{p.price}€</span>
                                                                    <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{p.promoPrice}€</span>
                                                                </>
                                                            ) : (
                                                                <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{p.price}€</span>
                                                            )}
                                                        </div>
                                                        <span style={{ fontSize: '0.7rem', color: '#444' }}>{p.category}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => handleEditProduct(p)} style={{ ...btnModern, padding: '0.5rem' }} title="Edit"><Edit size={14} /></button>
                                                        <button onClick={() => deleteProduct(p.id)} style={{ ...btnModern, padding: '0.5rem', color: '#ff4d4d' }} title="Delete"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* --- PROJECTS TAB --- */}
                        {activeTab === 'projects' && (
                            <div className="animate-in">
                                <section style={{ ...cardStyle, marginBottom: '3rem' }}>
                                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <FileCode size={20} /> {projectForm.editId ? 'Update Case Study' : 'New Project'}
                                    </h2>
                                    <form onSubmit={handleProjectSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                            <input type="text" placeholder="Project Title" value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} style={inputStyle} required />
                                            <input type="text" placeholder="Category" value={projectForm.category} onChange={e => setProjectForm({ ...projectForm, category: e.target.value })} style={inputStyle} />
                                        </div>
                                        <input type="text" placeholder="Main Cover URL" value={projectForm.image} onChange={e => setProjectForm({ ...projectForm, image: e.target.value })} style={inputStyle} />

                                        <div style={{ background: '#0a0a0a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #111' }}>
                                            <h4 style={{ marginBottom: '1.5rem', fontSize: '0.8rem', color: '#555', textTransform: 'uppercase' }}>Advanced Block Editor</h4>
                                            <BlockEditor
                                                blocks={projectForm.blocks}
                                                onChange={newBlocks => setProjectForm({ ...projectForm, blocks: newBlocks })}
                                            />
                                        </div>

                                        <button type="submit" style={{ ...btnPrimaryModern, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
                                            {projectForm.editId ? <><Save size={18} /> Update Project</> : <><Plus size={18} /> Publish Project</>}
                                        </button>
                                    </form>
                                </section>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                    {projects.map(p => (
                                        <div key={p.id} style={cardStyle}>
                                            <img src={`${p.image}?v=${WEBSITE_VERSION}`} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} alt="" />
                                            <h4 style={{ margin: '0 0 0.5rem' }}>{p.title}</h4>
                                            <p style={{ fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', marginBottom: '1.5rem' }}>{p.category}</p>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button onClick={() => handleEditProject(p)} style={{ ...btnModern, flex: 1, textAlign: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                    <Edit size={14} /> Edit Content
                                                </button>
                                                <button onClick={() => deleteProject(p.id)} style={{ ...btnModern, color: '#ff4d4d', padding: '0.5rem' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- PROMOS TAB --- */}
                        {activeTab === 'promos' && (
                            <div className="animate-in" style={{ maxWidth: '600px' }}>
                                <section style={{ ...cardStyle, marginBottom: '2rem' }}>
                                    <h4 style={{ marginBottom: '1.5rem' }}>New Promo Code</h4>
                                    <form onSubmit={handlePromoSubmit} style={{ display: 'grid', gap: '1rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <input type="text" placeholder="CODE (ex: RUSTIK20)" value={promoForm.code} onChange={e => setPromoForm({ ...promoForm, code: e.target.value })} style={inputStyle} required />
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <select value={promoForm.type} onChange={e => setPromoForm({ ...promoForm, type: e.target.value })} style={{ ...inputStyle, width: '120px' }}>
                                                    <option value="percent">%</option>
                                                    <option value="fixed">€</option>
                                                </select>
                                                <input type="number" placeholder="Value" value={promoForm.value} onChange={e => setPromoForm({ ...promoForm, value: e.target.value })} style={inputStyle} required />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                            <input type="number" placeholder="Min Amount (€)" value={promoForm.minAmount} onChange={e => setPromoForm({ ...promoForm, minAmount: e.target.value })} style={inputStyle} />
                                            <input type="number" placeholder="Max Uses" value={promoForm.maxUses} onChange={e => setPromoForm({ ...promoForm, maxUses: e.target.value })} style={inputStyle} />
                                            <input type="date" placeholder="Expiration" value={promoForm.expirationDate} onChange={e => setPromoForm({ ...promoForm, expirationDate: e.target.value })} style={inputStyle} />
                                        </div>
                                        <button type="submit" style={btnPrimaryModern}>Generate Coupon</button>
                                    </form>
                                </section>

                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {promoCodes.map(c => (
                                        <div key={c.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderStyle: 'dashed' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <strong style={{ fontSize: '1.2rem', color: 'var(--color-accent)' }}>{c.code}</strong>
                                                    <span style={{ color: '#fff', fontWeight: 'bold' }}>-{c.value}{c.type === 'percent' ? '%' : '€'}</span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.3rem', display: 'flex', gap: '1rem' }}>
                                                    {c.minAmount && <span>Min: {c.minAmount}€</span>}
                                                    {c.expirationDate && <span>Exp: {new Date(c.expirationDate).toLocaleDateString()}</span>}
                                                    {c.maxUses && <span>Limit: {c.maxUses}</span>}
                                                </div>
                                            </div>
                                            <button onClick={() => deletePromoCode(c.id)} style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- CLIENTS TAB --- */}
                        {activeTab === 'clients' && (
                            <div className="animate-in">
                                {/* --- MEMBER DETAIL MODAL --- */}
                                {selectedMember && (
                                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div className="animate-in" style={{ width: '90%', maxWidth: '800px', background: '#111', border: '1px solid #333', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                                            <div style={{ padding: '2rem', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to right, #161616, #111)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--color-accent), #884400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>
                                                        {selectedMember.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{selectedMember.name}</h2>
                                                        <span style={{ color: '#888' }}>ID: {selectedMember.id}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => setSelectedMember(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem' }}>
                                                <div>
                                                    <h3 style={{ color: 'var(--color-accent)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><User size={20} /> Informations Personnelles</h3>
                                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                                        <div style={{ background: '#080808', padding: '1rem', borderRadius: '8px' }}>
                                                            <label style={{ fontSize: '0.75rem', color: '#666', display: 'block' }}>Email</label>
                                                            <div style={{ fontSize: '1rem' }}>{selectedMember.email}</div>
                                                        </div>
                                                        <div style={{ background: '#080808', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div>
                                                                <label style={{ fontSize: '0.75rem', color: '#666', display: 'block' }}>Mot de passe</label>
                                                                <div style={{ fontSize: '1rem', fontFamily: 'monospace' }}>
                                                                    {showMemberPassword ? (selectedMember.password || '••••••••') : '••••••••'}
                                                                </div>
                                                            </div>
                                                            <button onClick={() => setShowMemberPassword(!showMemberPassword)} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer' }}>
                                                                {showMemberPassword ? 'Masquer' : 'Voir'}
                                                            </button>
                                                        </div>
                                                        <div style={{ background: '#080808', padding: '1rem', borderRadius: '8px' }}>
                                                            <label style={{ fontSize: '0.75rem', color: '#666', display: 'block' }}>Rôle</label>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                                                                <span style={{
                                                                    background: selectedMember.role === 'admin' ? 'var(--color-accent)' : '#222',
                                                                    color: selectedMember.role === 'admin' ? '#000' : '#fff',
                                                                    padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold'
                                                                }}>
                                                                    {selectedMember.role || 'client'}
                                                                </span>
                                                                {selectedMember.permissions && selectedMember.permissions.length > 0 &&
                                                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>({selectedMember.permissions.join(', ')})</span>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 style={{ color: 'var(--color-accent)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><TrendingUp size={20} /> Activité & Commandes</h3>
                                                    <div style={{ background: '#080808', padding: '1.5rem', borderRadius: '12px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #222', paddingBottom: '1rem' }}>
                                                            <span style={{ color: '#888' }}>Total Dépensé</span>
                                                            <strong style={{ fontSize: '1.2rem', color: '#fff' }}>
                                                                {orders.filter(o => o.user === selectedMember.name).reduce((acc, o) => acc + o.total, 0).toFixed(2)}€
                                                            </strong>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ color: '#888' }}>Nombre de commandes</span>
                                                            <strong style={{ fontSize: '1.2rem', color: '#fff' }}>
                                                                {orders.filter(o => o.user === selectedMember.name).length}
                                                            </strong>
                                                        </div>
                                                    </div>

                                                    <h4 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>Dernières Commandes</h4>
                                                    <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                                                        {orders.filter(o => o.user === selectedMember.name).length > 0 ? (
                                                            orders.filter(o => o.user === selectedMember.name).map(o => (
                                                                <div key={o.id} style={{ padding: '0.8rem', background: '#111', border: '1px solid #222', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                                    <span>#{o.id}</span>
                                                                    <span>{o.date}</span>
                                                                    <span style={{ color: 'var(--color-accent)' }}>{o.total}€</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div style={{ color: '#444', fontStyle: 'italic' }}>Aucune commande</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>
                                    {/* MEMBER LIST */}
                                    <div style={cardStyle}>
                                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Users size={20} /> Liste des Membres</h3>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #333' }}>
                                                    <th style={{ padding: '1rem', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Utilisateur</th>
                                                    <th style={{ padding: '1rem', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Rôle</th>
                                                    <th style={{ padding: '1rem', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Stats</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map(u => (
                                                    <tr
                                                        key={u.id}
                                                        style={{ borderBottom: '1px solid #111', cursor: 'pointer', transition: 'background 0.2s' }}
                                                        onClick={() => { setShowMemberPassword(false); setSelectedMember(u); }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#161616'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <td style={{ padding: '1rem' }}>
                                                            <div style={{ fontWeight: 'bold' }}>{u.name}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#555' }}>{u.email}</div>
                                                        </td>
                                                        <td style={{ padding: '1rem' }}>
                                                            <span style={{
                                                                background: u.role === 'admin' ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
                                                                color: u.role === 'admin' ? '#000' : '#888',
                                                                padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'
                                                            }}>
                                                                {u.roleTitle || u.role}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '1rem', color: '#fff', fontSize: '0.9rem' }}>
                                                            {orders.filter(o => o.user === u.name).reduce((acc, o) => acc + o.total, 0)}€
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* ADD ADMIN FORM */}
                                    <div style={cardStyle}>
                                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Shield size={20} /> Créer un Administrateur</h3>
                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                            <input
                                                type="text"
                                                placeholder="Nom d'utilisateur"
                                                value={newAdminForm.name}
                                                onChange={e => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                                                style={inputStyle}
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email"
                                                value={newAdminForm.email}
                                                onChange={e => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                                                style={inputStyle}
                                            />
                                            <input
                                                type="password"
                                                placeholder="Mot de passe"
                                                value={newAdminForm.password}
                                                onChange={e => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                                                style={inputStyle}
                                            />

                                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.8rem' }}>Permissions</label>
                                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                    {['products', 'projects', 'orders', 'users', 'settings'].map(perm => (
                                                        <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={newAdminForm.permissions.includes(perm)}
                                                                onChange={(e) => {
                                                                    const perms = e.target.checked
                                                                        ? [...newAdminForm.permissions, perm]
                                                                        : newAdminForm.permissions.filter(p => p !== perm);
                                                                    setNewAdminForm({ ...newAdminForm, permissions: perms });
                                                                }}
                                                            />
                                                            <span style={{ textTransform: 'capitalize' }}>Manage {perm}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleCreateAdmin}
                                                style={{ ...btnPrimaryModern, justifyContent: 'center', marginTop: '1rem' }}
                                            >
                                                <Plus size={18} /> Créer le compte
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- HOME EDITOR TAB --- */}
                        {activeTab === 'homeEditor' && homeContent && (
                            <div className="animate-in">
                                <section style={cardStyle}>
                                    <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Home Page Configuration</h2>

                                    {/* HERO SECTION */}
                                    <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem' }}>
                                        <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Hero Section</h3>
                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <input type="text" placeholder="Title Line 1" value={homeContent.hero.titleLine1} onChange={(e) => setHomeContent({ ...homeContent, hero: { ...homeContent.hero, titleLine1: e.target.value } })} style={inputStyle} />
                                                <input type="text" placeholder="Title Line 2" value={homeContent.hero.titleLine2} onChange={(e) => setHomeContent({ ...homeContent, hero: { ...homeContent.hero, titleLine2: e.target.value } })} style={inputStyle} />
                                            </div>
                                            <input type="text" placeholder="Subtitle" value={homeContent.hero.subtitle} onChange={(e) => setHomeContent({ ...homeContent, hero: { ...homeContent.hero, subtitle: e.target.value } })} style={inputStyle} />
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <input type="text" placeholder="Button Text" value={homeContent.hero.buttonText} onChange={(e) => setHomeContent({ ...homeContent, hero: { ...homeContent.hero, buttonText: e.target.value } })} style={inputStyle} />
                                                <input type="text" placeholder="Button Link" value={homeContent.hero.buttonLink} onChange={(e) => setHomeContent({ ...homeContent, hero: { ...homeContent.hero, buttonLink: e.target.value } })} style={inputStyle} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* FEATURED PROJECTS */}
                                    <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem' }}>
                                        <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Featured Projects</h3>
                                        <input type="text" placeholder="Section Title" value={homeContent.featuredProjects.title} onChange={(e) => setHomeContent({ ...homeContent, featuredProjects: { ...homeContent.featuredProjects, title: e.target.value } })} style={{ ...inputStyle, marginBottom: '1rem' }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', border: '1px solid #333', padding: '1rem', borderRadius: '8px' }}>
                                            {projects.map(p => (
                                                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={homeContent.featuredProjects.ids.includes(p.id)}
                                                        onChange={(e) => {
                                                            let newIds = [...homeContent.featuredProjects.ids];
                                                            if (e.target.checked) newIds.push(p.id);
                                                            else newIds = newIds.filter(id => id !== p.id);
                                                            setHomeContent({ ...homeContent, featuredProjects: { ...homeContent.featuredProjects, ids: newIds } });
                                                        }}
                                                    />
                                                    {p.title}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* SERVICES */}
                                    <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <h3 style={{ margin: 0, color: 'var(--color-accent)' }}>Services</h3>
                                            <button onClick={() => setHomeContent({ ...homeContent, services: [...homeContent.services, { id: Date.now(), title: 'New Service', icon: 'Star', description: 'Description' }] })} style={btnModern}><Plus size={14} /> Add</button>
                                        </div>
                                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                                            {homeContent.services.map((service, idx) => (
                                                <div key={service.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <label style={{ fontSize: '0.7rem', color: '#666' }}>Icon (Lucide name)</label>
                                                            <input type="text" value={service.icon} onChange={(e) => {
                                                                const newServices = [...homeContent.services];
                                                                newServices[idx].icon = e.target.value;
                                                                setHomeContent({ ...homeContent, services: newServices });
                                                            }} style={inputStyle} />
                                                        </div>
                                                        <div style={{ flex: 2 }}>
                                                            <label style={{ fontSize: '0.7rem', color: '#666' }}>Title</label>
                                                            <input type="text" value={service.title} onChange={(e) => {
                                                                const newServices = [...homeContent.services];
                                                                newServices[idx].title = e.target.value;
                                                                setHomeContent({ ...homeContent, services: newServices });
                                                            }} style={inputStyle} />
                                                        </div>
                                                        <button onClick={() => setHomeContent({ ...homeContent, services: homeContent.services.filter((_, i) => i !== idx) })} style={{ ...btnModern, color: '#ff4d4d', marginTop: 'auto' }}><Trash2 size={14} /></button>
                                                    </div>
                                                    <input type="text" placeholder="Description" value={service.description} onChange={(e) => {
                                                        const newServices = [...homeContent.services];
                                                        newServices[idx].description = e.target.value;
                                                        setHomeContent({ ...homeContent, services: newServices });
                                                    }} style={inputStyle} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <div>
                                        <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Call to Action</h3>
                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                            <input type="text" placeholder="Title" value={homeContent.cta.title} onChange={(e) => setHomeContent({ ...homeContent, cta: { ...homeContent.cta, title: e.target.value } })} style={inputStyle} />
                                            <input type="text" placeholder="Text" value={homeContent.cta.text} onChange={(e) => setHomeContent({ ...homeContent, cta: { ...homeContent.cta, text: e.target.value } })} style={inputStyle} />
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <input type="text" placeholder="Button Text" value={homeContent.cta.buttonText} onChange={(e) => setHomeContent({ ...homeContent, cta: { ...homeContent.cta, buttonText: e.target.value } })} style={inputStyle} />
                                                <input type="text" placeholder="Button Link" value={homeContent.cta.buttonLink} onChange={(e) => setHomeContent({ ...homeContent, cta: { ...homeContent.cta, buttonLink: e.target.value } })} style={inputStyle} />
                                            </div>
                                        </div>
                                    </div>

                                </section>
                            </div>
                        )}

                        {/* --- SECURITY TAB --- */}
                        {activeTab === 'security' && (
                            <div className="animate-in">
                                <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Sécurité & Accès</h2>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                                    {/* Login History */}
                                    <div style={cardStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                            <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '0.8rem', borderRadius: '12px', color: 'var(--color-accent)' }}>
                                                <Shield size={24} />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Historique de Connexion</h3>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>Dernières tentatives d'accès à votre compte</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {loginHistory && loginHistory.length > 0 ? loginHistory.slice(0, 8).map((entry, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '1rem',
                                                    background: 'rgba(255,255,255,0.02)',
                                                    borderRadius: '12px',
                                                    border: '1px solid rgba(255,255,255,0.05)'
                                                }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.9rem', color: '#eee' }}>{entry.device} • {entry.browser}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#444' }}>{entry.ip}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-accent)' }}>{new Date(entry.date).toLocaleDateString()}</div>
                                                        <div style={{ fontSize: '0.65rem', color: '#444' }}>{new Date(entry.date).toLocaleTimeString()}</div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <p style={{ textAlign: 'center', color: '#444', padding: '2rem' }}>Aucun historique disponible.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Role Management (Super Admin Only) */}
                                    <div>
                                        {checkPermission('all') ? (
                                            <div style={cardStyle}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                                    <div style={{ background: 'rgba(0, 255, 128, 0.1)', padding: '0.8rem', borderRadius: '12px', color: '#00ff80' }}>
                                                        <Users size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Gestion des Rôles</h3>
                                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>Permissions globales du système</p>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                    {users.filter(u => u.role !== 'client').map(u => (
                                                        <div key={u.id || u.email} style={{
                                                            padding: '1rem',
                                                            background: 'rgba(255,255,255,0.01)',
                                                            borderRadius: '12px',
                                                            border: '1px solid rgba(255,255,255,0.03)',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}>
                                                            <div>
                                                                <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{u.name || 'Sans nom'}</div>
                                                                <div style={{ fontSize: '0.7rem', color: '#555' }}>{u.email}</div>
                                                            </div>
                                                            <div style={{
                                                                padding: '0.3rem 0.8rem',
                                                                background: u.role === 'super_admin' ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.05)',
                                                                color: u.role === 'super_admin' ? 'var(--color-accent)' : '#888',
                                                                borderRadius: '20px',
                                                                fontSize: '0.65rem',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '1px'
                                                            }}>
                                                                {u.role}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ ...cardStyle, textAlign: 'center', opacity: 0.5 }}>
                                                <Shield size={48} style={{ marginBottom: '1rem', color: '#333' }} />
                                                <p style={{ fontSize: '0.9rem', color: '#555' }}>Accès restreint au Super Admin uniquement.</p>
                                            </div>
                                        )}

                                        <div style={{ ...cardStyle, marginTop: '2rem', background: 'rgba(255, 0, 0, 0.02)', borderColor: 'rgba(255, 0, 0, 0.1)' }}>
                                            <h3 style={{ fontSize: '1rem', color: '#ff4d4d', marginBottom: '1rem' }}>Zone de Danger</h3>
                                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem' }}>Action destructrice. La réinitialisation supprimera toutes les commandes et clients non-admin.</p>
                                            <button
                                                onClick={() => {
                                                    const pwd = prompt("Entrez le mot de passe de sécurité :");
                                                    if (secureFullReset(pwd)) {
                                                        showToast("Réinitialisation terminée", "success");
                                                    } else {
                                                        showToast("Mot de passe incorrect", "error");
                                                    }
                                                }}
                                                style={{ ...btnModern, width: '100%', justifyContent: 'center', border: '1px solid #ff4d4d', color: '#ff4d4d', background: 'transparent' }}
                                            >
                                                Réinitialisation Globale
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- SETTINGS TAB --- */}
                        {activeTab === 'settings' && (
                            <div className="animate-in">
                                <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Globe size={24} /> Paramètres du Site
                                </h2>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                                    {/* GLOBAL SETTINGS CARD */}
                                    <div style={cardStyle}>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <Settings size={20} /> Configuration Générale
                                        </h3>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Nom du Site</label>
                                                <input
                                                    type="text"
                                                    value={settings.siteTitle}
                                                    onChange={(e) => updateSettings({ siteTitle: e.target.value })}
                                                    style={inputStyle}
                                                />
                                            </div>

                                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: 'bold' }}>Mode Maintenance</span>
                                                    <div
                                                        onClick={() => updateSettings({ maintenanceMode: !settings.maintenanceMode })}
                                                        style={{
                                                            width: '50px', height: '26px', background: settings.maintenanceMode ? '#ff4d4d' : '#333',
                                                            borderRadius: '15px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                                                            position: 'absolute', top: '3px', left: settings.maintenanceMode ? '27px' : '3px',
                                                            transition: 'left 0.3s'
                                                        }}></div>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>Si activé, le site public affichera une page de maintenance.</p>
                                            </div>

                                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: 'bold' }}>Effet de Grain</span>
                                                    <div
                                                        onClick={() => updateSettings({ grainEffect: !settings.grainEffect })}
                                                        style={{
                                                            width: '50px', height: '26px', background: settings.grainEffect ? 'var(--color-accent)' : '#333',
                                                            borderRadius: '15px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                                                            position: 'absolute', top: '3px', left: settings.grainEffect ? '27px' : '3px',
                                                            transition: 'left 0.3s'
                                                        }}></div>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>Ajoute une texture de film rétro à l'arrière plan du site.</p>
                                            </div>

                                            <h4 style={{ fontSize: '0.9rem', color: '#888', marginTop: '1rem', borderBottom: '1px solid #222', paddingBottom: '0.5rem' }}>Contact & Réseaux</h4>

                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Email de contact</label>
                                                <input
                                                    type="email"
                                                    value={settings.contactEmail}
                                                    onChange={(e) => updateSettings({ contactEmail: e.target.value })}
                                                    style={inputStyle}
                                                />
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Instagram</label>
                                                    <input
                                                        type="text"
                                                        value={settings.socials?.instagram || ''}
                                                        onChange={(e) => updateSettings({ socials: { ...settings.socials, instagram: e.target.value } })}
                                                        style={inputStyle}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Twitter (X)</label>
                                                    <input
                                                        type="text"
                                                        value={settings.socials?.twitter || ''}
                                                        onChange={(e) => updateSettings({ socials: { ...settings.socials, twitter: e.target.value } })}
                                                        style={inputStyle}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Discord</label>
                                                    <input
                                                        type="text"
                                                        value={settings.socials?.discord || ''}
                                                        onChange={(e) => updateSettings({ socials: { ...settings.socials, discord: e.target.value } })}
                                                        style={inputStyle}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ANNOUNCEMENT BANNER CARD */}
                                    <div style={cardStyle}>
                                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <AlertCircle size={20} /> Banderole d'annonce
                                        </h2>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={announcementForm.isActive}
                                                    onChange={e => setAnnouncementForm({ ...announcementForm, isActive: e.target.checked })}
                                                    style={{ width: '20px', height: '20px' }}
                                                />
                                                <label>Activer la banderole</label>
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Texte de l'annonce</label>
                                                <textarea
                                                    value={announcementForm.text}
                                                    onChange={e => setAnnouncementForm({ ...announcementForm, text: e.target.value })}
                                                    style={{ ...inputStyle, minHeight: '80px' }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Hyperlien (optionnel)</label>
                                                <input
                                                    type="text"
                                                    value={announcementForm.link}
                                                    onChange={e => setAnnouncementForm({ ...announcementForm, link: e.target.value })}
                                                    style={inputStyle}
                                                    placeholder="https://..."
                                                />
                                                <p style={{ fontSize: '0.7rem', color: '#555', marginTop: '0.5rem' }}>Utilisez <code style={{ background: '#222', padding: '2px 5px', borderRadius: '3px' }}>[lien]</code> dans le texte pour placer le lien. Ex: "Voir notre [lien] ici !"</p>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', paddingBottom: '0.8rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={announcementForm.showTimer}
                                                        onChange={e => setAnnouncementForm({ ...announcementForm, showTimer: e.target.checked })}
                                                        style={{ width: '18px', height: '18px' }}
                                                    />
                                                    <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Timer size={14} /> Compte à rebours
                                                    </label>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Date de fin</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={announcementForm.timerEnd}
                                                        onChange={e => setAnnouncementForm({ ...announcementForm, timerEnd: e.target.value })}
                                                        style={inputStyle}
                                                        disabled={!announcementForm.showTimer}
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ marginTop: '1rem' }}>
                                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '1rem' }}>Aperçu du rendu :</label>
                                                <div style={{
                                                    background: announcementForm.bgColor || '#d4af37',
                                                    color: announcementForm.textColor || 'black',
                                                    padding: '1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '8px',
                                                    fontWeight: announcementForm.fontWeight,
                                                    fontStyle: announcementForm.fontStyle,
                                                    fontSize: '0.8rem',
                                                    textAlign: 'center'
                                                }}>
                                                    {announcementForm.text || 'Texte de votre annonce...'}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    updateAnnouncement(announcementForm);
                                                    showToast("Configuration de la banderole appliquée !", "success");
                                                }}
                                                style={{ ...btnPrimaryModern, marginTop: 'auto', width: '100%', justifyContent: 'center' }}
                                            >
                                                <Edit size={18} /> Appliquer les modifications
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="animate-in">
                                <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Gestion des Avis</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {Object.keys(reviews).length > 0 ? Object.entries(reviews)
                                        .filter(([_, prodReviews]) => prodReviews && prodReviews.length > 0)
                                        .map(([prodId, prodReviews]) => {
                                            const product = products.find(p => p.id === parseInt(prodId));
                                            return (
                                                <div key={prodId} style={cardStyle}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                                                        {product?.image && <img src={product.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />}
                                                        <div>
                                                            <h3 style={{ margin: 0, fontSize: '1rem' }}>{product?.name || `Produit #${prodId}`}</h3>
                                                            <span style={{ fontSize: '0.75rem', color: '#666' }}>{prodReviews.length} avis</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                        {prodReviews.map((rev, index) => (
                                                            <div key={index} style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'flex-start',
                                                                padding: '1rem',
                                                                background: 'rgba(255,255,255,0.02)',
                                                                borderRadius: '8px',
                                                                border: '1px solid rgba(255,255,255,0.03)'
                                                            }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                                                                        <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{rev.user}</span>
                                                                        <span style={{ fontSize: '0.7rem', color: '#444' }}>{rev.date}</span>
                                                                        <div style={{ display: 'flex', color: 'var(--color-accent)' }}>
                                                                            {[...Array(5)].map((_, i) => (
                                                                                <Star key={i} size={10} fill={i < rev.rating ? "var(--color-accent)" : "none"} />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa', lineHeight: '1.4' }}>{rev.comment}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm("Supprimer cet avis ?")) {
                                                                            deleteReview(parseInt(prodId), index);
                                                                            showToast("Avis supprimé", "success");
                                                                        }
                                                                    }}
                                                                    style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', padding: '0.5rem' }}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        }) : (
                                        <div style={{ ...cardStyle, textAlign: 'center', padding: '4rem' }}>
                                            <Star size={48} style={{ color: '#222', marginBottom: '1rem' }} />
                                            <p style={{ color: '#555' }}>Aucun avis à gérer pour le moment.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div >
        </div >
    );
};

export default Dashboard;