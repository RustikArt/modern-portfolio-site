import React, { useState, useEffect, useMemo } from 'react';
import { useData, AVAILABLE_PERMISSIONS } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { WEBSITE_VERSION, VERSION_DETAILS } from '../version';
import BlockEditor from '../components/BlockEditor';
import AdminLoadingScreen from '../components/AdminLoadingScreen';
import * as LucideIcons from 'lucide-react';
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
    TrendingUp,
    AlignLeft,
    AlignCenter,
    PieChart,
    BarChart3,
    Sparkles,
    Ban,
    Code,
    PenLine
} from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import AnalyticsChart from '../components/dashboard/AnalyticsChart';
import ActivityLog from '../components/dashboard/ActivityLog';
import { downloadCSV } from '../utils/export';
import { sendShippingUpdate, sendVideoProof } from '../utils/emailService';

// Liste des icônes Lucide populaires pour le sélecteur de banderole
const BANNER_ICON_OPTIONS = [
    { name: 'none', label: 'Aucune icône' },
    { name: 'Sparkles', label: 'Sparkles (Étincelles)' },
    { name: 'Star', label: 'Star (Étoile)' },
    { name: 'Zap', label: 'Zap (Éclair)' },
    { name: 'Bell', label: 'Bell (Cloche)' },
    { name: 'Gift', label: 'Gift (Cadeau)' },
    { name: 'Heart', label: 'Heart (Cœur)' },
    { name: 'Tag', label: 'Tag (Étiquette)' },
    { name: 'Percent', label: 'Percent (Pourcentage)' },
    { name: 'ShoppingBag', label: 'ShoppingBag (Sac)' },
    { name: 'Truck', label: 'Truck (Livraison)' },
    { name: 'Clock', label: 'Clock (Horloge)' },
    { name: 'AlertCircle', label: 'AlertCircle (Alerte)' },
    { name: 'Info', label: 'Info (Information)' },
    { name: 'Megaphone', label: 'Megaphone (Annonce)' },
    { name: 'PartyPopper', label: 'PartyPopper (Fête)' },
    { name: 'Flame', label: 'Flame (Flamme)' },
    { name: 'Crown', label: 'Crown (Couronne)' },
    { name: 'Trophy', label: 'Trophy (Trophée)' },
    { name: 'Rocket', label: 'Rocket (Fusée)' },
    { name: 'BadgePercent', label: 'BadgePercent (Badge %)' },
    { name: 'CircleDollarSign', label: 'CircleDollarSign (Dollar)' },
    { name: 'Banknote', label: 'Banknote (Billet)' },
    { name: 'TicketPercent', label: 'TicketPercent (Promo)' },
    { name: 'CalendarDays', label: 'CalendarDays (Calendrier)' },
    { name: 'Timer', label: 'Timer (Minuteur)' },
    { name: 'Mail', label: 'Mail (Email)' },
    { name: 'MessageCircle', label: 'MessageCircle (Message)' },
    { name: 'ThumbsUp', label: 'ThumbsUp (Pouce)' },
    { name: 'Award', label: 'Award (Récompense)' },
];

// Helper pour rendre une icône Lucide par son nom
const renderLucideIcon = (iconName, props = {}) => {
    if (!iconName || iconName === 'none') return null;
    const IconComponent = LucideIcons[iconName];
    return IconComponent ? <IconComponent {...props} /> : null;
};

const Dashboard = () => {
    const {
        projects, products, orders, users, promoCodes,
        addProject, deleteProject, updateProject,
        addProduct, updateProduct, deleteProduct,
        updateOrderStatus, toggleChecklistItem, updateOrderNotes, addPromoCode, deletePromoCode,
        secureFullReset, logout, simulateOrder, deleteOrder,
        announcement, updateAnnouncement, fetchAnnouncementForAdmin,
        notifications, markNotificationAsRead, deleteNotification, markAllNotificationsAsRead,
        homeContent, setHomeContent,
        reviews, addReview, deleteReview,
        currentUser, register, deleteUser, checkPermission, loginHistory,
        showToast,
        settings, updateSettings
    } = useData();

    const [showVersionDetails, setShowVersionDetails] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeTab, setActiveTab] = useState(null); // Start null, will be set based on permissions
    const [tabInitialized, setTabInitialized] = useState(false);
    const [expandedOrders, setExpandedOrders] = useState({});
    const navigate = useNavigate();
    const notificationRef = React.useRef(null);

    // Set default tab based on permissions - only runs once
    useEffect(() => {
        if (!tabInitialized && checkPermission && currentUser) {
            // Priority order for default tab
            const tabOrder = [
                { tab: 'overview', permission: 'tab_overview' },
                { tab: 'orders', permission: 'tab_orders' },
                { tab: 'products', permission: 'tab_products' },
                { tab: 'projects', permission: 'tab_projects' },
                { tab: 'clients', permission: 'tab_clients' },
                { tab: 'promos', permission: 'tab_promos' },
                { tab: 'reviews', permission: 'tab_reviews' },
                { tab: 'homeEditor', permission: 'tab_homeEditor' },
                { tab: 'security', permission: 'tab_security' },
                { tab: 'settings', permission: 'tab_settings' }
            ];
            
            let foundTab = null;
            for (const { tab, permission } of tabOrder) {
                if (checkPermission(permission)) {
                    foundTab = tab;
                    break;
                }
            }
            
            // Set the found tab or fallback
            setActiveTab(foundTab || 'overview');
            setTabInitialized(true);
        }
    }, [checkPermission, currentUser, tabInitialized]);

    // Fetch announcement for admin on mount (includes inactive)
    useEffect(() => {
        if (fetchAnnouncementForAdmin) {
            fetchAnnouncementForAdmin();
        }
    }, []);

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
        image: '', imageType: 'url', lucideIcon: '', category: '', tags: '', is_featured: false,
        alertMessage: '', // New field
        stock: '', // Stock management
        options: []
    });

    const [optionBuilder, setOptionBuilder] = useState({ name: '', type: 'select', valuesInput: '' });
    const [promoForm, setPromoForm] = useState({ code: '', type: 'percent', value: '', minAmount: '', maxUses: '', expirationDate: '' });

    // Product Filters
    const [productFilter, setProductFilter] = useState({ category: 'all', promoOnly: false, search: '' });

    // --- GENERAL SETTINGS STATES (local before apply) ---
    const [localSiteTitle, setLocalSiteTitle] = useState('');
    const [localMaintenanceMode, setLocalMaintenanceMode] = useState(false);
    const [localGrainEffect, setLocalGrainEffect] = useState(false);
    const [localContactEmail, setLocalContactEmail] = useState('');
    const [localSocials, setLocalSocials] = useState({ instagram: '', twitter: '', discord: '' });
    const [localNavbarPadding, setLocalNavbarPadding] = useState('normal');
    const [settingsInitialized, setSettingsInitialized] = useState(false);

    // Sync local settings when settings change from context - only on initial load OR when settings object changes significantly
    useEffect(() => {
        if (settings && !settingsInitialized) {
            console.log('Dashboard: Initializing settings from context:', settings);
            setLocalSiteTitle(settings.siteTitle || '');
            setLocalMaintenanceMode(Boolean(settings.maintenanceMode));
            setLocalGrainEffect(Boolean(settings.grainEffect));
            setLocalContactEmail(settings.contactEmail || '');
            setLocalSocials(settings.socials || { instagram: '', twitter: '', discord: '' });
            setLocalNavbarPadding(settings.navbarPadding || 'normal');
            setSettingsInitialized(true);
        }
    }, [settings, settingsInitialized]);

    const [announcementText, setAnnouncementText] = useState(announcement?.text || '');
    const [announcementSubtext, setAnnouncementSubtext] = useState(announcement?.subtext || '');
    const [announcementBgColor, setAnnouncementBgColor] = useState(announcement?.bgColor || '');
    const [announcementTextColor, setAnnouncementTextColor] = useState(announcement?.textColor || '');
    const [announcementIsActive, setAnnouncementIsActive] = useState(announcement?.isActive || false);
    const [announcementShowTimer, setAnnouncementShowTimer] = useState(announcement?.showTimer || false);
    const [announcementTimerEnd, setAnnouncementTimerEnd] = useState(announcement?.timerEnd || '');
    const [announcementLink, setAnnouncementLink] = useState(announcement?.link || '');
    const [announcementHeight, setAnnouncementHeight] = useState(announcement?.height || '56px');
    const [announcementIcon, setAnnouncementIcon] = useState(announcement?.icon || 'Sparkles');
    const [announcementTextAlign, setAnnouncementTextAlign] = useState(announcement?.textAlign || 'left');
    const [announcementTimerPosition, setAnnouncementTimerPosition] = useState(announcement?.timerPosition || 'right');

    // Sync local announcement settings when announcement changes from context
    useEffect(() => {
        if (announcement) {
            setAnnouncementText(announcement.text || '');
            setAnnouncementSubtext(announcement.subtext || '');
            setAnnouncementBgColor(announcement.bgColor || '');
            setAnnouncementTextColor(announcement.textColor || '');
            setAnnouncementIsActive(announcement.isActive || false);
            setAnnouncementShowTimer(announcement.showTimer || false);
            setAnnouncementTimerEnd(announcement.timerEnd || '');
            setAnnouncementLink(announcement.link || '');
            setAnnouncementHeight(announcement.height || '56px');
            setAnnouncementIcon(announcement.icon || 'Sparkles');
            setAnnouncementTextAlign(announcement.textAlign || 'left');
            setAnnouncementTimerPosition(announcement.timerPosition || 'right');
        }
    }, [announcement]);

    // --- ADMIN REVIEW CREATION STATES ---
    const [showNewReviewForm, setShowNewReviewForm] = useState(false);
    const [newReviewForm, setNewReviewForm] = useState({ productId: '', user: '', rating: 5, comment: '' });

    // --- ADMIN ORDER SIMULATION STATES ---
    const [showSimulateOrderForm, setShowSimulateOrderForm] = useState(false);
    const [simulateOrderForm, setSimulateOrderForm] = useState({
        customerName: '',
        email: '',
        selectedProducts: [],
        status: 'Terminé',
        total: 0,
        date: new Date().toISOString().split('T')[0]
    });

    // --- USER MANAGEMENT STATES ---
    const [selectedMember, setSelectedMember] = useState(null);
    const [showMemberPassword, setShowMemberPassword] = useState(false);
    const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', password: '', roleTitle: '', permissions: [] });
    const [editingUserPermissions, setEditingUserPermissions] = useState(null);

    const handleCreateAdmin = async () => {
        if (!newAdminForm.name || !newAdminForm.email || !newAdminForm.password) {
            showToast("Veuillez remplir tous les champs", "error");
            return;
        }
        try {
            const adminData = {
                ...newAdminForm,
                role: 'admin',
                roleTitle: newAdminForm.roleTitle || 'Administrateur',
                permissions: newAdminForm.permissions.length > 0 ? newAdminForm.permissions : ['manage_orders', 'manage_products', 'manage_content', 'view_users', 'view_stats']
            };
            const result = await register(adminData);
            if (result.success) {
                showToast(`Compte pour ${newAdminForm.name} créé !`, "success");
                setNewAdminForm({ name: '', email: '', password: '', roleTitle: '', permissions: [] });
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

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.")) {
            const res = await deleteUser(userId);
            if (res.success) {
                showToast("Compte supprimé avec succès", "success");
                setSelectedMember(null);
            } else {
                showToast(res.message || "Erreur lors de la suppression", "error");
            }
        }
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
        // Detect if image is a Lucide icon
        const isLucideIcon = product.image && product.image.startsWith('lucide:');
        setProductForm({
            editId: product.id,
            name: product.name,
            price: product.price,
            discountType: dType,
            discountValue: dValue,
            image: isLucideIcon ? '' : product.image,
            imageType: isLucideIcon ? 'lucide' : 'url',
            lucideIcon: isLucideIcon ? product.image.replace('lucide:', '') : '',
            category: product.category,
            tags: product.tags ? product.tags.join(', ') : '',
            is_featured: product.is_featured || false,
            alertMessage: product.alertMessage || '',
            stock: product.stock !== null && product.stock !== undefined ? product.stock.toString() : '',
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

        // Determine image value based on imageType
        let imageValue = productForm.image || 'https://placehold.co/400x400/333?text=Product';
        if (productForm.imageType === 'lucide' && productForm.lucideIcon) {
            imageValue = `lucide:${productForm.lucideIcon}`;
        }

        const productData = {
            name: productForm.name,
            price: price,
            promoPrice: finalPromoPrice,
            image: imageValue,
            category: productForm.category,
            tags: tagsArray,
            is_featured: productForm.is_featured || false,
            alertMessage: productForm.alertMessage,
            stock: productForm.stock ? parseInt(productForm.stock) : null,
            options: productForm.options || []
        };
        if (productForm.editId) {
            updateProduct(productForm.editId, productData);
        } else {
            addProduct(productData);
        }
        setProductForm({
            editId: null, name: '', price: '', discountType: 'none', discountValue: '',
            image: '', imageType: 'url', lucideIcon: '', category: '', tags: '', is_featured: false, alertMessage: '', stock: '', options: []
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
        <div className="page" style={{ paddingTop: '140px', paddingBottom: '4rem', minHeight: '100vh', background: '#050505', color: '#eee' }}>
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
                                marginTop: '12px',
                                padding: '12px 16px',
                                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.02) 100%)',
                                borderRadius: '6px',
                                borderLeft: '3px solid var(--color-accent)',
                                fontSize: '0.75rem',
                                color: 'rgba(212, 175, 55, 0.8)',
                                whiteSpace: 'pre-line',
                                lineHeight: '1.6',
                                fontFamily: 'monospace',
                                letterSpacing: '0.5px'
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
                                            // Grouper les notifications similaires
                                            (() => {
                                                const grouped = [];
                                                const seen = new Map();
                                                
                                                notifications.forEach(n => {
                                                    const key = n.message;
                                                    if (seen.has(key)) {
                                                        seen.get(key).count++;
                                                        seen.get(key).ids.push(n.id);
                                                    } else {
                                                        const item = { ...n, count: 1, ids: [n.id] };
                                                        seen.set(key, item);
                                                        grouped.push(item);
                                                    }
                                                });
                                                
                                                return grouped.map(n => (
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
                                                            {n.type === 'success' && <CheckCircle size={18} />}
                                                            {!['order', 'account', 'contact', 'success'].includes(n.type) && <Bell size={18} />}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ fontSize: '0.8rem', margin: '0 0 0.3rem', color: n.isRead ? '#888' : '#eee' }}>
                                                                {n.message}
                                                                {n.count > 1 && (
                                                                    <span style={{ 
                                                                        marginLeft: '0.5rem',
                                                                        background: 'rgba(212, 175, 55, 0.2)',
                                                                        color: 'var(--color-accent)',
                                                                        padding: '0.1rem 0.4rem',
                                                                        borderRadius: '10px',
                                                                        fontSize: '0.7rem',
                                                                        fontWeight: 'bold'
                                                                    }}>
                                                                        x{n.count}
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <span style={{ fontSize: '0.65rem', color: '#444' }}>{new Date(n.date).toLocaleString('fr-FR')}</span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                // Supprimer toutes les notifications groupées
                                                                n.ids.forEach(id => deleteNotification(id));
                                                            }}
                                                            style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', padding: '5px' }}
                                                            onMouseEnter={e => e.target.style.color = '#ff4d4d'}
                                                            onMouseLeave={e => e.target.style.color = '#444'}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ));
                                            })()
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
                        {/* Gestion */}
                        {(checkPermission('tab_overview') || checkPermission('tab_orders') || checkPermission('tab_clients')) && (
                            <h3 style={{ fontSize: '0.65rem', color: '#444', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '2rem 0 1rem 1.5rem', fontWeight: 'bold' }}>Gestion</h3>
                        )}
                        {checkPermission('tab_overview') && (
                            <button onClick={() => setActiveTab('overview')} style={sideBtnStyle(activeTab === 'overview')}><LayoutDashboard size={18} /> Vue d'ensemble</button>
                        )}
                        {checkPermission('tab_orders') && (
                            <button onClick={() => setActiveTab('orders')} style={sideBtnStyle(activeTab === 'orders')}><ShoppingBag size={18} /> Commandes</button>
                        )}
                        {checkPermission('tab_clients') && (
                            <button onClick={() => setActiveTab('clients')} style={sideBtnStyle(activeTab === 'clients')}><Users size={18} /> Clients</button>
                        )}

                        {/* Boutique */}
                        {(checkPermission('tab_products') || checkPermission('tab_promos') || checkPermission('tab_reviews')) && (
                            <h3 style={{ fontSize: '0.65rem', color: '#444', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '2rem 0 1rem 1.5rem', fontWeight: 'bold' }}>Boutique</h3>
                        )}
                        {checkPermission('tab_products') && (
                            <button onClick={() => setActiveTab('products')} style={sideBtnStyle(activeTab === 'products')}><Plus size={18} /> Produits</button>
                        )}
                        {checkPermission('tab_promos') && (
                            <button onClick={() => setActiveTab('promos')} style={sideBtnStyle(activeTab === 'promos')}><Zap size={18} /> Codes Promo</button>
                        )}
                        {checkPermission('tab_reviews') && (
                            <button onClick={() => setActiveTab('reviews')} style={sideBtnStyle(activeTab === 'reviews')}><Star size={18} /> Avis Clients</button>
                        )}

                        {/* Contenu */}
                        {(checkPermission('tab_projects') || checkPermission('tab_homeEditor')) && (
                            <h3 style={{ fontSize: '0.65rem', color: '#444', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '2rem 0 1rem 1.5rem', fontWeight: 'bold' }}>Contenu</h3>
                        )}
                        {checkPermission('tab_projects') && (
                            <button onClick={() => setActiveTab('projects')} style={sideBtnStyle(activeTab === 'projects')}><FileCode size={18} /> Projets / Portfolio</button>
                        )}
                        {checkPermission('tab_homeEditor') && (
                            <button onClick={() => setActiveTab('homeEditor')} style={sideBtnStyle(activeTab === 'homeEditor')}><Layers size={18} /> Editeur Accueil</button>
                        )}

                        {/* Système */}
                        {(checkPermission('tab_security') || checkPermission('tab_settings')) && (
                            <h3 style={{ fontSize: '0.65rem', color: '#444', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '2rem 0 1rem 1.5rem', fontWeight: 'bold' }}>Système</h3>
                        )}
                        {checkPermission('tab_security') && (
                            <button onClick={() => setActiveTab('security')} style={sideBtnStyle(activeTab === 'security')}><Shield size={18} /> Sécurité</button>
                        )}
                        {checkPermission('tab_settings') && (
                            <button onClick={() => setActiveTab('settings')} style={sideBtnStyle(activeTab === 'settings')}><Globe size={18} /> Paramètres</button>
                        )}
                    </div>

                    {/* MAIN CONTENT */}
                    <main style={{ minWidth: 0 }}>
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

                                {/* CHARTS ROW - Order Status Pie & Category Bar */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                    {/* Order Status Pie Chart */}
                                    <div style={cardStyle}>
                                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Statuts des Commandes</h3>
                                        {(() => {
                                            const statusCounts = { 'Réception': 0, 'En cours': 0, 'Terminé': 0, 'En attente': 0 };
                                            orders.filter(o => !isArchived(o)).forEach(o => {
                                                if (o.status === 'Payé') statusCounts['Réception']++;
                                                else if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
                                            });
                                            const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
                                            
                                            if (pieData.length === 0) {
                                                return <p style={{ color: '#555', fontSize: '0.85rem', textAlign: 'center', padding: '3rem 0' }}>Aucune commande à afficher</p>;
                                            }
                                            
                                            return (
                                                <div style={{ width: '100%', height: '220px', minHeight: '220px', minWidth: '200px', position: 'relative' }}>
                                                    <ResponsiveContainer width="100%" height={220}>
                                                        <RechartsPie>
                                                            <Pie
                                                                data={pieData}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={50}
                                                                outerRadius={80}
                                                                paddingAngle={3}
                                                                dataKey="value"
                                                                label={({ name, value }) => `${name}: ${value}`}
                                                                labelLine={false}
                                                            >
                                                                {pieData.map((entry, index) => {
                                                                    const colors = { 'Réception': '#ff4d4d', 'En cours': '#ffd700', 'Terminé': '#4caf50', 'En attente': '#ff8c00' };
                                                                    return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#888'} />;
                                                                })}
                                                            </Pie>
                                                            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                                                        </RechartsPie>
                                                    </ResponsiveContainer>
                                                </div>
                                            );
                                        })()}
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                            <span style={{ fontSize: '0.7rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff4d4d' }}></span> Réception</span>
                                            <span style={{ fontSize: '0.7rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffd700' }}></span> En cours</span>
                                            <span style={{ fontSize: '0.7rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4caf50' }}></span> Terminé</span>
                                            <span style={{ fontSize: '0.7rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff8c00' }}></span> En attente</span>
                                        </div>
                                    </div>

                                    {/* Category Sales Bar Chart */}
                                    <div style={cardStyle}>
                                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Ventes par Catégorie</h3>
                                        {(() => {
                                            const catSales = {};
                                            orders.filter(o => o.status === 'Terminé' || isArchived(o)).forEach(order => {
                                                (order.items || []).forEach(item => {
                                                    const product = products.find(p => p.id === item.productId);
                                                    const cat = product?.category || 'Autre';
                                                    catSales[cat] = (catSales[cat] || 0) + (item.price || 0) * (item.quantity || 1);
                                                });
                                            });
                                            const barData = Object.entries(catSales).map(([name, total]) => ({ name, total: Math.round(total) })).sort((a, b) => b.total - a.total).slice(0, 5);
                                            
                                            if (barData.length === 0) {
                                                return <p style={{ color: '#555', fontSize: '0.85rem', textAlign: 'center', padding: '3rem 0' }}>Aucune vente terminée</p>;
                                            }
                                            
                                            return (
                                                <div style={{ width: '100%', height: '250px', minHeight: '250px', minWidth: '200px', position: 'relative' }}>
                                                    <ResponsiveContainer width="100%" height={250}>
                                                        <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                                            <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 11 }} />
                                                            <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 11 }} />
                                                            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} formatter={(v) => [`${v} €`, 'Revenus']} />
                                                            <Bar dataKey="total" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>
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
                                {/* Header with Simulate Button */}
                                {activeTab === 'orders' && checkPermission('manage_orders') && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Gestion des Commandes</h2>
                                        <button
                                            onClick={() => setShowSimulateOrderForm(!showSimulateOrderForm)}
                                            style={{ ...btnModern, background: showSimulateOrderForm ? '#333' : 'var(--color-accent)', color: showSimulateOrderForm ? '#888' : '#000', fontWeight: showSimulateOrderForm ? 'normal' : 'bold' }}
                                        >
                                            {showSimulateOrderForm ? <X size={16} /> : <Plus size={16} />}
                                            {showSimulateOrderForm ? 'Annuler' : 'Simuler une Commande'}
                                        </button>
                                    </div>
                                )}

                                {/* ADMIN SIMULATE ORDER FORM */}
                                {showSimulateOrderForm && checkPermission('manage_orders') && (
                                    <div style={{ ...cardStyle, marginBottom: '2rem', border: '1px solid var(--color-accent)' }}>
                                        <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <ShoppingCart size={18} style={{ color: 'var(--color-accent)' }} />
                                            Simuler une Commande Admin
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Nom du client *</label>
                                                <input
                                                    type="text"
                                                    placeholder="ex: Jean Dupont"
                                                    value={simulateOrderForm.customerName}
                                                    onChange={(e) => setSimulateOrderForm({ ...simulateOrderForm, customerName: e.target.value })}
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Email *</label>
                                                <input
                                                    type="email"
                                                    placeholder="ex: client@email.com"
                                                    value={simulateOrderForm.email}
                                                    onChange={(e) => setSimulateOrderForm({ ...simulateOrderForm, email: e.target.value })}
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Produit(s)</label>
                                                <select
                                                    onChange={(e) => {
                                                        const prodId = e.target.value;
                                                        if (!prodId) return;
                                                        const product = products.find(p => p.id === parseInt(prodId));
                                                        if (product && !simulateOrderForm.selectedProducts.find(sp => sp.id === product.id)) {
                                                            const newProducts = [...simulateOrderForm.selectedProducts, { ...product, quantity: 1 }];
                                                            const newTotal = newProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
                                                            setSimulateOrderForm({ ...simulateOrderForm, selectedProducts: newProducts, total: newTotal });
                                                        }
                                                        e.target.value = '';
                                                    }}
                                                    style={inputStyle}
                                                >
                                                    <option value="">+ Ajouter un produit</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name} - {p.price}€</option>
                                                    ))}
                                                </select>
                                                {simulateOrderForm.selectedProducts.length > 0 && (
                                                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {simulateOrderForm.selectedProducts.map((prod, idx) => (
                                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                                                                <span style={{ flex: 1, fontSize: '0.85rem' }}>{prod.name}</span>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={prod.quantity}
                                                                    onChange={(e) => {
                                                                        const newProducts = simulateOrderForm.selectedProducts.map((p, i) =>
                                                                            i === idx ? { ...p, quantity: parseInt(e.target.value) || 1 } : p
                                                                        );
                                                                        const newTotal = newProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
                                                                        setSimulateOrderForm({ ...simulateOrderForm, selectedProducts: newProducts, total: newTotal });
                                                                    }}
                                                                    style={{ ...inputStyle, width: '60px', padding: '0.3rem' }}
                                                                />
                                                                <span style={{ fontSize: '0.85rem', color: 'var(--color-accent)' }}>{prod.price * prod.quantity}€</span>
                                                                <button
                                                                    onClick={() => {
                                                                        const newProducts = simulateOrderForm.selectedProducts.filter((_, i) => i !== idx);
                                                                        const newTotal = newProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
                                                                        setSimulateOrderForm({ ...simulateOrderForm, selectedProducts: newProducts, total: newTotal });
                                                                    }}
                                                                    style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Statut</label>
                                                <select
                                                    value={simulateOrderForm.status}
                                                    onChange={(e) => setSimulateOrderForm({ ...simulateOrderForm, status: e.target.value })}
                                                    style={inputStyle}
                                                >
                                                    <option value="Réception">Réception</option>
                                                    <option value="En cours">En cours</option>
                                                    <option value="Terminé">Terminé</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Date de la commande</label>
                                                <input
                                                    type="date"
                                                    value={simulateOrderForm.date}
                                                    onChange={(e) => setSimulateOrderForm({ ...simulateOrderForm, date: e.target.value })}
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Total personnalisé (€)</label>
                                                <input
                                                    type="number"
                                                    placeholder="Laisser vide pour calcul auto"
                                                    value={simulateOrderForm.total || ''}
                                                    onChange={(e) => setSimulateOrderForm({ ...simulateOrderForm, total: parseFloat(e.target.value) || 0 })}
                                                    style={inputStyle}
                                                />
                                                <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.3rem' }}>
                                                    Total calculé: {simulateOrderForm.selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0)}€
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => {
                                                    setShowSimulateOrderForm(false);
                                                    setSimulateOrderForm({ customerName: '', email: '', selectedProducts: [], status: 'Terminé', total: 0, date: new Date().toISOString().split('T')[0] });
                                                }}
                                                style={{ ...btnModern, background: 'transparent', border: '1px solid #333' }}
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (!simulateOrderForm.customerName) {
                                                        showToast("Veuillez entrer un nom de client", "error");
                                                        return;
                                                    }
                                                    const items = simulateOrderForm.selectedProducts.map(p => ({
                                                        productId: p.id,
                                                        name: p.name,
                                                        price: p.price,
                                                        quantity: p.quantity,
                                                        selectedOptions: []
                                                    }));
                                                    const total = simulateOrderForm.total || items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
                                                    await simulateOrder({
                                                        customerName: simulateOrderForm.customerName,
                                                        email: simulateOrderForm.email || 'simulated@admin.com',
                                                        items,
                                                        total,
                                                        status: simulateOrderForm.status,
                                                        date: new Date(simulateOrderForm.date).toISOString()
                                                    });
                                                    showToast("Commande simulée créée avec succès", "success");
                                                    setShowSimulateOrderForm(false);
                                                    setSimulateOrderForm({ customerName: '', email: '', selectedProducts: [], status: 'Terminé', total: 0, date: new Date().toISOString().split('T')[0] });
                                                }}
                                                style={{ ...btnModern, background: 'var(--color-accent)', color: '#000', fontWeight: 'bold' }}
                                            >
                                                <Check size={16} /> Créer la commande simulée
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '1rem', fontStyle: 'italic' }}>
                                            ⚠️ Les commandes simulées impacteront les statistiques et seront marquées comme "SIMULATED_ADMIN".
                                        </p>
                                    </div>
                                )}

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

                                                                        {/* Delete button for simulated/admin orders */}
                                                                        {(order.paymentId === 'SIMULATED_ADMIN' || order.payment_id === 'SIMULATED_ADMIN') && (
                                                                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,77,77,0.2)' }}>
                                                                                <button
                                                                                    onClick={async () => {
                                                                                        if (confirm('Supprimer cette commande simulée ? Cette action est irréversible.')) {
                                                                                            await deleteOrder(order.id);
                                                                                            showToast('Commande supprimée', 'success');
                                                                                        }
                                                                                    }}
                                                                                    style={{
                                                                                        ...btnModern,
                                                                                        background: 'rgba(255, 77, 77, 0.1)',
                                                                                        border: '1px solid rgba(255, 77, 77, 0.3)',
                                                                                        color: '#ff4d4d',
                                                                                        width: '100%'
                                                                                    }}
                                                                                >
                                                                                    <Trash2 size={16} /> Supprimer cette commande simulée
                                                                                </button>
                                                                            </div>
                                                                        )}
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
                                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>{productForm.editId ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
                                    <form onSubmit={handleProductSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                                            <input type="text" placeholder="Nom du produit" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} style={inputStyle} required />
                                            <input type="number" placeholder="Prix €" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} style={inputStyle} required />
                                            <input type="number" placeholder="Stock (optionnel)" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} style={inputStyle} min="0" />
                                        </div>

                                        <div style={{ ...cardStyle, background: '#0a0a0a', border: '1px dashed #222' }}>
                                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem', textTransform: 'uppercase' }}>Advanced Option Builder</p>

                                            {/* Options List */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                                {productForm.options.map(opt => (
                                                    <div key={opt.id} style={{ padding: '0.5rem 1rem', background: '#181818', borderRadius: '30px', border: '1px solid #333', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem' }}>
                                                        <strong>{opt.name}</strong>
                                                        <span style={{ color: '#555' }}>|</span>
                                                        <span style={{ color: 'var(--color-accent)' }}>{opt.type === 'select' ? `${opt.values.length} choix` : 'Texte libre'}</span>
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
                                                             checked={announcementIsActive}
                                                             onChange={(e) => setAnnouncementIsActive(e.target.checked)}
                                                        />

                                                        <label htmlFor="reqQuote" style={{ fontSize: '0.75rem', color: '#ffcc00', cursor: 'pointer' }}>Demande de devis ?</label>
                                                    </div>
                                                )}
                                                <button type="button" onClick={handleAddOption} style={{ ...btnModern, padding: '0.8rem' }}>Ajouter</button>
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
                                            <input type="text" placeholder="Tags (séparés par virgule)" value={productForm.tags} onChange={e => setProductForm({ ...productForm, tags: e.target.value })} style={inputStyle} />
                                        </div>
                                        <textarea
                                            placeholder="Message d'alerte / Note importante (ex: Délais rallongés)"
                                            value={productForm.alertMessage}
                                            onChange={e => setProductForm({ ...productForm, alertMessage: e.target.value })}
                                            style={{ ...inputStyle, minHeight: '60px', borderRadius: '8px' }}
                                        />
                                        
                                        {/* Image Type Selector */}
                                        <div style={{ ...cardStyle, background: '#0a0a0a', border: '1px solid #222', padding: '1.5rem' }}>
                                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem', textTransform: 'uppercase' }}>Type d'image</p>
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                    <input 
                                                        type="radio" 
                                                        name="imageType" 
                                                        value="url" 
                                                        checked={productForm.imageType === 'url'} 
                                                        onChange={() => setProductForm({ ...productForm, imageType: 'url', lucideIcon: '' })}
                                                    />
                                                    URL d'image
                                                </label>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                    <input 
                                                        type="radio" 
                                                        name="imageType" 
                                                        value="lucide" 
                                                        checked={productForm.imageType === 'lucide'} 
                                                        onChange={() => setProductForm({ ...productForm, imageType: 'lucide', image: '' })}
                                                    />
                                                    Icône Lucide
                                                </label>
                                            </div>
                                            
                                            {productForm.imageType === 'url' ? (
                                                <input type="text" placeholder="URL de l'image" value={productForm.image} onChange={e => setProductForm({ ...productForm, image: e.target.value })} style={inputStyle} />
                                            ) : (
                                                <div>
                                                    <select 
                                                        value={productForm.lucideIcon} 
                                                        onChange={e => setProductForm({ ...productForm, lucideIcon: e.target.value })}
                                                        style={{ ...inputStyle, marginBottom: '1rem' }}
                                                    >
                                                        <option value="">Choisir une icône...</option>
                                                        <option value="Package">Package (Colis)</option>
                                                        <option value="ShoppingBag">ShoppingBag (Sac)</option>
                                                        <option value="Gift">Gift (Cadeau)</option>
                                                        <option value="Star">Star (Étoile)</option>
                                                        <option value="Heart">Heart (Cœur)</option>
                                                        <option value="Zap">Zap (Éclair)</option>
                                                        <option value="Crown">Crown (Couronne)</option>
                                                        <option value="Gem">Gem (Diamant)</option>
                                                        <option value="Palette">Palette (Peinture)</option>
                                                        <option value="Code">Code (Code)</option>
                                                        <option value="Layers">Layers (Calques)</option>
                                                        <option value="FileCode">FileCode (Fichier Code)</option>
                                                        <option value="Image">Image (Image)</option>
                                                        <option value="Video">Video (Vidéo)</option>
                                                        <option value="Music">Music (Musique)</option>
                                                        <option value="Headphones">Headphones (Casque)</option>
                                                        <option value="Gamepad2">Gamepad2 (Manette)</option>
                                                        <option value="Brush">Brush (Pinceau)</option>
                                                        <option value="PenTool">PenTool (Stylo)</option>
                                                        <option value="Figma">Figma</option>
                                                        <option value="Layout">Layout (Mise en page)</option>
                                                        <option value="Smartphone">Smartphone</option>
                                                        <option value="Monitor">Monitor (Écran)</option>
                                                        <option value="Globe">Globe (Web)</option>
                                                        <option value="Server">Server (Serveur)</option>
                                                        <option value="Database">Database (Base de données)</option>
                                                        <option value="Cloud">Cloud (Nuage)</option>
                                                        <option value="Lock">Lock (Sécurité)</option>
                                                        <option value="Shield">Shield (Bouclier)</option>
                                                        <option value="Rocket">Rocket (Fusée)</option>
                                                        <option value="Target">Target (Cible)</option>
                                                        <option value="Trophy">Trophy (Trophée)</option>
                                                        <option value="Award">Award (Récompense)</option>
                                                        <option value="Sparkles">Sparkles (Étincelles)</option>
                                                        <option value="Wand2">Wand2 (Baguette)</option>
                                                    </select>
                                                    {productForm.lucideIcon && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#181818', borderRadius: '8px' }}>
                                                            <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {renderLucideIcon(productForm.lucideIcon, { size: 32, color: '#d4af37' })}
                                                            </div>
                                                            <span style={{ color: '#888', fontSize: '0.85rem' }}>Prévisualisation de l'icône</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

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
                                            <input type="text" placeholder="Titre du projet" value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} style={inputStyle} required />
                                            <input type="text" placeholder="Category" value={projectForm.category} onChange={e => setProjectForm({ ...projectForm, category: e.target.value })} style={inputStyle} />
                                        </div>
                                        <input type="text" placeholder="URL de la couverture" value={projectForm.image} onChange={e => setProjectForm({ ...projectForm, image: e.target.value })} style={inputStyle} />

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
                                            <input type="number" placeholder="Montant min. (€)" value={promoForm.minAmount} onChange={e => setPromoForm({ ...promoForm, minAmount: e.target.value })} style={inputStyle} />
                                            <input type="number" placeholder="Utilisations max." value={promoForm.maxUses} onChange={e => setPromoForm({ ...promoForm, maxUses: e.target.value })} style={inputStyle} />
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
                                                    <span style={{ color: (c.maxUses && (c.uses || 0) >= c.maxUses) ? '#ff4d4d' : '#888' }}>
                                                        Utilisation: [{c.uses || 0} / {c.maxUses || '∞'}]
                                                    </span>
                                                </div>
                                            </div>
                                            <button onClick={() => deletePromoCode(c.id)} style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer' }}>Supprimer</button>
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
                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                    <button
                                                        onClick={() => handleDeleteUser(selectedMember.id)}
                                                        style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                                                    >
                                                        <Trash2 size={18} /> Supprimer le compte
                                                    </button>
                                                    <button onClick={() => setSelectedMember(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
                                                </div>
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

                                    {/* ADD ADMIN FORM (only super_admin allowed) */}
                                    {checkPermission && checkPermission('all') && (
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
                                                <input
                                                    type="text"
                                                    placeholder="Titre du rôle (ex: Modérateur, Éditeur, Gestionnaire)"
                                                    value={newAdminForm.roleTitle}
                                                    onChange={e => setNewAdminForm({ ...newAdminForm, roleTitle: e.target.value })}
                                                    style={inputStyle}
                                                />

                                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.8rem', fontWeight: 'bold' }}>Permissions</label>
                                                    {Object.entries(
                                                        AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
                                                            acc[perm.category] = acc[perm.category] || [];
                                                            acc[perm.category].push(perm);
                                                            return acc;
                                                        }, {})
                                                    ).map(([category, perms]) => (
                                                        <div key={category} style={{ marginBottom: '1rem' }}>
                                                            <div style={{ fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>{category}</div>
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                                                                {perms.map(perm => (
                                                                    <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', padding: '0.3rem 0' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={newAdminForm.permissions.includes(perm.id)}
                                                                            onChange={(e) => {
                                                                                const perms = e.target.checked
                                                                                    ? [...newAdminForm.permissions, perm.id]
                                                                                    : newAdminForm.permissions.filter(p => p !== perm.id);
                                                                                setNewAdminForm({ ...newAdminForm, permissions: perms });
                                                                            }}
                                                                            style={{ accentColor: 'var(--color-accent)' }}
                                                                        />
                                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ccc' }}>
                                                                            <span style={{ color: 'var(--color-accent)', display: 'flex' }}>{renderLucideIcon(perm.icon, { size: 14 })}</span>
                                                                            {perm.label}
                                                                        </span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewAdminForm({ ...newAdminForm, permissions: AVAILABLE_PERMISSIONS.map(p => p.id) })}
                                                            style={{ ...btnModern, padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                                        >
                                                            Tout sélectionner
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewAdminForm({ ...newAdminForm, permissions: [] })}
                                                            style={{ ...btnModern, padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid #333' }}
                                                        >
                                                            Tout désélectionner
                                                        </button>
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
                                    )}
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
                                                <input type="text" placeholder="Titre ligne 1" value={homeContent.hero.titleLine1} onChange={(e) => setHomeContent({ ...homeContent, hero: { ...homeContent.hero, titleLine1: e.target.value } })} style={inputStyle} />
                                                <input type="text" placeholder="Titre ligne 2" value={homeContent.hero.titleLine2} onChange={(e) => setHomeContent({ ...homeContent, hero: { ...homeContent.hero, titleLine2: e.target.value } })} style={inputStyle} />
                                            </div>
                                            <input type="text" placeholder="Subtitle" value={homeContent.hero.subtitle} onChange={(e) => setHomeContent({ ...homeContent, hero: { ...homeContent.hero, subtitle: e.target.value } })} style={inputStyle} />
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <input type="text" placeholder="Texte du bouton" value={homeContent.hero.buttonText} onChange={(e) => setHomeContent({ ...homeContent, hero: { ...homeContent.hero, buttonText: e.target.value } })} style={inputStyle} />
                                                <input type="text" placeholder="Lien du bouton" value={homeContent.hero.buttonLink} onChange={(e) => setHomeContent({ ...homeContent, hero: { ...homeContent.hero, buttonLink: e.target.value } })} style={inputStyle} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* FEATURED PROJECTS */}
                                    <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem' }}>
                                        <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Projets mis en avant</h3>
                                        <input type="text" placeholder="Titre de la section" value={homeContent.featuredProjects.title} onChange={(e) => setHomeContent({ ...homeContent, featuredProjects: { ...homeContent.featuredProjects, title: e.target.value } })} style={{ ...inputStyle, marginBottom: '1rem' }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', border: '1px solid #333', padding: '1rem', borderRadius: '8px' }}>
                                            {projects.map(p => {
                                                const isChecked = homeContent.featuredProjects.ids.includes(p.id);
                                                return (
                                                    <label 
                                                        key={p.id} 
                                                        style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '0.8rem', 
                                                            cursor: 'pointer', 
                                                            fontSize: '0.9rem',
                                                            padding: '0.5rem 0.8rem',
                                                            borderRadius: '6px',
                                                            background: isChecked ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                                            transition: 'background 0.2s'
                                                        }}
                                                    >
                                                        <div
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                let newIds = [...homeContent.featuredProjects.ids];
                                                                if (isChecked) newIds = newIds.filter(id => id !== p.id);
                                                                else newIds.push(p.id);
                                                                setHomeContent({ ...homeContent, featuredProjects: { ...homeContent.featuredProjects, ids: newIds } });
                                                            }}
                                                            style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                border: isChecked ? '2px solid var(--color-accent)' : '2px solid #444',
                                                                borderRadius: '4px',
                                                                background: isChecked ? 'var(--color-accent)' : 'transparent',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'all 0.2s',
                                                                flexShrink: 0
                                                            }}
                                                        >
                                                            {isChecked && <Check size={14} strokeWidth={3} color="#000" />}
                                                        </div>
                                                        <span style={{ color: isChecked ? '#fff' : '#aaa' }}>{p.title}</span>
                                                    </label>
                                                );
                                            })}
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
                                    <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem' }}>
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

                                    {/* STATS SECTION */}
                                    <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <h3 style={{ margin: 0, color: 'var(--color-accent)' }}>Statistics (Bottom section)</h3>
                                            <button onClick={() => setHomeContent({ ...homeContent, stats: [...(homeContent.stats || []), { id: Date.now(), label: 'New Stat', value: '100+' }] })} style={btnModern}><Plus size={14} /> Add</button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                            {(homeContent.stats || []).map((stat, idx) => (
                                                <div key={stat.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                        <label style={{ fontSize: '0.7rem', color: '#666' }}>Stat #{idx + 1}</label>
                                                        <button onClick={() => setHomeContent({ ...homeContent, stats: homeContent.stats.filter((_, i) => i !== idx) })} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                                    </div>
                                                    <input type="text" placeholder="Label (e.g. Clients Satisfaits)" value={stat.label} onChange={(e) => {
                                                        const newStats = [...homeContent.stats];
                                                        newStats[idx].label = e.target.value;
                                                        setHomeContent({ ...homeContent, stats: newStats });
                                                    }} style={{ ...inputStyle, marginBottom: '0.5rem' }} />
                                                    <input type="text" placeholder="Value (e.g. 250+)" value={stat.value} onChange={(e) => {
                                                        const newStats = [...homeContent.stats];
                                                        newStats[idx].value = e.target.value;
                                                        setHomeContent({ ...homeContent, stats: newStats });
                                                    }} style={inputStyle} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* TESTIMONIALS SECTION */}
                                    <div>
                                        <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Selected Testimonials</h3>
                                        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>Sélectionnez les avis qui apparaîtront sur la page d'accueil (Mis en avant).</p>
                                        <div style={{ display: 'grid', gap: '0.8rem', maxHeight: '300px', overflowY: 'auto', border: '1px solid #333', padding: '1rem', borderRadius: '8px' }}>
                                            {/* We need to get all reviews from DataContext. Dashboard uses reviews state. */}
                                            {Object.keys(reviews).length > 0 ? Object.entries(reviews).map(([prodId, prodReviews]) => (
                                                <div key={prodId}>
                                                    <h4 style={{ fontSize: '0.75rem', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Product: {products.find(p => p.id === parseInt(prodId))?.name || prodId}</h4>
                                                    <div style={{ display: 'grid', gap: '0.5rem', marginLeft: '1rem' }}>
                                                        {prodReviews.map((rev, revIdx) => {
                                                            const revId = `${prodId}-${revIdx}`;
                                                            const isSelected = (homeContent.selectedTestimonials || []).includes(revId);
                                                            return (
                                                                <label 
                                                                    key={revId} 
                                                                    style={{ 
                                                                        display: 'flex', 
                                                                        alignItems: 'center', 
                                                                        gap: '0.8rem', 
                                                                        cursor: 'pointer', 
                                                                        fontSize: '0.85rem', 
                                                                        background: isSelected ? 'rgba(212,175,55,0.1)' : 'transparent', 
                                                                        padding: '0.6rem 0.8rem', 
                                                                        borderRadius: '6px',
                                                                        transition: 'background 0.2s'
                                                                    }}
                                                                >
                                                                    <div
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            let newList = [...(homeContent.selectedTestimonials || [])];
                                                                            if (isSelected) newList = newList.filter(id => id !== revId);
                                                                            else newList.push(revId);
                                                                            setHomeContent({ ...homeContent, selectedTestimonials: newList });
                                                                        }}
                                                                        style={{
                                                                            width: '20px',
                                                                            height: '20px',
                                                                            border: isSelected ? '2px solid var(--color-accent)' : '2px solid #444',
                                                                            borderRadius: '4px',
                                                                            background: isSelected ? 'var(--color-accent)' : 'transparent',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            transition: 'all 0.2s',
                                                                            flexShrink: 0
                                                                        }}
                                                                    >
                                                                        {isSelected && <Check size={14} strokeWidth={3} color="#000" />}
                                                                    </div>
                                                                    <div style={{ flex: 1 }}>
                                                                        <strong style={{ color: isSelected ? '#fff' : '#aaa' }}>{rev.user}</strong>
                                                                        <span style={{ color: '#666' }}>: "{rev.comment.substring(0, 60)}{rev.comment.length > 60 ? '...' : ''}"</span>
                                                                    </div>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )) : (
                                                <p style={{ color: '#444', fontStyle: 'italic', textAlign: 'center' }}>No reviews available yet.</p>
                                            )}
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
                                                    value={localSiteTitle}
                                                    onChange={(e) => setLocalSiteTitle(e.target.value)}
                                                    style={inputStyle}
                                                />
                                            </div>

                                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: 'bold' }}>Mode Maintenance</span>
                                                    <div
                                                        onClick={() => setLocalMaintenanceMode(!localMaintenanceMode)}
                                                        className={`toggle-switch ${localMaintenanceMode ? 'active danger' : ''}`}
                                                    ></div>
                                                </div>
                                                <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>Si activé, le site public affichera une page de maintenance.</p>
                                            </div>

                                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: 'bold' }}>Effet de Grain</span>
                                                    <div
                                                        onClick={() => setLocalGrainEffect(!localGrainEffect)}
                                                        className={`toggle-switch ${localGrainEffect ? 'active' : ''}`}
                                                    ></div>
                                                </div>
                                                <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>Ajoute une texture de film rétro à l'arrière plan du site.</p>
                                            </div>

                                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: 'bold' }}>Épaisseur de la Navbar</span>
                                                </div>
                                                <p style={{ fontSize: '0.75rem', color: '#666', margin: '0 0 1rem 0' }}>Ajuste l'espacement vertical de la barre de navigation.</p>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {[
                                                        { value: 'compact', label: 'Compact' },
                                                        { value: 'normal', label: 'Normal' },
                                                        { value: 'large', label: 'Large' }
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => setLocalNavbarPadding(opt.value)}
                                                            style={{
                                                                flex: 1,
                                                                padding: '0.6rem 1rem',
                                                                background: localNavbarPadding === opt.value ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
                                                                color: localNavbarPadding === opt.value ? '#000' : '#888',
                                                                border: localNavbarPadding === opt.value ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                fontWeight: localNavbarPadding === opt.value ? '600' : '400',
                                                                fontSize: '0.85rem',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <h4 style={{ fontSize: '0.9rem', color: '#888', marginTop: '1rem', borderBottom: '1px solid #222', paddingBottom: '0.5rem' }}>Contact & Réseaux</h4>

                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Email de contact</label>
                                                <input
                                                    type="email"
                                                    value={localContactEmail}
                                                    onChange={(e) => setLocalContactEmail(e.target.value)}
                                                    style={inputStyle}
                                                />
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Instagram</label>
                                                    <input
                                                        type="text"
                                                        value={localSocials.instagram || ''}
                                                        onChange={(e) => setLocalSocials({ ...localSocials, instagram: e.target.value })}
                                                        style={inputStyle}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Twitter (X)</label>
                                                    <input
                                                        type="text"
                                                        value={localSocials.twitter || ''}
                                                        onChange={(e) => setLocalSocials({ ...localSocials, twitter: e.target.value })}
                                                        style={inputStyle}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Discord</label>
                                                    <input
                                                        type="text"
                                                        value={localSocials.discord || ''}
                                                        onChange={(e) => setLocalSocials({ ...localSocials, discord: e.target.value })}
                                                        style={inputStyle}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>

                                            {/* APPLY BUTTON */}
                                            <button
                                                onClick={async () => {
                                                    console.log('Saving settings with:', {
                                                        siteTitle: localSiteTitle,
                                                        maintenanceMode: localMaintenanceMode,
                                                        grainEffect: localGrainEffect,
                                                        contactEmail: localContactEmail,
                                                        socials: localSocials,
                                                        navbarPadding: localNavbarPadding
                                                    });
                                                    const success = await updateSettings({
                                                        siteTitle: localSiteTitle,
                                                        maintenanceMode: localMaintenanceMode,
                                                        grainEffect: localGrainEffect,
                                                        contactEmail: localContactEmail,
                                                        socials: localSocials,
                                                        navbarPadding: localNavbarPadding
                                                    });
                                                    if (success) {
                                                        showToast("Configuration générale mise à jour !", "success");
                                                    } else {
                                                        showToast("Erreur lors de la sauvegarde", "error");
                                                    }
                                                }}
                                                style={{ ...btnPrimaryModern, marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                                            >
                                                <Edit size={18} /> Appliquer les modifications
                                            </button>
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
                                                    id="announcementIsActive"
                                                    checked={announcementIsActive}
                                                    onChange={(e) => setAnnouncementIsActive(e.target.checked)}
                                                    className="dashboard-checkbox"
                                                />
                                                <label htmlFor="announcementIsActive" style={{ cursor: 'pointer', fontWeight: announcementIsActive ? 'bold' : 'normal', color: announcementIsActive ? 'var(--color-accent)' : '#888' }}>Activer la banderole</label>
                                            </div>

                                            <div>
                                                <label htmlFor="announcementText" style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Texte de l'annonce</label>
                                                <textarea
                                                    id="announcementText"
                                                    value={announcementText}
                                                    onChange={(e) => setAnnouncementText(e.target.value)}
                                                    style={{ ...inputStyle, minHeight: '80px' }}
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="announcementLink" style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Hyperlien (optionnel)</label>
                                                <input
                                                    type="text"
                                                    id="announcementLink"
                                                    value={announcementLink}
                                                    onChange={(e) => setAnnouncementLink(e.target.value)}
                                                    style={inputStyle}
                                                    placeholder="https://..."
                                                />
                                            </div>

                                            {/* Nouvelles options de personnalisation */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Icône (à gauche)</label>
                                                    <div style={{ position: 'relative' }}>
                                                        <select
                                                            value={announcementIcon}
                                                            onChange={(e) => setAnnouncementIcon(e.target.value)}
                                                            style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                                                        >
                                                            {BANNER_ICON_OPTIONS.map(opt => (
                                                                <option key={opt.name} value={opt.name}>{opt.label}</option>
                                                            ))}
                                                        </select>
                                                        <div style={{ 
                                                            position: 'absolute', 
                                                            left: '0.75rem', 
                                                            top: '50%', 
                                                            transform: 'translateY(-50%)',
                                                            color: announcementIcon === 'none' ? '#666' : 'var(--color-accent)',
                                                            pointerEvents: 'none'
                                                        }}>
                                                            {announcementIcon === 'none' ? <Ban size={16} /> : renderLucideIcon(announcementIcon, { size: 16 })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Épaisseur</label>
                                                    <select
                                                        value={announcementHeight}
                                                        onChange={(e) => setAnnouncementHeight(e.target.value)}
                                                        style={inputStyle}
                                                    >
                                                        <option value="40px">Fine (40px)</option>
                                                        <option value="48px">Normale (48px)</option>
                                                        <option value="56px">Standard (56px)</option>
                                                        <option value="64px">Large (64px)</option>
                                                        <option value="72px">Très large (72px)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Alignement du texte</label>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => setAnnouncementTextAlign('left')}
                                                            style={{
                                                                ...btnModern,
                                                                flex: 1,
                                                                justifyContent: 'center',
                                                                background: announcementTextAlign === 'left' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.02)',
                                                                borderColor: announcementTextAlign === 'left' ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)'
                                                            }}
                                                        >
                                                            <AlignLeft size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setAnnouncementTextAlign('center')}
                                                            style={{
                                                                ...btnModern,
                                                                flex: 1,
                                                                justifyContent: 'center',
                                                                background: announcementTextAlign === 'center' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.02)',
                                                                borderColor: announcementTextAlign === 'center' ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)'
                                                            }}
                                                        >
                                                            <AlignCenter size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Position du timer</label>
                                                    <select
                                                        value={announcementTimerPosition}
                                                        onChange={(e) => setAnnouncementTimerPosition(e.target.value)}
                                                        style={inputStyle}
                                                        disabled={!announcementShowTimer}
                                                    >
                                                        <option value="right">À droite (séparé)</option>
                                                        <option value="inline">À côté du texte</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', paddingBottom: '0.8rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        id="announcementShowTimer"
                                                        checked={announcementShowTimer}
                                                        onChange={(e ) => setAnnouncementShowTimer(e.target.checked)}
                                                        className="dashboard-checkbox"
                                                    />
                                                    <label htmlFor="announcementShowTimer" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: announcementShowTimer ? 'var(--color-accent)' : '#888' }}>
                                                        <Timer size={14} /> Compte à rebours
                                                    </label>
                                                </div>
                                                <div>
                                                    <label htmlFor="announcementTimerEnd" style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Date de fin</label>
                                                    <input
                                                        type="datetime-local"
                                                        id="announcementTimerEnd"
                                                        value={announcementTimerEnd || ''}
                                                        onChange={(e) => setAnnouncementTimerEnd(e.target.value)}
                                                        style={inputStyle}
                                                        disabled={!announcementShowTimer}
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ marginTop: '1rem' }}>
                                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '1rem' }}>Aperçu du rendu :</label>
                                                <div style={{
                                                    background: 'rgba(5, 5, 5, 0.95)',
                                                    color: '#ffffff',
                                                    padding: '0 1rem',
                                                    height: announcementHeight || '56px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: announcementTextAlign === 'center' ? 'center' : 'space-between',
                                                    borderRadius: '8px',
                                                    fontSize: '0.85rem',
                                                    gap: '1rem',
                                                    border: '1px solid rgba(212, 175, 55, 0.15)'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: announcementTextAlign === 'center' ? 'none' : 1 }}>
                                                        {announcementIcon && announcementIcon !== 'none' && (
                                                            <span style={{ color: '#d4af37', display: 'flex' }}>{renderLucideIcon(announcementIcon, { size: 18 })}</span>
                                                        )}
                                                        <span>{announcementText || 'Texte de votre annonce...'}</span>
                                                        {announcementShowTimer && announcementTimerPosition === 'inline' && (
                                                            <span style={{ color: '#d4af37', fontFamily: 'monospace', marginLeft: '0.5rem' }}>00h 00m 00s</span>
                                                        )}
                                                    </div>
                                                    {announcementShowTimer && announcementTimerPosition === 'right' && (
                                                        <div style={{ 
                                                            background: 'rgba(255, 255, 255, 0.05)',
                                                            padding: '0.35rem 0.75rem', 
                                                            borderRadius: '6px',
                                                            color: '#d4af37',
                                                            fontFamily: 'monospace',
                                                            fontSize: '0.8rem'
                                                        }}>
                                                            00h 00m 00s
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={async () => {
                                                    console.log('Saving announcement with:', {
                                                        id: announcement?.id,
                                                        text: announcementText,
                                                        isActive: announcementIsActive,
                                                    });
                                                    const success = await updateAnnouncement({
                                                        id: announcement?.id,
                                                        text: announcementText,
                                                        subtext: announcementSubtext,
                                                        bgColor: announcementBgColor,
                                                        textColor: announcementTextColor,
                                                        isActive: announcementIsActive,
                                                        showTimer: announcementShowTimer,
                                                        timerEnd: announcementTimerEnd || null,
                                                        link: announcementLink,
                                                        height: announcementHeight,
                                                        icon: announcementIcon,
                                                        textAlign: announcementTextAlign,
                                                        timerPosition: announcementTimerPosition
                                                    });
                                                    if (success) {
                                                        showToast("Configuration de la banderole appliquée !", "success");
                                                    } else {
                                                        showToast("Erreur lors de la sauvegarde", "error");
                                                    }
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Gestion des Avis</h2>
                                    {checkPermission('create_reviews') && (
                                        <button
                                            onClick={() => setShowNewReviewForm(!showNewReviewForm)}
                                            style={{ ...btnModern, background: showNewReviewForm ? '#333' : 'var(--color-accent)', color: showNewReviewForm ? '#888' : '#000', fontWeight: showNewReviewForm ? 'normal' : 'bold' }}
                                        >
                                            {showNewReviewForm ? <X size={16} /> : <Plus size={16} />}
                                            {showNewReviewForm ? 'Annuler' : 'Créer un Avis'}
                                        </button>
                                    )}
                                </div>

                                {/* ADMIN CREATE REVIEW FORM */}
                                {showNewReviewForm && checkPermission('create_reviews') && (
                                    <div style={{ ...cardStyle, marginBottom: '2rem', border: '1px solid var(--color-accent)' }}>
                                        <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Star size={18} style={{ color: 'var(--color-accent)' }} />
                                            Créer un Avis Admin
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Produit *</label>
                                                <select
                                                    value={newReviewForm.productId}
                                                    onChange={(e) => setNewReviewForm({ ...newReviewForm, productId: e.target.value })}
                                                    style={inputStyle}
                                                >
                                                    <option value="">Sélectionner un produit</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Nom du client *</label>
                                                <input
                                                    type="text"
                                                    placeholder="ex: Jean Dupont"
                                                    value={newReviewForm.user}
                                                    onChange={(e) => setNewReviewForm({ ...newReviewForm, user: e.target.value })}
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Note *</label>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button
                                                            key={star}
                                                            onClick={() => setNewReviewForm({ ...newReviewForm, rating: star })}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem' }}
                                                        >
                                                            <Star
                                                                size={24}
                                                                fill={star <= newReviewForm.rating ? 'var(--color-accent)' : 'none'}
                                                                style={{ color: 'var(--color-accent)' }}
                                                            />
                                                        </button>
                                                    ))}
                                                    <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#888' }}>{newReviewForm.rating}/5</span>
                                                </div>
                                            </div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Commentaire *</label>
                                                <textarea
                                                    placeholder="Écrire le commentaire du client..."
                                                    value={newReviewForm.comment}
                                                    onChange={(e) => setNewReviewForm({ ...newReviewForm, comment: e.target.value })}
                                                    style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => {
                                                    setShowNewReviewForm(false);
                                                    setNewReviewForm({ productId: '', user: '', rating: 5, comment: '' });
                                                }}
                                                style={{ ...btnModern, background: 'transparent', border: '1px solid #333' }}
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (!newReviewForm.productId || !newReviewForm.user || !newReviewForm.comment) {
                                                        showToast("Veuillez remplir tous les champs", "error");
                                                        return;
                                                    }
                                                    await addReview(parseInt(newReviewForm.productId), {
                                                        user: newReviewForm.user,
                                                        rating: newReviewForm.rating,
                                                        comment: newReviewForm.comment,
                                                        date: new Date().toLocaleDateString('fr-FR')
                                                    }, true); // isAdmin = true
                                                    showToast("Avis créé avec succès", "success");
                                                    setShowNewReviewForm(false);
                                                    setNewReviewForm({ productId: '', user: '', rating: 5, comment: '' });
                                                }}
                                                style={{ ...btnModern, background: 'var(--color-accent)', color: '#000', fontWeight: 'bold' }}
                                            >
                                                <Check size={16} /> Créer l'avis
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '1rem', fontStyle: 'italic' }}>
                                            ⚠️ Les avis créés manuellement seront marqués comme vérifiés et identifiés comme avis admin.
                                        </p>
                                    </div>
                                )}

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
                                                                border: rev.isAdminCreated ? '1px solid rgba(var(--color-accent-rgb), 0.3)' : '1px solid rgba(255,255,255,0.03)'
                                                            }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                                                                        <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{rev.user}</span>
                                                                        {rev.isAdminCreated && (
                                                                            <span style={{ fontSize: '0.65rem', background: 'var(--color-accent)', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>ADMIN</span>
                                                                        )}
                                                                        {rev.isVerified && !rev.isAdminCreated && (
                                                                            <span style={{ fontSize: '0.65rem', background: '#4caf50', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>Vérifié</span>
                                                                        )}
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
                                        <div style={{ ...cardStyle, textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                            <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Star size={36} style={{ color: 'var(--color-accent)', opacity: 0.6 }} />
                                            </div>
                                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#888' }}>Aucun avis client</h3>
                                            <p style={{ color: '#555', fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>Les avis clients apparaîtront ici lorsqu'ils seront soumis sur vos produits.</p>
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