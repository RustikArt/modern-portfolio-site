import React, { useState, useEffect, useMemo } from 'react';
import { useData, AVAILABLE_PERMISSIONS } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { WEBSITE_VERSION, VERSION_DETAILS } from '../version';
import BlockEditor from '../components/BlockEditor';
import './Dashboard.css';
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
    AlertTriangle,
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
    PenLine,
    DollarSign,
    Eye,
    EyeOff
} from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import AnalyticsChart from '../components/dashboard/AnalyticsChart';
import ActivityLog from '../components/dashboard/ActivityLog';
import { downloadCSV } from '../utils/export';
import { sendShippingUpdate, sendVideoProof } from '../utils/emailService';

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
        updateOrderStatus, toggleChecklistItem, updateOrderNotes, addPromoCode, deletePromoCode, updatePromoCode,
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
    const [activeTab, setActiveTab] = useState('overview'); // Default to overview
    const [tabInitialized, setTabInitialized] = useState(false);
    const [expandedOrders, setExpandedOrders] = useState({});
    const [localOrderNotes, setLocalOrderNotes] = useState({}); // Local state for order notes editing
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
    const [projectForm, setProjectForm] = useState({ editId: null, title: '', category: '', image: '', imageType: 'url', lucideIcon: '', content: '', blocks: [] });

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

    // Login History Filter
    const [loginHistoryFilter, setLoginHistoryFilter] = useState('all');
    const [selectedLoginAccount, setSelectedLoginAccount] = useState(null); // Track selected account for login history

    // Notepad save state
    const [noteSaved, setNoteSaved] = useState(false);
    
    // Home Editor section save feedback
    const [homeSectionSaved, setHomeSectionSaved] = useState({});
    
    // Local Home Editor state (only saved to global on button click)
    const [localHomeContent, setLocalHomeContent] = useState(null);
    
    // Initialize local home content when homeContent loads
    useEffect(() => {
        if (homeContent && !localHomeContent) {
            setLocalHomeContent(JSON.parse(JSON.stringify(homeContent)));
        }
    }, [homeContent]);

    // Lucide Icon Picker states
    const [iconSearch, setIconSearch] = useState('');
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [iconPickerTarget, setIconPickerTarget] = useState(null); // 'product' or 'project'
    const [bannerIconSearch, setBannerIconSearch] = useState(''); // Separate search for banner icons
    const [iconZoomLevel, setIconZoomLevel] = useState(2); // 1 = normal, 2 = zoomed (default zoomed)

    // Get all available Lucide icons (filter out non-icon exports)
    const allLucideIcons = useMemo(() => {
        const icons = Object.keys(LucideIcons).filter(key => {
            // Lucide exports React components as objects (not functions)
            // Each icon has two versions: 'Heart' and 'HeartIcon' - we keep only the short version
            if (!LucideIcons[key]) return false;
            if (key[0] !== key[0].toUpperCase()) return false;
            if (key.endsWith('Icon')) return false;
            if (key === 'createLucideIcon' || key === 'default' || key === 'icons') return false;
            // Check if it's a valid React component (has $$typeof or render)
            const comp = LucideIcons[key];
            if (typeof comp !== 'object' && typeof comp !== 'function') return false;
            return true;
        }).sort();
        return icons;
    }, []);

    // Filtered icons based on search
    const filteredIcons = useMemo(() => {
        if (!iconSearch.trim()) return allLucideIcons.slice(0, 60); // Show first 60 by default
        const search = iconSearch.toLowerCase().trim();
        return allLucideIcons.filter(icon => 
            icon.toLowerCase().includes(search)
        ).slice(0, 120); // Limit to 120 results
    }, [iconSearch, allLucideIcons]);

    // Filtered icons for banner picker
    const filteredBannerIcons = useMemo(() => {
        if (!bannerIconSearch.trim()) return allLucideIcons.slice(0, 60);
        const search = bannerIconSearch.toLowerCase().trim();
        return allLucideIcons.filter(icon => 
            icon.toLowerCase().includes(search)
        ).slice(0, 120);
    }, [bannerIconSearch, allLucideIcons]);

    // --- GENERAL SETTINGS STATES (local before apply) ---
    const [localSiteTitle, setLocalSiteTitle] = useState('');
    const [localMaintenanceMode, setLocalMaintenanceMode] = useState(false);
    const [localGrainEffect, setLocalGrainEffect] = useState(false);
    const [localContactEmail, setLocalContactEmail] = useState('');
    const [localSocials, setLocalSocials] = useState({ instagram: '', twitter: '', discord: '' });
    const [localNavbarPadding, setLocalNavbarPadding] = useState('normal');
    const [localTransparentLogo, setLocalTransparentLogo] = useState('PurpleLogoTransparent.png');
    const [localBlackLogo, setLocalBlackLogo] = useState('PurpleLogo.png');
    const [localFavicon, setLocalFavicon] = useState('PurpleLogov2.png');
    const [settingsInitialized, setSettingsInitialized] = useState(false);

    // Auto-detect logos from /public/Logos/ folder at build time
    const availableLogos = useMemo(() => {
        const logoFiles = import.meta.glob('/public/Logos/*.png', { eager: true, query: '?url', import: 'default' });
        return Object.keys(logoFiles).map(path => {
            const file = path.split('/').pop(); // Get filename
            const label = file.replace('.png', '').replace(/([a-z])([A-Z])/g, '$1 $2'); // "PurpleLogoTransparent" → "Purple Logo Transparent"
            return { file, label };
        }).sort((a, b) => a.label.localeCompare(b.label));
    }, []);

    // Sync local settings when settings change from context - only on initial load OR when settings object changes significantly
    useEffect(() => {
        if (settings && !settingsInitialized) {
            setLocalSiteTitle(settings.siteTitle || '');
            setLocalMaintenanceMode(Boolean(settings.maintenanceMode));
            setLocalGrainEffect(Boolean(settings.grainEffect));
            setLocalContactEmail(settings.contactEmail || '');
            setLocalSocials(settings.socials || { instagram: '', twitter: '', discord: '' });
            setLocalNavbarPadding(settings.navbarPadding || 'normal');
            setLocalTransparentLogo(settings.transparentLogo || 'PurpleLogoTransparent.png');
            setLocalBlackLogo(settings.blackLogo || 'PurpleLogo.png');
            setLocalFavicon(settings.favicon || 'PurpleLogov2.png');
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
        
        // Determine image value based on type
        let imageValue = projectForm.image || 'https://placehold.co/600x400/333?text=Project';
        if (projectForm.imageType === 'lucide' && projectForm.lucideIcon) {
            imageValue = `lucide:${projectForm.lucideIcon}`;
        }
        
        const projectData = {
            title: projectForm.title,
            category: projectForm.category,
            image: imageValue,
            content: projectForm.content || '',
            blocks: projectForm.blocks || []
        };
        if (projectForm.editId) {
            updateProject(projectForm.editId, projectData);
        } else {
            addProject(projectData);
        }
        setProjectForm({ editId: null, title: '', category: '', image: '', imageType: 'url', lucideIcon: '', content: '', blocks: [] });
    };

    const handleEditProject = (project) => {
        const isLucideIcon = project.image && project.image.startsWith('lucide:');
        setProjectForm({
            editId: project.id,
            title: project.title,
            category: project.category,
            image: isLucideIcon ? '' : project.image,
            imageType: isLucideIcon ? 'lucide' : 'url',
            lucideIcon: isLucideIcon ? project.image.replace('lucide:', '') : '',
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
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        width: '100%',
        padding: '0.75rem 1rem',
        marginBottom: '4px',
        background: isActive ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(34, 211, 238, 0.08) 100%)' : 'transparent',
        border: '1px solid',
        borderColor: isActive ? 'rgba(167, 139, 250, 0.25)' : 'transparent',
        borderRadius: '8px',
        color: isActive ? '#a78bfa' : '#94a3b8',
        fontSize: '0.875rem',
        fontWeight: isActive ? '600' : '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
        position: 'relative'
    });

    const stats = {
        totalRevenue: orders.reduce((acc, o) => acc + parseFloat(o.total || 0), 0).toFixed(2),
        totalOrders: orders.length,
        activeOrders: orders.filter(o => o.status !== 'Terminé').length,
        totalUsers: users.length
    };

    // --- CHART DATA PREP ---
    const getChartData = () => {
        // Group by Month - track both actual revenue and revenue without discounts
        const data = {};
        const monthOrder = {}; // Track order for sorting
        
        orders.forEach(order => {
            const date = new Date(order.date);
            const month = date.toLocaleString('default', { month: 'short' });
            const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`; // For proper sorting
            
            // Actual revenue (with discounts applied)
            const actualRevenue = parseFloat(order.total || 0);
            
            // Compute original total without discount
            let originalTotal = actualRevenue;
            if (order.promoCodeUsed || order.promo_code_used) {
                // If there's discount info stored
                const discountAmount = parseFloat(order.discountAmount || order.discount_amount || 0);
                if (discountAmount > 0) {
                    originalTotal = actualRevenue + discountAmount;
                }
            }
            // Also check items for calculating original price
            if (order.items) {
                const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                const itemsTotal = items.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0);
                if (itemsTotal > actualRevenue) {
                    originalTotal = itemsTotal;
                }
            }
            
            if (!data[month]) {
                data[month] = { value: 0, originalValue: 0 };
                monthOrder[month] = monthKey;
            }
            // Keep the most recent date for each month name
            if (monthKey > monthOrder[month]) {
                monthOrder[month] = monthKey;
            }
            data[month].value += actualRevenue;
            data[month].originalValue += originalTotal;
        });
        
        // Sort by date (oldest to newest - left to right)
        return Object.keys(data)
            .sort((a, b) => monthOrder[a].localeCompare(monthOrder[b]))
            .map(key => ({ 
                name: key, 
                value: Math.round(data[key].value * 100) / 100, 
                originalValue: Math.round(data[key].originalValue * 100) / 100 
            }));
    };

    const chartData = getChartData().length > 0 ? getChartData() : [{ name: 'Jan', value: 0, originalValue: 0 }, { name: 'Feb', value: 0, originalValue: 0 }];

    // --- ACTIVITY LOGS (MOCK FROM NOTIFICATIONS FOR NOW) ---
    // In a real app, this would be a separate 'logs' table
    const recentActivity = notifications.slice(0, 10).map(n => ({
        id: n.id,
        type: n.type || 'system',
        message: n.message,
        date: n.date
    }));

    const inputStyle = {
        padding: '0.75rem 1rem',
        background: 'rgba(18, 18, 26, 0.8)',
        border: '1px solid rgba(167, 139, 250, 0.15)',
        color: '#f8fafc',
        borderRadius: '8px',
        width: '100%',
        fontSize: '0.9rem',
        transition: 'all 0.2s ease'
    };

    const cardStyle = {
        background: 'rgba(18, 18, 26, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(167, 139, 250, 0.1)',
        borderRadius: '16px',
        padding: '1.5rem',
        transition: 'all 0.3s ease'
    };

    const btnModern = {
        padding: '0.75rem 1.25rem',
        borderRadius: '8px',
        border: '1px solid rgba(167, 139, 250, 0.15)',
        background: 'rgba(167, 139, 250, 0.08)',
        color: '#94a3b8',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        textAlign: 'left'
    };

    const btnPrimaryModern = {
        ...btnModern,
        background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
        borderColor: 'transparent',
        color: '#fff',
        fontWeight: '600'
    };


    return (
        <div className="dashboard-page">
            <div className="container" style={{ maxWidth: '1600px', padding: '0 1rem' }}>
                {/* Header */}
                <header className="dashboard-header">
                    <div className="dashboard-brand">
                        <h1>Admin Panel</h1>
                        <p
                            className="dashboard-version"
                            onClick={() => setShowVersionDetails(!showVersionDetails)}
                        >
                            {WEBSITE_VERSION} {showVersionDetails ? '▴' : '▾'}
                        </p>
                        {showVersionDetails && (
                            <div className="dashboard-version-details animate-in">
                                {VERSION_DETAILS}
                            </div>
                        )}
                    </div>

                    <div className="dashboard-header-actions">
                        {/* Notification Bell */}
                        <div style={{ position: 'relative', zIndex: 99999 }} ref={notificationRef}>
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
                                    zIndex: 999999,
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
                                                                        background: 'rgba(167, 139, 250, 0.2)',
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

                        <div className="dashboard-user-info">
                            <span className="user-role">{currentUser?.name || 'root'}@</span>
                            <span className="user-site">{settings.siteTitle?.toLowerCase() || 'rustikop'}</span>
                        </div>
                        <button onClick={handleLogout} className="btn-modern btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </header>

                <div className="dashboard-layout">
                    {/* SIDEBAR */}
                    <aside className="dashboard-sidebar">
                        {/* Section Gestion */}
                        {(checkPermission('tab_overview') || checkPermission('tab_orders') || checkPermission('tab_clients')) && (
                            <div className="sidebar-section">
                                <div className="sidebar-section-title">Gestion</div>
                                <nav className="sidebar-nav">
                                    {checkPermission('tab_overview') && (
                                        <button onClick={() => setActiveTab('overview')} style={sideBtnStyle(activeTab === 'overview')}><LayoutDashboard size={18} /> Vue d'ensemble</button>
                                    )}
                                    {checkPermission('tab_orders') && (
                                        <button onClick={() => setActiveTab('orders')} style={sideBtnStyle(activeTab === 'orders')}><ShoppingBag size={18} /> Commandes</button>
                                    )}
                                    {checkPermission('tab_clients') && (
                                        <button onClick={() => setActiveTab('clients')} style={sideBtnStyle(activeTab === 'clients')}><Users size={18} /> Clients</button>
                                    )}
                                </nav>
                            </div>
                        )}

                        {/* Section Boutique */}
                        {(checkPermission('tab_products') || checkPermission('tab_promos') || checkPermission('tab_reviews')) && (
                            <div className="sidebar-section">
                                <div className="sidebar-section-title">Boutique</div>
                                <nav className="sidebar-nav">
                                    {checkPermission('tab_products') && (
                                        <button onClick={() => setActiveTab('products')} style={sideBtnStyle(activeTab === 'products')}><Package size={18} /> Produits</button>
                                    )}
                                    {checkPermission('tab_promos') && (
                                        <button onClick={() => setActiveTab('promos')} style={sideBtnStyle(activeTab === 'promos')}><Percent size={18} /> Codes Promo</button>
                                    )}
                                    {checkPermission('tab_reviews') && (
                                        <button onClick={() => setActiveTab('reviews')} style={sideBtnStyle(activeTab === 'reviews')}><Star size={18} /> Avis Clients</button>
                                    )}
                                </nav>
                            </div>
                        )}

                        {/* Section Contenu */}
                        {(checkPermission('tab_projects') || checkPermission('tab_homeEditor')) && (
                            <div className="sidebar-section">
                                <div className="sidebar-section-title">Contenu</div>
                                <nav className="sidebar-nav">
                                    {checkPermission('tab_projects') && (
                                        <button onClick={() => setActiveTab('projects')} style={sideBtnStyle(activeTab === 'projects')}><FileCode size={18} /> Projets</button>
                                    )}
                                    {checkPermission('tab_homeEditor') && (
                                        <button onClick={() => setActiveTab('homeEditor')} style={sideBtnStyle(activeTab === 'homeEditor')}><Layers size={18} /> Éditeur Accueil</button>
                                    )}
                                </nav>
                            </div>
                        )}

                        {/* Section Système */}
                        {(checkPermission('tab_security') || checkPermission('tab_settings')) && (
                            <div className="sidebar-section">
                                <div className="sidebar-section-title">Système</div>
                                <nav className="sidebar-nav">
                                    {checkPermission('tab_security') && (
                                        <button onClick={() => setActiveTab('security')} style={sideBtnStyle(activeTab === 'security')}><Shield size={18} /> Sécurité</button>
                                    )}
                                    {checkPermission('tab_settings') && (
                                        <button onClick={() => setActiveTab('settings')} style={sideBtnStyle(activeTab === 'settings')}><Settings size={18} /> Paramètres</button>
                                    )}
                                </nav>
                            </div>
                        )}
                    </aside>

                    {/* MAIN CONTENT */}
                    <main className="dashboard-main">
                        {/* --- OVERVIEW TAB --- */}
                        {activeTab === 'overview' && (
                            <div className="animate-in">
                                <h2 className="section-title">Vue d'ensemble</h2>

                                {/* ========== SECTION 1: STATISTIQUES CLÉS ========== */}
                                <div className="overview-section">
                                    <h3 className="overview-section-title"><TrendingUp size={18} /> Statistiques Clés</h3>
                                    
                                    <div className="kpi-grid">
                                        <div className="kpi-card kpi-card--primary">
                                            <div className="kpi-card__icon"><DollarSign size={24} /></div>
                                            <div className="kpi-card__content">
                                                <div className="kpi-card__label">Chiffre d'Affaires</div>
                                                <div className="kpi-card__value">{stats.totalRevenue} €</div>
                                            </div>
                                        </div>
                                        <div className="kpi-card kpi-card--secondary">
                                            <div className="kpi-card__icon"><ShoppingBag size={24} /></div>
                                            <div className="kpi-card__content">
                                                <div className="kpi-card__label">Commandes Totales</div>
                                                <div className="kpi-card__value">{stats.totalOrders}</div>
                                            </div>
                                        </div>
                                        <div className="kpi-card kpi-card--tertiary">
                                            <div className="kpi-card__icon"><Users size={24} /></div>
                                            <div className="kpi-card__content">
                                                <div className="kpi-card__label">Utilisateurs</div>
                                                <div className="kpi-card__value">{stats.totalUsers}</div>
                                            </div>
                                        </div>
                                        <div className="kpi-card kpi-card--actions">
                                            <div className="kpi-card__icon"><Zap size={24} /></div>
                                            <div className="kpi-card__content">
                                                <div className="kpi-card__label">Accès Rapide</div>
                                                <div className="quick-actions">
                                                    <button onClick={() => setActiveTab('products')} className="btn-modern btn-modern--sm"><Plus size={16} /> Produit</button>
                                                    <button onClick={() => setActiveTab('projects')} className="btn-modern btn-modern--sm"><FileCode size={16} /> Projet</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ========== SECTION 2: GRAPHIQUES ========== */}
                                <div className="overview-section">
                                    <h3 className="overview-section-title"><BarChart3 size={18} /> Graphiques</h3>
                                    
                                    <div className="charts-grid">
                                    {/* Order Status Pie Chart */}
                                    <div className="dashboard-card">
                                        <h3 className="card-title">Statuts des Commandes</h3>
                                        {(() => {
                                            const statusCounts = { 'Réception': 0, 'En cours': 0, 'Terminé': 0, 'En attente': 0 };
                                            orders.filter(o => !isArchived(o)).forEach(o => {
                                                if (o.status === 'Payé') statusCounts['Réception']++;
                                                else if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
                                            });
                                            const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
                                            const COLORS = { 'Réception': '#fb7185', 'En cours': '#fbbf24', 'Terminé': '#a78bfa', 'En attente': '#64748b' };
                                            
                                            if (pieData.length === 0) {
                                                return <p className="empty-state">Aucune commande à afficher</p>;
                                            }
                                            
                                            return (
                                                <div className="chart-container">
                                                    <ResponsiveContainer width="100%" height={280}>
                                                        <RechartsPie>
                                                            <Legend 
                                                                layout="horizontal"
                                                                verticalAlign="top"
                                                                align="center"
                                                                wrapperStyle={{ paddingBottom: '10px', fontSize: '0.75rem' }}
                                                                formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
                                                            />
                                                            <Pie
                                                                data={pieData}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={50}
                                                                outerRadius={80}
                                                                paddingAngle={3}
                                                                dataKey="value"
                                                                label={false}
                                                                labelLine={false}
                                                                stroke="none"
                                                                style={{ outline: 'none' }}
                                                            >
                                                                {pieData.map((entry, index) => (
                                                                    <Cell 
                                                                        key={`cell-${index}`} 
                                                                        fill={COLORS[entry.name] || '#888'}
                                                                        style={{ outline: 'none', cursor: 'pointer' }}
                                                                    />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip 
                                                                isAnimationActive={false}
                                                                content={({ active, payload }) => {
                                                                    if (active && payload && payload.length) {
                                                                        const data = payload[0].payload;
                                                                        return (
                                                                            <div style={{
                                                                                background: 'rgba(10, 10, 15, 0.9)',
                                                                                border: `1px solid ${COLORS[data.name]}40`,
                                                                                borderRadius: '6px',
                                                                                padding: '6px 10px',
                                                                                fontSize: '0.75rem'
                                                                            }}>
                                                                                <span style={{ color: COLORS[data.name], fontWeight: 500 }}>{data.name}</span>
                                                                                <span style={{ color: '#94a3b8', marginLeft: '6px' }}>{data.value}</span>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null;
                                                                }}
                                                            />
                                                        </RechartsPie>
                                                    </ResponsiveContainer>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Category Sales Bar Chart */}
                                    <div className="dashboard-card">
                                        <h3 className="card-title">Ventes par Catégorie</h3>
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
                                                return <p className="empty-state">Aucune vente terminée</p>;
                                            }
                                            
                                            return (
                                                <div className="chart-container chart-container--tall">
                                                    <ResponsiveContainer width="100%" height={250}>
                                                        <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(167,139,250,0.1)" />
                                                            <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 11 }} />
                                                            <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 11 }} />
                                                            <Tooltip 
                                                                cursor={{ fill: 'rgba(167, 139, 250, 0.08)' }}
                                                                isAnimationActive={false}
                                                                content={({ active, payload }) => {
                                                                    if (active && payload && payload.length) {
                                                                        const data = payload[0].payload;
                                                                        return (
                                                                            <div style={{
                                                                                background: 'rgba(10, 10, 15, 0.9)',
                                                                                border: '1px solid rgba(167, 139, 250, 0.3)',
                                                                                borderRadius: '6px',
                                                                                padding: '6px 10px',
                                                                                fontSize: '0.75rem'
                                                                            }}>
                                                                                <span style={{ color: '#a78bfa', fontWeight: 500 }}>{data.name}</span>
                                                                                <span style={{ color: '#94a3b8', marginLeft: '6px' }}>{data.total} €</span>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null;
                                                                }}
                                                            />
                                                            <Bar dataKey="total" fill="#a78bfa" radius={[8, 8, 0, 0]} style={{ cursor: 'pointer' }} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Revenue Analytics Chart */}
                                    <AnalyticsChart
                                        data={chartData}
                                        title="Revenus Mensuels (€)"
                                    />
                                </div>
                                </div>

                                {/* ========== SECTION 3: SUIVI GÉNÉRAL ========== */}
                                <div className="overview-section">
                                    <h3 className="overview-section-title"><Clock size={18} /> Suivi Général</h3>
                                    
                                    <div className="dashboard-grid-2-1">
                                        {/* ADMIN NOTEPAD WIDGET */}
                                        <div className="dashboard-card">
                                            <div className="card-header">
                                                <h3 className="card-title">Bloc-notes Admin</h3>
                                                <button
                                                    onClick={() => {
                                                        const textarea = document.getElementById('admin-notepad');
                                                        if (textarea) {
                                                            localStorage.setItem('admin_notes', textarea.value);
                                                            setNoteSaved(true);
                                                            setTimeout(() => setNoteSaved(false), 2000);
                                                        }
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        padding: '0.5rem 1rem',
                                                        background: noteSaved ? 'rgba(34, 197, 94, 0.2)' : 'rgba(167, 139, 250, 0.15)',
                                                        border: noteSaved ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(167, 139, 250, 0.25)',
                                                        borderRadius: '8px',
                                                        color: noteSaved ? '#22c55e' : 'var(--color-accent)',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    {noteSaved ? <Check size={14} /> : <Save size={14} />}
                                                    {noteSaved ? 'Enregistré !' : 'Enregistrer'}
                                                </button>
                                            </div>
                                            <textarea
                                                id="admin-notepad"
                                                className="input-modern input-modern--textarea"
                                                placeholder="Notes rapides, idées, tâches à faire..."
                                                defaultValue={localStorage.getItem('admin_notes') || ''}
                                            />
                                        </div>

                                        <div className="dashboard-card">
                                            <h3 className="card-title">Dernière Activité</h3>
                                            <div className="activity-list">
                                                {recentActivity.slice(0, 5).map(log => (
                                                    <div key={log.id} className="activity-item">
                                                        <div className="activity-icon">
                                                            <Timer size={14} />
                                                        </div>
                                                        <div className="activity-content">
                                                            <div className="activity-message">{log.message}</div>
                                                            <div className="activity-time">{new Date(log.date).toLocaleTimeString()}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {recentActivity.length === 0 && <p className="empty-state--sm">Aucune activité récente.</p>}
                                            </div>

                                            <div className="system-info">
                                                <h4 className="system-info__title">Système</h4>
                                                <div className="system-info__row">
                                                    <span>Version</span>
                                                    <span className="system-info__value">{WEBSITE_VERSION}</span>
                                                </div>
                                                <div className="system-info__row">
                                                    <span>Status DB</span>
                                                    <span className="system-info__status system-info__status--ok">Connecté</span>
                                                </div>
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
                                    <div className="section-header">
                                        <h2 className="section-title">Gestion des Commandes</h2>
                                        <button
                                            onClick={() => setShowSimulateOrderForm(!showSimulateOrderForm)}
                                            className={`btn-modern ${showSimulateOrderForm ? 'btn-modern--ghost' : 'btn-modern--primary'}`}
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
                                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', marginBottom: '2rem', alignItems: 'start' }}>
                                                                            <div>
                                                                                <div style={{ color: '#888', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>Contact & Livraison</div>
                                                                                <div style={{ color: '#ccc', fontSize: '0.9rem' }}>{order.email}</div>
                                                                                {order.shipping && (
                                                                                    <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.8rem', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                                        <MapPin size={14} /> {order.shipping.address}, {order.shipping.city} ({order.shipping.zip})
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div>
                                                                                <div style={{ color: '#888', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '1px' }}>Statut</div>
                                                                                <select
                                                                                    className="order-status-select"
                                                                                    value={order.status}
                                                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
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
                                                                            
                                                                            {/* Promo code info section */}
                                                                            {(order.promoCodeUsed || order.promo_code_used || order.discount > 0) && (
                                                                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(167, 139, 250, 0.2)' }}>
                                                                                    <div 
                                                                                        style={{ 
                                                                                            display: 'flex', 
                                                                                            alignItems: 'center', 
                                                                                            justifyContent: 'space-between',
                                                                                            padding: '0.8rem',
                                                                                            background: 'rgba(167, 139, 250, 0.08)',
                                                                                            borderRadius: '8px',
                                                                                            border: '1px solid rgba(167, 139, 250, 0.15)'
                                                                                        }}
                                                                                    >
                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                                            <Ticket size={16} style={{ color: 'var(--color-accent)' }} />
                                                                                            <span style={{ fontSize: '0.85rem', color: '#ccc' }}>Code promo utilisé:</span>
                                                                                            <span style={{ 
                                                                                                background: 'var(--color-accent)', 
                                                                                                color: '#000', 
                                                                                                padding: '2px 8px', 
                                                                                                borderRadius: '4px', 
                                                                                                fontSize: '0.75rem', 
                                                                                                fontWeight: 'bold',
                                                                                                fontFamily: 'monospace'
                                                                                            }}>
                                                                                                {order.promoCodeUsed || order.promo_code_used || 'DISCOUNT'}
                                                                                            </span>
                                                                                        </div>
                                                                                        {order.discount > 0 && (
                                                                                            <span style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                                                                -{order.discount}€
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )}
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

                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                                            <textarea
                                                                                value={localOrderNotes[order.id] !== undefined ? localOrderNotes[order.id] : (order.notes || '')}
                                                                                onChange={(e) => setLocalOrderNotes(prev => ({ ...prev, [order.id]: e.target.value }))}
                                                                                placeholder="Notes sur la commande..."
                                                                                style={{ width: '100%', background: '#080808', border: '1px solid #222', borderRadius: '12px', padding: '1rem', color: 'white', fontSize: '0.85rem', minHeight: '100px' }}
                                                                            />
                                                                            <button
                                                                                onClick={() => {
                                                                                    const notesToSave = localOrderNotes[order.id] !== undefined ? localOrderNotes[order.id] : (order.notes || '');
                                                                                    updateOrderNotes(order.id, notesToSave);
                                                                                    setLocalOrderNotes(prev => {
                                                                                        const { [order.id]: _, ...rest } = prev;
                                                                                        return rest;
                                                                                    });
                                                                                    showToast('Notes sauvegardées', 'success');
                                                                                }}
                                                                                disabled={localOrderNotes[order.id] === undefined || localOrderNotes[order.id] === (order.notes || '')}
                                                                                style={{
                                                                                    ...btnModern,
                                                                                    alignSelf: 'flex-end',
                                                                                    background: localOrderNotes[order.id] !== undefined && localOrderNotes[order.id] !== (order.notes || '') 
                                                                                        ? 'rgba(167, 139, 250, 0.2)' 
                                                                                        : 'rgba(255,255,255,0.02)',
                                                                                    borderColor: localOrderNotes[order.id] !== undefined && localOrderNotes[order.id] !== (order.notes || '') 
                                                                                        ? 'var(--color-accent)' 
                                                                                        : 'rgba(255,255,255,0.05)',
                                                                                    color: localOrderNotes[order.id] !== undefined && localOrderNotes[order.id] !== (order.notes || '') 
                                                                                        ? 'var(--color-accent)' 
                                                                                        : '#666',
                                                                                    opacity: localOrderNotes[order.id] === undefined || localOrderNotes[order.id] === (order.notes || '') ? 0.5 : 1
                                                                                }}
                                                                            >
                                                                                <Save size={14} /> Sauvegarder Notes
                                                                            </button>
                                                                        </div>

                                                                        {/* Delete button for any order (with extra confirmation) */}
                                                                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,77,77,0.2)' }}>
                                                                            <button
                                                                                onClick={async () => {
                                                                                    const isSimulated = order.paymentId === 'SIMULATED_ADMIN' || order.payment_id === 'SIMULATED_ADMIN';
                                                                                    const confirmMsg = isSimulated 
                                                                                        ? 'Supprimer cette commande simulée ? Cette action est irréversible.'
                                                                                        : `⚠️ ATTENTION: Supprimer la commande #${order.id} ?\n\nCette commande a été payée. La suppression est définitive et irréversible.\n\nÊtes-vous absolument sûr ?`;
                                                                                    
                                                                                    if (confirm(confirmMsg)) {
                                                                                        // For paid orders, require admin password
                                                                                        if (!isSimulated) {
                                                                                            const adminPassword = prompt('Entrez le mot de passe administrateur pour confirmer la suppression:');
                                                                                            if (!adminPassword) return;
                                                                                            if (adminPassword !== import.meta.env.VITE_ADMIN_SECRET && adminPassword !== 'Rustik2024!') {
                                                                                                showToast('Mot de passe incorrect', 'error');
                                                                                                return;
                                                                                            }
                                                                                        }
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
                                                                                <Trash2 size={16} /> Supprimer cette commande
                                                                            </button>
                                                                        </div>
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
                                                    {/* Preview selected icon at top */}
                                                    {productForm.lucideIcon && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#181818', borderRadius: '8px', marginBottom: '1rem' }}>
                                                            <div style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(167, 139, 250, 0.05))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {renderLucideIcon(productForm.lucideIcon, { size: 28, color: '#a78bfa' })}
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>{productForm.lucideIcon}</span>
                                                                <p style={{ color: '#666', fontSize: '0.75rem', margin: 0 }}>Icône sélectionnée</p>
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setProductForm({ ...productForm, lucideIcon: '' })}
                                                                style={{ ...btnModern, padding: '0.5rem', color: '#ff4d4d' }}
                                                                title="Supprimer"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Search input */}
                                                    <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                                                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#555', zIndex: 1 }} />
                                                        <input 
                                                            type="text"
                                                            placeholder="Rechercher parmi 1500+ icônes... (heart, star, arrow...)"
                                                            value={iconSearch}
                                                            onChange={e => setIconSearch(e.target.value)}
                                                            style={{ ...inputStyle, paddingLeft: '36px', fontSize: '0.85rem' }}
                                                        />
                                                    </div>
                                                    
                                                    {/* Icon grid - always visible */}
                                                    <div style={{ 
                                                        background: '#111', 
                                                        border: '1px solid #222', 
                                                        borderRadius: '8px', 
                                                        maxHeight: '200px', 
                                                        overflowY: 'auto',
                                                        padding: '0.5rem'
                                                    }}>
                                                        <div style={{ padding: '0.25rem 0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #222' }}>
                                                            <span style={{ fontSize: '0.7rem', color: '#555' }}>
                                                                {filteredIcons.length} icônes {iconSearch ? `pour "${iconSearch}"` : ''} • {allLucideIcons.length} total
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(65px, 1fr))', gap: '4px' }}>
                                                            {filteredIcons.map(iconName => {
                                                                const IconComp = LucideIcons[iconName];
                                                                if (!IconComp) return null;
                                                                return (
                                                                    <button
                                                                        key={iconName}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setProductForm({ ...productForm, lucideIcon: iconName });
                                                                            setIconSearch('');
                                                                        }}
                                                                        style={{
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            alignItems: 'center',
                                                                            gap: '2px',
                                                                            padding: '6px 2px',
                                                                            background: productForm.lucideIcon === iconName ? 'rgba(167, 139, 250, 0.25)' : 'rgba(255,255,255,0.02)',
                                                                            border: productForm.lucideIcon === iconName ? '1px solid var(--color-accent)' : '1px solid transparent',
                                                                            borderRadius: '6px',
                                                                            cursor: 'pointer',
                                                                            transition: 'all 0.15s, transform 0.2s'
                                                                        }}
                                                                        onMouseOver={e => { 
                                                                            if (productForm.lucideIcon !== iconName) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                                                            e.currentTarget.style.transform = 'scale(1.15)';
                                                                            e.currentTarget.style.zIndex = '10';
                                                                        }}
                                                                        onMouseOut={e => { 
                                                                            if (productForm.lucideIcon !== iconName) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                                                            e.currentTarget.style.transform = 'scale(1)';
                                                                            e.currentTarget.style.zIndex = '1';
                                                                        }}
                                                                    >
                                                                        <IconComp size={18} color={productForm.lucideIcon === iconName ? 'var(--color-accent)' : '#888'} />
                                                                        <span style={{ fontSize: '0.55rem', color: productForm.lucideIcon === iconName ? 'var(--color-accent)' : '#555', textAlign: 'center', lineHeight: 1.1, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iconName}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        {filteredIcons.length === 0 && (
                                                            <div style={{ padding: '1rem', textAlign: 'center', color: '#555', fontSize: '0.8rem' }}>
                                                                Aucune icône pour "{iconSearch}"
                                                            </div>
                                                        )}
                                                    </div>
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
                                        .map(p => {
                                            const isProductLucideIcon = p.image && p.image.startsWith('lucide:');
                                            const ProductIcon = isProductLucideIcon ? LucideIcons[p.image.replace('lucide:', '')] : null;
                                            return (
                                            <div key={p.id} style={{ ...cardStyle, position: 'relative' }}>
                                                {p.promoPrice && (
                                                    <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--color-accent)', color: 'black', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                        PROMO
                                                    </span>
                                                )}
                                                {isProductLucideIcon && ProductIcon ? (
                                                    <div style={{ width: '100%', height: '180px', background: 'linear-gradient(135deg, rgba(var(--color-accent-rgb), 0.15) 0%, rgba(18, 18, 26, 0.95) 100%)', borderRadius: '12px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <ProductIcon size={64} color="var(--color-accent)" strokeWidth={1.5} />
                                                    </div>
                                                ) : (
                                                    <img src={`${p.image}?v=${WEBSITE_VERSION}`} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} alt="" />
                                                )}
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
                                            );
                                        })}
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
                                        
                                        {/* Image Type Selector for Projects */}
                                        <div style={{ ...cardStyle, background: '#0a0a0a', border: '1px solid #222', padding: '1.5rem' }}>
                                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem', textTransform: 'uppercase' }}>Image de couverture</p>
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                    <input 
                                                        type="radio" 
                                                        name="projectImageType" 
                                                        value="url" 
                                                        checked={projectForm.imageType === 'url'} 
                                                        onChange={() => setProjectForm({ ...projectForm, imageType: 'url', lucideIcon: '' })}
                                                    />
                                                    URL d'image
                                                </label>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                    <input 
                                                        type="radio" 
                                                        name="projectImageType" 
                                                        value="lucide" 
                                                        checked={projectForm.imageType === 'lucide'} 
                                                        onChange={() => setProjectForm({ ...projectForm, imageType: 'lucide', image: '' })}
                                                    />
                                                    Icône Lucide (HD)
                                                </label>
                                            </div>
                                            
                                            {projectForm.imageType === 'url' ? (
                                                <input type="text" placeholder="URL de la couverture" value={projectForm.image} onChange={e => setProjectForm({ ...projectForm, image: e.target.value })} style={inputStyle} />
                                            ) : (
                                                <div>
                                                    {/* Preview selected icon at top */}
                                                    {projectForm.lucideIcon && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#181818', borderRadius: '8px', marginBottom: '1rem' }}>
                                                            <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(167, 139, 250, 0.05))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {renderLucideIcon(projectForm.lucideIcon, { size: 36, color: '#a78bfa', strokeWidth: 1.5 })}
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>{projectForm.lucideIcon}</span>
                                                                <p style={{ color: '#666', fontSize: '0.75rem', margin: 0 }}>Icône HD sélectionnée</p>
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setProjectForm({ ...projectForm, lucideIcon: '' })}
                                                                style={{ ...btnModern, padding: '0.5rem', color: '#ff4d4d' }}
                                                                title="Supprimer"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Search input */}
                                                    <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                                                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#555', zIndex: 1 }} />
                                                        <input 
                                                            type="text"
                                                            placeholder="Rechercher parmi 1500+ icônes... (code, web, design...)"
                                                            value={iconSearch}
                                                            onChange={e => setIconSearch(e.target.value)}
                                                            style={{ ...inputStyle, paddingLeft: '36px', fontSize: '0.85rem' }}
                                                        />
                                                    </div>
                                                    
                                                    {/* Icon grid - always visible */}
                                                    <div style={{ 
                                                        background: '#111', 
                                                        border: '1px solid #222', 
                                                        borderRadius: '8px', 
                                                        maxHeight: '200px', 
                                                        overflowY: 'auto',
                                                        padding: '0.5rem'
                                                    }}>
                                                        <div style={{ padding: '0.25rem 0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #222' }}>
                                                            <span style={{ fontSize: '0.7rem', color: '#555' }}>
                                                                {filteredIcons.length} icônes {iconSearch ? `pour "${iconSearch}"` : ''} • {allLucideIcons.length} total
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(65px, 1fr))', gap: '4px' }}>
                                                            {filteredIcons.map(iconName => {
                                                                const IconComp = LucideIcons[iconName];
                                                                if (!IconComp) return null;
                                                                return (
                                                                    <button
                                                                        key={iconName}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setProjectForm({ ...projectForm, lucideIcon: iconName });
                                                                            setIconSearch('');
                                                                        }}
                                                                        style={{
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            alignItems: 'center',
                                                                            gap: '2px',
                                                                            padding: '6px 2px',
                                                                            background: projectForm.lucideIcon === iconName ? 'rgba(167, 139, 250, 0.25)' : 'rgba(255,255,255,0.02)',
                                                                            border: projectForm.lucideIcon === iconName ? '1px solid var(--color-accent)' : '1px solid transparent',
                                                                            borderRadius: '6px',
                                                                            cursor: 'pointer',
                                                                            transition: 'all 0.15s, transform 0.2s'
                                                                        }}
                                                                        onMouseOver={e => { 
                                                                            if (projectForm.lucideIcon !== iconName) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                                                            e.currentTarget.style.transform = 'scale(1.15)';
                                                                            e.currentTarget.style.zIndex = '10';
                                                                        }}
                                                                        onMouseOut={e => { 
                                                                            if (projectForm.lucideIcon !== iconName) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                                                            e.currentTarget.style.transform = 'scale(1)';
                                                                            e.currentTarget.style.zIndex = '1';
                                                                        }}
                                                                    >
                                                                        <IconComp size={18} color={projectForm.lucideIcon === iconName ? 'var(--color-accent)' : '#888'} />
                                                                        <span style={{ fontSize: '0.55rem', color: projectForm.lucideIcon === iconName ? 'var(--color-accent)' : '#555', textAlign: 'center', lineHeight: 1.1, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iconName}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        {filteredIcons.length === 0 && (
                                                            <div style={{ padding: '1rem', textAlign: 'center', color: '#555', fontSize: '0.8rem' }}>
                                                                Aucune icône pour "{iconSearch}"
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

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
                                    {projects.map(p => {
                                        const isProjectLucideIcon = p.image && p.image.startsWith('lucide:');
                                        const projectIconName = isProjectLucideIcon ? p.image.replace('lucide:', '') : null;
                                        return (
                                        <div key={p.id} style={cardStyle}>
                                            {isProjectLucideIcon ? (
                                                <div style={{ 
                                                    width: '100%', 
                                                    height: '200px', 
                                                    background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(18, 18, 26, 0.95) 100%)',
                                                    borderRadius: '12px', 
                                                    marginBottom: '1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {renderLucideIcon(projectIconName, { size: 64, color: '#a78bfa', strokeWidth: 1.5 })}
                                                </div>
                                            ) : (
                                                <img src={`${p.image}?v=${WEBSITE_VERSION}`} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} alt="" />
                                            )}
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
                                    );
                                    })}
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
                                        <div key={c.id} style={{ 
                                            ...cardStyle, 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            borderStyle: 'dashed',
                                            opacity: c.isActive === false ? 0.5 : 1,
                                            background: c.isActive === false ? 'rgba(40,40,40,0.5)' : cardStyle.background
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <strong style={{ fontSize: '1.2rem', color: c.isActive === false ? '#666' : 'var(--color-accent)', textDecoration: c.isActive === false ? 'line-through' : 'none' }}>{c.code}</strong>
                                                    <span style={{ color: '#fff', fontWeight: 'bold' }}>-{c.value}{c.type === 'percent' ? '%' : '€'}</span>
                                                    {c.isActive === false && <span style={{ fontSize: '0.7rem', color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Désactivé</span>}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                                    {c.minAmount != null && c.minAmount > 0 && <span style={{ color: '#a78bfa' }}>Min: {c.minAmount}€</span>}
                                                    {c.expirationDate && <span>Exp: {new Date(c.expirationDate).toLocaleDateString()}</span>}
                                                    <span style={{ color: (c.maxUses != null && (c.uses || 0) >= c.maxUses) ? '#ff4d4d' : '#888' }}>
                                                        Utilisations: [{c.uses || 0} / {c.maxUses != null ? c.maxUses : '∞'}]
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="number"
                                                    placeholder="Max"
                                                    defaultValue={c.maxUses || ''}
                                                    style={{ 
                                                        width: '50px', 
                                                        padding: '6px 8px', 
                                                        background: '#111', 
                                                        border: '1px solid #333', 
                                                        borderRadius: '6px', 
                                                        color: '#fff',
                                                        fontSize: '0.75rem',
                                                        textAlign: 'center'
                                                    }}
                                                    onBlur={(e) => {
                                                        const newMax = e.target.value ? parseInt(e.target.value) : null;
                                                        if (newMax !== c.maxUses) {
                                                            updatePromoCode(c.id, { maxUses: newMax });
                                                            showToast('Max utilisations mis à jour', 'success');
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.target.blur();
                                                        }
                                                    }}
                                                    title="Modifier le max d'utilisations"
                                                />
                                                <button 
                                                    onClick={() => updatePromoCode(c.id, { isActive: c.isActive === false ? true : false })}
                                                    style={{ 
                                                        background: c.isActive === false ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 113, 133, 0.2)', 
                                                        border: `1px solid ${c.isActive === false ? '#4ade80' : '#fb7185'}`,
                                                        color: c.isActive === false ? '#4ade80' : '#fb7185',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.75rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                    title={c.isActive === false ? 'Activer' : 'Désactiver'}
                                                >
                                                    {c.isActive === false ? <Eye size={14} /> : <EyeOff size={14} />}
                                                    {c.isActive === false ? 'Activer' : 'Désactiver'}
                                                </button>
                                                <button onClick={() => deletePromoCode(c.id)} style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }} title="Supprimer">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
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
                                                        <div style={{ background: '#080808', padding: '1rem', borderRadius: '8px' }}>
                                                            <label style={{ fontSize: '0.75rem', color: '#666', display: 'block' }}>Mot de passe</label>
                                                            <div style={{ fontSize: '0.9rem', fontFamily: 'monospace', color: '#666' }}>
                                                                ••••••••
                                                            </div>
                                                            <div style={{ fontSize: '0.65rem', color: '#444', marginTop: '0.25rem' }}>
                                                                (Chiffré - Non visible pour des raisons de sécurité)
                                                            </div>
                                                        </div>
                                                        <div style={{ background: '#080808', padding: '1rem', borderRadius: '8px' }}>
                                                            <label style={{ fontSize: '0.75rem', color: '#666', display: 'block' }}>Rôle</label>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                                                                <span style={{
                                                                    background: selectedMember.role === 'admin' || selectedMember.role === 'super_admin' ? 'var(--color-accent)' : '#222',
                                                                    color: selectedMember.role === 'admin' || selectedMember.role === 'super_admin' ? '#000' : '#fff',
                                                                    padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold'
                                                                }}>
                                                                    {selectedMember.role || 'client'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 style={{ color: 'var(--color-accent)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><TrendingUp size={20} /> Activité & Commandes</h3>
                                                    {(() => {
                                                        const memberOrders = orders.filter(o => o.email === selectedMember.email || o.userId === selectedMember.id || o.user_id === selectedMember.id);
                                                        const totalSpent = memberOrders.reduce((acc, o) => acc + parseFloat(o.total || 0), 0);
                                                        const ordersWithPromo = memberOrders.filter(o => o.promoCodeUsed || o.promo_code_used);
                                                        
                                                        // Calculate total without reductions correctly from items
                                                        let totalOriginal = 0;
                                                        memberOrders.forEach(o => {
                                                            if (o.items) {
                                                                const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
                                                                const itemsTotal = items.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0);
                                                                totalOriginal += itemsTotal;
                                                            } else {
                                                                totalOriginal += parseFloat(o.total || 0);
                                                            }
                                                        });
                                                        const promoDiscount = totalOriginal - totalSpent;
                                                        
                                                        // Count coupon usage per code
                                                        const couponUsageCount = {};
                                                        ordersWithPromo.forEach(o => {
                                                            const code = o.promoCodeUsed || o.promo_code_used;
                                                            if (code) {
                                                                couponUsageCount[code] = (couponUsageCount[code] || 0) + 1;
                                                            }
                                                        });
                                                        
                                                        return (
                                                            <div style={{ background: '#080808', padding: '1.5rem', borderRadius: '12px' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid #222' }}>
                                                                    <span style={{ color: '#888' }}>Total Dépensé (avec promos)</span>
                                                                    <strong style={{ fontSize: '1.2rem', color: '#fff' }}>{totalSpent.toFixed(2)}€</strong>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid #222' }}>
                                                                    <span style={{ color: '#888' }}>Total sans réductions</span>
                                                                    <strong style={{ fontSize: '1rem', color: '#666' }}>{totalOriginal.toFixed(2)}€</strong>
                                                                </div>
                                                                {promoDiscount > 0 && (
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid #222' }}>
                                                                        <span style={{ color: '#888' }}>Économies réalisées</span>
                                                                        <strong style={{ fontSize: '1rem', color: '#4ade80' }}>-{promoDiscount.toFixed(2)}€</strong>
                                                                    </div>
                                                                )}
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid #222' }}>
                                                                    <span style={{ color: '#888' }}>Nombre de commandes</span>
                                                                    <strong style={{ fontSize: '1rem', color: '#fff' }}>{memberOrders.length}</strong>
                                                                </div>
                                                                {Object.keys(couponUsageCount).length > 0 && (
                                                                    <div style={{ marginTop: '0.5rem' }}>
                                                                        <span style={{ color: '#888', fontSize: '0.8rem' }}>Coupons utilisés:</span>
                                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                                            {Object.entries(couponUsageCount).map(([code, count], i) => (
                                                                                <span key={i} style={{ 
                                                                                    background: 'rgba(167, 139, 250, 0.15)', 
                                                                                    color: 'var(--color-accent)', 
                                                                                    padding: '2px 8px', 
                                                                                    borderRadius: '4px', 
                                                                                    fontSize: '0.75rem',
                                                                                    fontWeight: 'bold'
                                                                                }}>{code} <span style={{ color: '#888', fontWeight: 'normal' }}>x{count}</span></span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}

                                                    <h4 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>Dernières Commandes</h4>
                                                    <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                                                        {orders.filter(o => o.email === selectedMember.email || o.userId === selectedMember.id || o.user_id === selectedMember.id).length > 0 ? (
                                                            orders.filter(o => o.email === selectedMember.email || o.userId === selectedMember.id || o.user_id === selectedMember.id).slice(0, 10).map(o => (
                                                                <div key={o.id} style={{ padding: '0.8rem', background: '#111', border: '1px solid #222', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                                    <span>#{String(o.id).slice(-6)}</span>
                                                                    <span>{new Date(o.date).toLocaleDateString('fr-FR')}</span>
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
                                                            {orders.filter(o => o.email === u.email || o.userId === u.id || o.user_id === u.id).reduce((acc, o) => acc + parseFloat(o.total || 0), 0).toFixed(2)}€
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
                        {activeTab === 'homeEditor' && localHomeContent && (
                            <div className="animate-in">
                                <section style={cardStyle}>
                                    <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Configuration de la Page d'Accueil</h2>

                                    {/* HERO SECTION */}
                                    <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <h3 style={{ margin: 0, color: 'var(--color-accent)' }}>Section Hero</h3>
                                            <button
                                                onClick={() => {
                                                    setHomeContent({ ...homeContent, hero: localHomeContent.hero });
                                                    setHomeSectionSaved(prev => ({ ...prev, hero: true }));
                                                    showToast('Section Hero sauvegardée', 'success');
                                                    setTimeout(() => setHomeSectionSaved(prev => ({ ...prev, hero: false })), 2000);
                                                }}
                                                style={{
                                                    ...btnModern,
                                                    background: homeSectionSaved.hero ? 'rgba(74, 222, 128, 0.2)' : 'rgba(167, 139, 250, 0.1)',
                                                    borderColor: homeSectionSaved.hero ? '#4ade80' : 'var(--color-accent)',
                                                    color: homeSectionSaved.hero ? '#4ade80' : 'var(--color-accent)'
                                                }}
                                            >
                                                {homeSectionSaved.hero ? <Check size={14} /> : <Save size={14} />} {homeSectionSaved.hero ? 'Sauvegardé' : 'Sauvegarder'}
                                            </button>
                                        </div>
                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <input type="text" placeholder="Titre ligne 1" value={localHomeContent.hero.titleLine1} onChange={(e) => setLocalHomeContent({ ...localHomeContent, hero: { ...localHomeContent.hero, titleLine1: e.target.value } })} style={inputStyle} />
                                                <input type="text" placeholder="Titre ligne 2" value={localHomeContent.hero.titleLine2} onChange={(e) => setLocalHomeContent({ ...localHomeContent, hero: { ...localHomeContent.hero, titleLine2: e.target.value } })} style={inputStyle} />
                                            </div>
                                            <input type="text" placeholder="Sous-titre" value={localHomeContent.hero.subtitle} onChange={(e) => setLocalHomeContent({ ...localHomeContent, hero: { ...localHomeContent.hero, subtitle: e.target.value } })} style={inputStyle} />
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <input type="text" placeholder="Texte du bouton" value={localHomeContent.hero.buttonText} onChange={(e) => setLocalHomeContent({ ...localHomeContent, hero: { ...localHomeContent.hero, buttonText: e.target.value } })} style={inputStyle} />
                                                <input type="text" placeholder="Lien du bouton" value={localHomeContent.hero.buttonLink} onChange={(e) => setLocalHomeContent({ ...localHomeContent, hero: { ...localHomeContent.hero, buttonLink: e.target.value } })} style={inputStyle} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* FEATURED PROJECTS */}
                                    <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <h3 style={{ margin: 0, color: 'var(--color-accent)' }}>Projets Mis en Avant</h3>
                                            <button
                                                onClick={() => {
                                                    setHomeContent({ ...homeContent, featuredProjects: localHomeContent.featuredProjects });
                                                    setHomeSectionSaved(prev => ({ ...prev, projects: true }));
                                                    showToast('Section Projets sauvegardée', 'success');
                                                    setTimeout(() => setHomeSectionSaved(prev => ({ ...prev, projects: false })), 2000);
                                                }}
                                                style={{
                                                    ...btnModern,
                                                    background: homeSectionSaved.projects ? 'rgba(74, 222, 128, 0.2)' : 'rgba(167, 139, 250, 0.1)',
                                                    borderColor: homeSectionSaved.projects ? '#4ade80' : 'var(--color-accent)',
                                                    color: homeSectionSaved.projects ? '#4ade80' : 'var(--color-accent)'
                                                }}
                                            >
                                                {homeSectionSaved.projects ? <Check size={14} /> : <Save size={14} />} {homeSectionSaved.projects ? 'Sauvegardé' : 'Sauvegarder'}
                                            </button>
                                        </div>
                                        <input type="text" placeholder="Titre de la section" value={localHomeContent.featuredProjects.title} onChange={(e) => setLocalHomeContent({ ...localHomeContent, featuredProjects: { ...localHomeContent.featuredProjects, title: e.target.value } })} style={{ ...inputStyle, marginBottom: '1rem' }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', border: '1px solid #333', padding: '1rem', borderRadius: '8px' }}>
                                            {projects.map(p => {
                                                const isChecked = localHomeContent.featuredProjects.ids.includes(p.id);
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
                                                            background: isChecked ? 'rgba(167, 139, 250, 0.1)' : 'transparent',
                                                            transition: 'background 0.2s'
                                                        }}
                                                    >
                                                        <div
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                let newIds = [...localHomeContent.featuredProjects.ids];
                                                                if (isChecked) newIds = newIds.filter(id => id !== p.id);
                                                                else newIds.push(p.id);
                                                                setLocalHomeContent({ ...localHomeContent, featuredProjects: { ...localHomeContent.featuredProjects, ids: newIds } });
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
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => {
                                                        setHomeContent({ ...homeContent, services: localHomeContent.services });
                                                        setHomeSectionSaved(prev => ({ ...prev, services: true }));
                                                        showToast('Section Services sauvegardée', 'success');
                                                        setTimeout(() => setHomeSectionSaved(prev => ({ ...prev, services: false })), 2000);
                                                    }}
                                                    style={{
                                                        ...btnModern,
                                                        background: homeSectionSaved.services ? 'rgba(74, 222, 128, 0.2)' : 'rgba(167, 139, 250, 0.1)',
                                                        borderColor: homeSectionSaved.services ? '#4ade80' : 'var(--color-accent)',
                                                        color: homeSectionSaved.services ? '#4ade80' : 'var(--color-accent)'
                                                    }}
                                                >
                                                    {homeSectionSaved.services ? <Check size={14} /> : <Save size={14} />} {homeSectionSaved.services ? 'Sauvegardé' : 'Sauvegarder'}
                                                </button>
                                                <button onClick={() => setLocalHomeContent({ ...localHomeContent, services: [...localHomeContent.services, { id: Date.now(), title: 'Nouveau Service', icon: 'Star', description: 'Description' }] })} style={btnModern}><Plus size={14} /> Ajouter</button>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                                            {localHomeContent.services.map((service, idx) => (
                                                <div key={service.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <label style={{ fontSize: '0.7rem', color: '#666' }}>Icône (nom Lucide)</label>
                                                            <input type="text" value={service.icon} onChange={(e) => {
                                                                const newServices = [...localHomeContent.services];
                                                                newServices[idx].icon = e.target.value;
                                                                setLocalHomeContent({ ...localHomeContent, services: newServices });
                                                            }} style={inputStyle} />
                                                        </div>
                                                        <div style={{ flex: 2 }}>
                                                            <label style={{ fontSize: '0.7rem', color: '#666' }}>Titre</label>
                                                            <input type="text" value={service.title} onChange={(e) => {
                                                                const newServices = [...localHomeContent.services];
                                                                newServices[idx].title = e.target.value;
                                                                setLocalHomeContent({ ...localHomeContent, services: newServices });
                                                            }} style={inputStyle} />
                                                        </div>
                                                        <button onClick={() => setLocalHomeContent({ ...localHomeContent, services: localHomeContent.services.filter((_, i) => i !== idx) })} style={{ ...btnModern, color: '#ff4d4d', marginTop: 'auto' }}><Trash2 size={14} /></button>
                                                    </div>
                                                    <input type="text" placeholder="Description" value={service.description} onChange={(e) => {
                                                        const newServices = [...localHomeContent.services];
                                                        newServices[idx].description = e.target.value;
                                                        setLocalHomeContent({ ...localHomeContent, services: newServices });
                                                    }} style={inputStyle} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <h3 style={{ margin: 0, color: 'var(--color-accent)' }}>Appel à l'Action</h3>
                                            <button
                                                onClick={() => {
                                                    setHomeContent({ ...homeContent, cta: localHomeContent.cta });
                                                    setHomeSectionSaved(prev => ({ ...prev, cta: true }));
                                                    showToast('Section CTA sauvegardée', 'success');
                                                    setTimeout(() => setHomeSectionSaved(prev => ({ ...prev, cta: false })), 2000);
                                                }}
                                                style={{
                                                    ...btnModern,
                                                    background: homeSectionSaved.cta ? 'rgba(74, 222, 128, 0.2)' : 'rgba(167, 139, 250, 0.1)',
                                                    borderColor: homeSectionSaved.cta ? '#4ade80' : 'var(--color-accent)',
                                                    color: homeSectionSaved.cta ? '#4ade80' : 'var(--color-accent)'
                                                }}
                                            >
                                                {homeSectionSaved.cta ? <Check size={14} /> : <Save size={14} />} {homeSectionSaved.cta ? 'Sauvegardé' : 'Sauvegarder'}
                                            </button>
                                        </div>
                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                            <input type="text" placeholder="Titre" value={localHomeContent.cta.title} onChange={(e) => setLocalHomeContent({ ...localHomeContent, cta: { ...localHomeContent.cta, title: e.target.value } })} style={inputStyle} />
                                            <input type="text" placeholder="Texte" value={localHomeContent.cta.text} onChange={(e) => setLocalHomeContent({ ...localHomeContent, cta: { ...localHomeContent.cta, text: e.target.value } })} style={inputStyle} />
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <input type="text" placeholder="Texte du bouton" value={localHomeContent.cta.buttonText} onChange={(e) => setLocalHomeContent({ ...localHomeContent, cta: { ...localHomeContent.cta, buttonText: e.target.value } })} style={inputStyle} />
                                                <input type="text" placeholder="Lien du bouton" value={localHomeContent.cta.buttonLink} onChange={(e) => setLocalHomeContent({ ...localHomeContent, cta: { ...localHomeContent.cta, buttonLink: e.target.value } })} style={inputStyle} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* STATS SECTION */}
                                    <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <h3 style={{ margin: 0, color: 'var(--color-accent)' }}>Statistiques (Section du bas)</h3>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => {
                                                        setHomeContent({ ...homeContent, stats: localHomeContent.stats });
                                                        setHomeSectionSaved(prev => ({ ...prev, stats: true }));
                                                        showToast('Section Statistiques sauvegardée', 'success');
                                                        setTimeout(() => setHomeSectionSaved(prev => ({ ...prev, stats: false })), 2000);
                                                    }}
                                                    style={{
                                                        ...btnModern,
                                                        background: homeSectionSaved.stats ? 'rgba(74, 222, 128, 0.2)' : 'rgba(167, 139, 250, 0.1)',
                                                        borderColor: homeSectionSaved.stats ? '#4ade80' : 'var(--color-accent)',
                                                        color: homeSectionSaved.stats ? '#4ade80' : 'var(--color-accent)'
                                                    }}
                                                >
                                                    {homeSectionSaved.stats ? <Check size={14} /> : <Save size={14} />} {homeSectionSaved.stats ? 'Sauvegardé' : 'Sauvegarder'}
                                                </button>
                                                <button onClick={() => setLocalHomeContent({ ...localHomeContent, stats: [...(localHomeContent.stats || []), { id: Date.now(), label: 'Nouvelle Stat', value: '100+' }] })} style={btnModern}><Plus size={14} /> Ajouter</button>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                            {(localHomeContent.stats || []).map((stat, idx) => (
                                                <div key={stat.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                        <label style={{ fontSize: '0.7rem', color: '#666' }}>Stat #{idx + 1}</label>
                                                        <button onClick={() => setLocalHomeContent({ ...localHomeContent, stats: localHomeContent.stats.filter((_, i) => i !== idx) })} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                                    </div>
                                                    <input type="text" placeholder="Libellé (ex: Clients Satisfaits)" value={stat.label} onChange={(e) => {
                                                        const newStats = [...localHomeContent.stats];
                                                        newStats[idx].label = e.target.value;
                                                        setLocalHomeContent({ ...localHomeContent, stats: newStats });
                                                    }} style={{ ...inputStyle, marginBottom: '0.5rem' }} />
                                                    <input type="text" placeholder="Valeur (ex: 250+)" value={stat.value} onChange={(e) => {
                                                        const newStats = [...localHomeContent.stats];
                                                        newStats[idx].value = e.target.value;
                                                        setLocalHomeContent({ ...localHomeContent, stats: newStats });
                                                    }} style={inputStyle} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* TESTIMONIALS SECTION */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <h3 style={{ margin: 0, color: 'var(--color-accent)' }}>Témoignages Sélectionnés</h3>
                                            <button
                                                onClick={() => {
                                                    setHomeContent({ ...homeContent, selectedTestimonials: localHomeContent.selectedTestimonials });
                                                    setHomeSectionSaved(prev => ({ ...prev, testimonials: true }));
                                                    showToast('Section Témoignages sauvegardée', 'success');
                                                    setTimeout(() => setHomeSectionSaved(prev => ({ ...prev, testimonials: false })), 2000);
                                                }}
                                                style={{
                                                    ...btnModern,
                                                    background: homeSectionSaved.testimonials ? 'rgba(74, 222, 128, 0.2)' : 'rgba(167, 139, 250, 0.1)',
                                                    borderColor: homeSectionSaved.testimonials ? '#4ade80' : 'var(--color-accent)',
                                                    color: homeSectionSaved.testimonials ? '#4ade80' : 'var(--color-accent)'
                                                }}
                                            >
                                                {homeSectionSaved.testimonials ? <Check size={14} /> : <Save size={14} />} {homeSectionSaved.testimonials ? 'Sauvegardé' : 'Sauvegarder'}
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>Sélectionnez les avis qui apparaîtront sur la page d'accueil (Mis en avant).</p>
                                        <div style={{ display: 'grid', gap: '0.8rem', maxHeight: '300px', overflowY: 'auto', border: '1px solid #333', padding: '1rem', borderRadius: '8px' }}>
                                            {(() => {
                                                // Filter products that actually have reviews with content
                                                const productsWithReviews = Object.entries(reviews).filter(([prodId, prodReviews]) => 
                                                    Array.isArray(prodReviews) && prodReviews.length > 0 && prodReviews.some(r => r.comment && r.comment.trim())
                                                );
                                                
                                                if (productsWithReviews.length === 0) {
                                                    return <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>Aucun avis client disponible pour le moment.</p>;
                                                }
                                                
                                                return productsWithReviews.map(([prodId, prodReviews]) => (
                                                    <div key={prodId}>
                                                        <h4 style={{ fontSize: '0.75rem', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Produit: {products.find(p => p.id === parseInt(prodId))?.name || prodId}</h4>
                                                        <div style={{ display: 'grid', gap: '0.5rem', marginLeft: '1rem' }}>
                                                            {prodReviews.filter(r => r.comment && r.comment.trim()).map((rev, revIdx) => {
                                                            const revId = `${prodId}-${revIdx}`;
                                                            const isSelected = (localHomeContent.selectedTestimonials || []).includes(revId);
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
                                                                            let newList = [...(localHomeContent.selectedTestimonials || [])];
                                                                            if (isSelected) newList = newList.filter(id => id !== revId);
                                                                            else newList.push(revId);
                                                                            setLocalHomeContent({ ...localHomeContent, selectedTestimonials: newList });
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
                                                ));
                                            })()}
                                        </div>
                                    </div>

                                </section>
                            </div>
                        )}

                        {/* --- SECURITY TAB --- */}
                        {activeTab === 'security' && (
                            <div className="animate-in">
                                <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Sécurité & Accès</h2>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                                    {/* Accounts List with Login Attempts */}
                                    <div style={cardStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div style={{ background: 'rgba(167, 139, 250, 0.1)', padding: '0.8rem', borderRadius: '12px', color: 'var(--color-accent)' }}>
                                                <Users size={24} />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Comptes avec Connexions</h3>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>Cliquez pour voir l'historique</p>
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                            <button
                                                onClick={() => setLoginHistoryFilter('all')}
                                                style={{
                                                    ...btnModern,
                                                    flex: 1,
                                                    justifyContent: 'center',
                                                    background: loginHistoryFilter === 'all' ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255,255,255,0.02)',
                                                    borderColor: loginHistoryFilter === 'all' ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                Tous
                                            </button>
                                            <button
                                                onClick={() => setLoginHistoryFilter('admin')}
                                                style={{
                                                    ...btnModern,
                                                    flex: 1,
                                                    justifyContent: 'center',
                                                    background: loginHistoryFilter === 'admin' ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255,255,255,0.02)',
                                                    borderColor: loginHistoryFilter === 'admin' ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                Admins
                                            </button>
                                            <button
                                                onClick={() => setLoginHistoryFilter('clients')}
                                                style={{
                                                    ...btnModern,
                                                    flex: 1,
                                                    justifyContent: 'center',
                                                    background: loginHistoryFilter === 'clients' ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255,255,255,0.02)',
                                                    borderColor: loginHistoryFilter === 'clients' ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                Clients
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                                            {(() => {
                                                // Get list of existing user emails for filtering
                                                const existingEmails = new Set((users || []).map(u => u.email?.toLowerCase()));
                                                
                                                // Group login history by email (userEmail or attemptEmail for failed)
                                                const accountsMap = {};
                                                (loginHistory || []).forEach(entry => {
                                                    const email = entry.userEmail || entry.attemptEmail;
                                                    if (!email) return;
                                                    // Only show accounts that exist in the system
                                                    if (!existingEmails.has(email.toLowerCase())) return;
                                                    if (!accountsMap[email]) {
                                                        accountsMap[email] = {
                                                            email,
                                                            name: entry.userName || email.split('@')[0],
                                                            isAdmin: entry.isAdmin,
                                                            attempts: [],
                                                            successCount: 0,
                                                            failCount: 0
                                                        };
                                                    }
                                                    accountsMap[email].attempts.push(entry);
                                                    if (entry.success === false) accountsMap[email].failCount++;
                                                    else accountsMap[email].successCount++;
                                                    // Update isAdmin if we have more recent info
                                                    if (entry.isAdmin !== undefined) accountsMap[email].isAdmin = entry.isAdmin;
                                                });
                                                
                                                const accounts = Object.values(accountsMap)
                                                    .filter(acc => {
                                                        if (loginHistoryFilter === 'admin') return acc.isAdmin;
                                                        if (loginHistoryFilter === 'clients') return !acc.isAdmin;
                                                        return true;
                                                    })
                                                    .sort((a, b) => {
                                                        const aLatest = a.attempts[0]?.timestamp || '';
                                                        const bLatest = b.attempts[0]?.timestamp || '';
                                                        return bLatest.localeCompare(aLatest);
                                                    });
                                                
                                                if (accounts.length === 0) {
                                                    return <p style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>Aucun compte avec connexion.</p>;
                                                }
                                                
                                                return accounts.map(acc => (
                                                    <div
                                                        key={acc.email}
                                                        onClick={() => setSelectedLoginAccount(selectedLoginAccount === acc.email ? null : acc.email)}
                                                        style={{
                                                            padding: '0.8rem',
                                                            background: selectedLoginAccount === acc.email ? 'rgba(167, 139, 250, 0.15)' : 'rgba(255,255,255,0.02)',
                                                            borderRadius: '8px',
                                                            border: selectedLoginAccount === acc.email ? '1px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.05)',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div>
                                                                <div style={{ fontSize: '0.85rem', color: '#eee', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    {acc.name}
                                                                    {acc.isAdmin && (
                                                                        <span style={{ fontSize: '0.55rem', background: 'var(--color-accent)', color: '#000', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>ADMIN</span>
                                                                    )}
                                                                </div>
                                                                <div style={{ fontSize: '0.7rem', color: '#666' }}>{acc.email}</div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                <span style={{ fontSize: '0.7rem', color: '#4ade80' }}>✓{acc.successCount}</span>
                                                                {acc.failCount > 0 && (
                                                                    <span style={{ fontSize: '0.7rem', color: '#ff4d4d' }}>✗{acc.failCount}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>

                                    {/* Login History for Selected Account */}
                                    <div style={cardStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div style={{ background: 'rgba(167, 139, 250, 0.1)', padding: '0.8rem', borderRadius: '12px', color: 'var(--color-accent)' }}>
                                                <Shield size={24} />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                                                    {selectedLoginAccount ? `Historique: ${selectedLoginAccount}` : 'Historique de Connexion'}
                                                </h3>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>
                                                    {selectedLoginAccount ? 'Tentatives de connexion du compte' : 'Sélectionnez un compte à gauche'}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                                            {selectedLoginAccount ? (
                                                (loginHistory || [])
                                                    .filter(entry => (entry.userEmail || entry.attemptEmail) === selectedLoginAccount)
                                                    .slice(0, 20)
                                                    .map((entry, idx) => (
                                                        <div key={idx} style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '0.8rem',
                                                            background: entry.success === false ? 'rgba(255, 77, 77, 0.05)' : 'rgba(74, 222, 128, 0.05)',
                                                            borderRadius: '8px',
                                                            border: entry.success === false ? '1px solid rgba(255, 77, 77, 0.2)' : '1px solid rgba(74, 222, 128, 0.2)'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                                <div style={{
                                                                    width: '28px',
                                                                    height: '28px',
                                                                    borderRadius: '50%',
                                                                    background: entry.success === false ? 'rgba(255, 77, 77, 0.2)' : 'rgba(74, 222, 128, 0.2)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: entry.success === false ? '#ff4d4d' : '#4ade80'
                                                                }}>
                                                                    {entry.success === false ? <X size={14} /> : <Check size={14} />}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: '0.8rem', color: entry.success === false ? '#ff4d4d' : '#4ade80', fontWeight: 'bold' }}>
                                                                        {entry.success === false ? 'Échec' : 'Succès'}
                                                                    </div>
                                                                    {entry.failureReason && (
                                                                        <div style={{ fontSize: '0.65rem', color: '#888' }}>{entry.failureReason}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <div style={{ fontSize: '0.75rem', color: '#aaa' }}>
                                                                    {new Date(entry.timestamp).toLocaleDateString('fr-FR')}
                                                                </div>
                                                                <div style={{ fontSize: '0.65rem', color: '#666' }}>
                                                                    {new Date(entry.timestamp).toLocaleTimeString('fr-FR')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                            ) : (
                                                (loginHistory || [])
                                                    .slice(0, 15)
                                                    .map((entry, idx) => (
                                                        <div key={idx} style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '0.8rem',
                                                            background: entry.success === false ? 'rgba(255, 77, 77, 0.05)' : 'rgba(255,255,255,0.02)',
                                                            borderRadius: '8px',
                                                            border: entry.success === false ? '1px solid rgba(255, 77, 77, 0.2)' : '1px solid rgba(255,255,255,0.05)'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                                <div style={{
                                                                    width: '28px',
                                                                    height: '28px',
                                                                    borderRadius: '50%',
                                                                    background: entry.success === false ? 'rgba(255, 77, 77, 0.2)' : 'rgba(74, 222, 128, 0.2)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: entry.success === false ? '#ff4d4d' : '#4ade80'
                                                                }}>
                                                                    {entry.success === false ? <X size={14} /> : <Check size={14} />}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: '0.85rem', color: '#eee', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                        {entry.userName || entry.attemptEmail || entry.userEmail}
                                                                        {entry.isAdmin && (
                                                                            <span style={{ fontSize: '0.55rem', background: 'var(--color-accent)', color: '#000', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>ADMIN</span>
                                                                        )}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.65rem', color: '#666' }}>{entry.userEmail || entry.attemptEmail}</div>
                                                                </div>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <div style={{ fontSize: '0.75rem', color: entry.success === false ? '#ff4d4d' : 'var(--color-accent)' }}>
                                                                    {new Date(entry.timestamp).toLocaleDateString('fr-FR')}
                                                                </div>
                                                                <div style={{ fontSize: '0.65rem', color: '#666' }}>
                                                                    {new Date(entry.timestamp).toLocaleTimeString('fr-FR')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                            )}
                                            {(!loginHistory || loginHistory.length === 0) && !selectedLoginAccount && (
                                                <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>Aucun historique disponible.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '2rem' }}>
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
                                                onClick={async () => {
                                                    const pwd = prompt("Entrez le mot de passe de sécurité :");
                                                    if (pwd) {
                                                        const result = await secureFullReset(pwd);
                                                        if (result) {
                                                            showToast("Réinitialisation terminée", "success");
                                                        } else {
                                                            showToast("Mot de passe incorrect", "error");
                                                        }
                                                    }
                                                }}
                                                style={{ ...btnModern, width: '100%', justifyContent: 'center', border: '1px solid #ff4d4d', color: '#ff4d4d', background: 'transparent' }}
                                            >
                                                Réinitialisation Globale
                                            </button>
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

                                            <h4 style={{ fontSize: '0.9rem', color: '#888', marginTop: '1rem', borderBottom: '1px solid #222', paddingBottom: '0.5rem' }}>Logos du Site</h4>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                                {/* Logo Transparent (Navbar) */}
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Logo Navbar</label>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <img 
                                                            src={`/Logos/${localTransparentLogo}`} 
                                                            alt="Logo actuel"
                                                            style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', background: 'rgba(0,0,0,0.3)' }}
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                        <select
                                                            value={localTransparentLogo}
                                                            onChange={(e) => setLocalTransparentLogo(e.target.value)}
                                                            style={{ ...inputStyle, flex: 1 }}
                                                        >
                                                            {availableLogos.map(logo => (
                                                                <option key={`trans-${logo.file}`} value={logo.file}>{logo.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Logo Fond Noir (SEO) */}
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Logo SEO</label>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <img 
                                                            src={`/Logos/${localBlackLogo}`} 
                                                            alt="Logo actuel"
                                                            style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', background: 'rgba(0,0,0,0.3)' }}
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                        <select
                                                            value={localBlackLogo}
                                                            onChange={(e) => setLocalBlackLogo(e.target.value)}
                                                            style={{ ...inputStyle, flex: 1 }}
                                                        >
                                                            {availableLogos.map(logo => (
                                                                <option key={`black-${logo.file}`} value={logo.file}>{logo.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Favicon Selector */}
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
                                                        Favicon
                                                    </label>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <img 
                                                            src={`/Logos/${localFavicon}`} 
                                                            alt="Favicon actuel"
                                                            style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', background: 'rgba(0,0,0,0.3)' }}
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                        <select
                                                            value={localFavicon}
                                                            onChange={(e) => setLocalFavicon(e.target.value)}
                                                            style={{ ...inputStyle, flex: 1 }}
                                                        >
                                                            {availableLogos.map(logo => (
                                                                <option key={`fav-${logo.file}`} value={logo.file}>
                                                                    {logo.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
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
                                                    const success = await updateSettings({
                                                        siteTitle: localSiteTitle,
                                                        maintenanceMode: localMaintenanceMode,
                                                        grainEffect: localGrainEffect,
                                                        contactEmail: localContactEmail,
                                                        socials: localSocials,
                                                        navbarPadding: localNavbarPadding,
                                                        transparentLogo: localTransparentLogo,
                                                        blackLogo: localBlackLogo,
                                                        favicon: localFavicon
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

                                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
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
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Épaisseur</label>
                                                    <select
                                                        value={announcementHeight}
                                                        onChange={(e) => setAnnouncementHeight(e.target.value)}
                                                        style={inputStyle}
                                                    >
                                                        <option value="40px" style={{ background: '#1a1a1a', color: '#eee' }}>Fine (40px)</option>
                                                        <option value="48px" style={{ background: '#1a1a1a', color: '#eee' }}>Normale (48px)</option>
                                                        <option value="56px" style={{ background: '#1a1a1a', color: '#eee' }}>Standard (56px)</option>
                                                        <option value="64px" style={{ background: '#1a1a1a', color: '#eee' }}>Large (64px)</option>
                                                        <option value="72px" style={{ background: '#1a1a1a', color: '#eee' }}>Très large (72px)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Icon picker - full width */}
                                            <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.5rem' }}>Icône (à gauche)</label>
                                                    
                                                    {/* Preview selected icon */}
                                                    {announcementIcon && announcementIcon !== 'none' && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#181818', borderRadius: '8px', marginBottom: '0.5rem' }}>
                                                            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(167, 139, 250, 0.05))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {renderLucideIcon(announcementIcon, { size: 20, color: '#a78bfa' })}
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>{announcementIcon}</span>
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setAnnouncementIcon('none')}
                                                                style={{ ...btnModern, padding: '0.4rem', color: '#ff4d4d' }}
                                                                title="Supprimer"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Search input */}
                                                    <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                                                        <Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#555', zIndex: 1 }} />
                                                        <input 
                                                            type="text"
                                                            placeholder="Rechercher... (star, heart...)"
                                                            value={bannerIconSearch}
                                                            onChange={e => setBannerIconSearch(e.target.value)}
                                                            style={{ ...inputStyle, paddingLeft: '30px', fontSize: '0.8rem' }}
                                                        />
                                                    </div>
                                                    
                                                    {/* Icon grid */}
                                                    <div style={{ 
                                                        background: '#111', 
                                                        border: '1px solid #222', 
                                                        borderRadius: '6px', 
                                                        maxHeight: iconZoomLevel === 2 ? '300px' : '200px', 
                                                        overflowY: 'auto',
                                                        padding: '0.4rem'
                                                    }}>
                                                        <div style={{ padding: '0.2rem 0.4rem', marginBottom: '0.4rem', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '0.65rem', color: '#555' }}>
                                                                {filteredBannerIcons.length} icônes {bannerIconSearch ? `pour "${bannerIconSearch}"` : ''} • {allLucideIcons.length} total
                                                            </span>
                                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setIconZoomLevel(1)}
                                                                    style={{
                                                                        padding: '2px 6px',
                                                                        background: iconZoomLevel === 1 ? 'rgba(167, 139, 250, 0.2)' : 'transparent',
                                                                        border: iconZoomLevel === 1 ? '1px solid var(--color-accent)' : '1px solid #333',
                                                                        borderRadius: '4px',
                                                                        color: iconZoomLevel === 1 ? 'var(--color-accent)' : '#666',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.6rem'
                                                                    }}
                                                                    title="Vue normale"
                                                                >
                                                                    −
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setIconZoomLevel(2)}
                                                                    style={{
                                                                        padding: '2px 6px',
                                                                        background: iconZoomLevel === 2 ? 'rgba(167, 139, 250, 0.2)' : 'transparent',
                                                                        border: iconZoomLevel === 2 ? '1px solid var(--color-accent)' : '1px solid #333',
                                                                        borderRadius: '4px',
                                                                        color: iconZoomLevel === 2 ? 'var(--color-accent)' : '#666',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.6rem'
                                                                    }}
                                                                    title="Vue agrandie"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: iconZoomLevel === 2 ? 'repeat(auto-fill, minmax(90px, 1fr))' : 'repeat(auto-fill, minmax(60px, 1fr))', gap: iconZoomLevel === 2 ? '6px' : '4px' }}>
                                                            {/* None option */}
                                                            <button
                                                                type="button"
                                                                onClick={() => { setAnnouncementIcon('none'); setBannerIconSearch(''); }}
                                                                style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    gap: iconZoomLevel === 2 ? '4px' : '2px',
                                                                    padding: iconZoomLevel === 2 ? '8px 4px' : '4px 2px',
                                                                    background: announcementIcon === 'none' ? 'rgba(167, 139, 250, 0.25)' : 'rgba(255,255,255,0.02)',
                                                                    border: announcementIcon === 'none' ? '1px solid var(--color-accent)' : '1px solid transparent',
                                                                    borderRadius: '5px',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.15s'
                                                                }}
                                                                onMouseOver={e => { if (announcementIcon !== 'none') e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                                                                onMouseOut={e => { if (announcementIcon !== 'none') e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                                                            >
                                                                <Ban size={iconZoomLevel === 2 ? 22 : 14} color={announcementIcon === 'none' ? 'var(--color-accent)' : '#666'} />
                                                                <span style={{ fontSize: iconZoomLevel === 2 ? '0.65rem' : '0.5rem', color: announcementIcon === 'none' ? 'var(--color-accent)' : '#555' }}>Aucune</span>
                                                            </button>
                                                            {filteredBannerIcons.map(iconName => {
                                                                const IconComp = LucideIcons[iconName];
                                                                if (!IconComp) return null;
                                                                return (
                                                                    <button
                                                                        key={iconName}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setAnnouncementIcon(iconName);
                                                                            setBannerIconSearch('');
                                                                        }}
                                                                        style={{
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            alignItems: 'center',
                                                                            gap: iconZoomLevel === 2 ? '4px' : '2px',
                                                                            padding: iconZoomLevel === 2 ? '8px 4px' : '4px 2px',
                                                                            background: announcementIcon === iconName ? 'rgba(167, 139, 250, 0.25)' : 'rgba(255,255,255,0.02)',
                                                                            border: announcementIcon === iconName ? '1px solid var(--color-accent)' : '1px solid transparent',
                                                                            borderRadius: '5px',
                                                                            cursor: 'pointer',
                                                                            transition: 'all 0.15s'
                                                                        }}
                                                                        onMouseOver={e => { if (announcementIcon !== iconName) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                                                                        onMouseOut={e => { if (announcementIcon !== iconName) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                                                                    >
                                                                        <IconComp size={iconZoomLevel === 2 ? 22 : 14} color={announcementIcon === iconName ? 'var(--color-accent)' : '#888'} />
                                                                        <span style={{ fontSize: iconZoomLevel === 2 ? '0.6rem' : '0.45rem', color: announcementIcon === iconName ? 'var(--color-accent)' : '#555', textAlign: 'center', lineHeight: 1, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iconName}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        {filteredBannerIcons.length === 0 && (
                                                            <div style={{ padding: '0.5rem', textAlign: 'center', color: '#555', fontSize: '0.7rem' }}>
                                                                Aucune icône pour "{bannerIconSearch}"
                                                            </div>
                                                        )}
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
                                                                background: announcementTextAlign === 'left' ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255,255,255,0.02)',
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
                                                                background: announcementTextAlign === 'center' ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255,255,255,0.02)',
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
                                                    border: '1px solid rgba(167, 139, 250, 0.15)'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: announcementTextAlign === 'center' ? 'none' : 1 }}>
                                                        {announcementIcon && announcementIcon !== 'none' && (
                                                            <span style={{ color: '#a78bfa', display: 'flex' }}>{renderLucideIcon(announcementIcon, { size: 18 })}</span>
                                                        )}
                                                        <span>{announcementText || 'Texte de votre annonce...'}</span>
                                                        {announcementShowTimer && announcementTimerPosition === 'inline' && (
                                                            <span style={{ color: '#a78bfa', fontFamily: 'monospace', marginLeft: '0.5rem' }}>00h 00m 00s</span>
                                                        )}
                                                    </div>
                                                    {announcementShowTimer && announcementTimerPosition === 'right' && (
                                                        <div style={{ 
                                                            background: 'rgba(255, 255, 255, 0.05)',
                                                            padding: '0.35rem 0.75rem', 
                                                            borderRadius: '6px',
                                                            color: '#a78bfa',
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
                                            const isLucideIcon = product?.image && product.image.startsWith('lucide:');
                                            const LucideIcon = isLucideIcon ? LucideIcons[product.image.replace('lucide:', '')] : null;
                                            return (
                                                <div key={prodId} style={cardStyle}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                                                        {product?.image && (
                                                            isLucideIcon && LucideIcon ? (
                                                                <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: 'rgba(var(--color-accent-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <LucideIcon size={24} color="var(--color-accent)" />
                                                                </div>
                                                            ) : (
                                                                <img src={product.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                                                            )
                                                        )}
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
                                            <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', background: 'rgba(167, 139, 250, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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