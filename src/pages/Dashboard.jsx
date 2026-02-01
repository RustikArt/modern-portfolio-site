import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { 
    LayoutDashboard, ShoppingBag, Users, FileCode, Settings, LogOut, 
    Plus, Search, Bell, Menu, X, CheckCircle, TrendingUp, DollarSign
} from 'lucide-react';

const Dashboard = () => {
    const { 
        currentUser, logout, checkPermission,
        orders, products, projects, users,
        deleteProduct, deleteProject
    } = useData();
    
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Initial permission check to set default tab could go here
    // For now defaulting to overview

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const sidebarItems = [
        { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard, permission: 'tab_overview' },
        { id: 'orders', label: 'Commandes', icon: ShoppingBag, permission: 'tab_orders' },
        { id: 'products', label: 'Produits', icon: ShoppingBag, permission: 'tab_products' },
        { id: 'projects', label: 'Projets', icon: FileCode, permission: 'tab_projects' },
        { id: 'clients', label: 'Clients', icon: Users, permission: 'tab_clients' },
        { id: 'settings', label: 'Paramètres', icon: Settings, permission: 'tab_settings' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <Overview stats={stats} />;
            case 'orders': return <OrdersView orders={orders} />;
            case 'products': return <ProductsView products={products} onDelete={deleteProduct} />;
            case 'projects': return <ProjectsView projects={projects} onDelete={deleteProject} />;
            default: return <Overview stats={stats} />;
        }
    };

    // Calculate Stats
    const stats = {
        totalRevenue: orders.reduce((acc, o) => acc + parseFloat(o.total || 0), 0).toFixed(2),
        totalOrders: orders.length,
        activeOrders: orders.filter(o => o.status !== 'Terminé').length,
        totalUsers: users.length
    };

    return (
        <div className="dashboard-container">
            {/* MOBILE TOGGLE */}
            <button 
                className="mobile-toggle" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{ position: 'fixed', top: '90px', left: '20px', zIndex: 100, display: window.innerWidth > 1024 ? 'none' : 'block' }}
            >
                <Menu />
            </button>

            {/* SIDEBAR */}
            <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-section">
                    <span className="sidebar-label">Menu Principal</span>
                    {sidebarItems.map(item => (
                        <div 
                            key={item.id}
                            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>

                <div className="sidebar-section mt-auto">
                    <div className="sidebar-item" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Déconnexion</span>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="dashboard-main">
                <header className="dashboard-header animate-on-scroll fade-up">
                    <div>
                        <h1 className="dashboard-title">
                            {sidebarItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
                        </h1>
                        <p className="dashboard-subtitle">Bienvenue, {currentUser?.name || 'Admin'}</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-icon"><Bell size={20} /></button>
                    </div>
                </header>

                <div className="dashboard-content animate-on-scroll fade-up delay-1">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

/* --- SUB-COMPONENTS --- */

const Overview = ({ stats }) => (
    <div className="overview-grid">
        <div className="grid-4 mb-8">
            <div className="dash-card stat-card">
                <div className="flex justify-between items-start">
                    <div className="stat-value">{stats.totalRevenue}€</div>
                    <DollarSign className="text-accent" />
                </div>
                <span className="stat-label">Chiffre d'affaires</span>
            </div>
            <div className="dash-card stat-card">
                <div className="stat-value">{stats.totalOrders}</div>
                <span className="stat-label">Commandes Totales</span>
            </div>
            <div className="dash-card stat-card">
                <div className="stat-value">{stats.activeOrders}</div>
                <span className="stat-label">Commandes en cours</span>
            </div>
            <div className="dash-card stat-card">
                <div className="stat-value">{stats.totalUsers}</div>
                <span className="stat-label">Clients Inscrits</span>
            </div>
        </div>
        
        {/* Placeholder for Chart */}
        <div className="dash-card mb-8">
            <h3>Activité Récente</h3>
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                Graphique d'activité
            </div>
        </div>
    </div>
);

const OrdersView = ({ orders }) => (
    <div className="dash-card">
        <div className="dash-table-wrapper">
            <table className="dash-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>Date</th>
                        <th>Montant</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td>#{order.id.slice(0, 8)}</td>
                            <td>{order.customerName}</td>
                            <td>{new Date(order.date).toLocaleDateString()}</td>
                            <td>{order.total}€</td>
                            <td>
                                <span className={`status-badge status-${order.status === 'Terminé' ? 'success' : 'pending'}`}>
                                    {order.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {orders.length === 0 && (
                        <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>Aucune commande</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

const ProductsView = ({ products, onDelete }) => (
    <div>
        <div className="flex justify-between items-center mb-6">
            <div className="search-bar" style={{ maxWidth: '300px' }}>
                <input type="text" placeholder="Rechercher..." className="form-input" />
            </div>
            <button className="btn btn-primary flex items-center gap-2">
                <Plus size={18} /> Ajouter Produit
            </button>
        </div>

        <div className="grid-3">
            {products.map(product => (
                <div key={product.id} className="dash-card flex flex-col">
                    <div style={{ height: '200px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
                        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', flex: 1 }}>{product.category}</p>
                    <div className="flex justify-between items-center mt-auto">
                        <span style={{ fontWeight: 'bold' }}>{product.price}€</span>
                        <div className="flex gap-2">
                            <button className="btn-icon text-danger" onClick={() => onDelete(product.id)}><X size={18} /></button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ProjectsView = ({ projects, onDelete }) => (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h3>Mes Projets</h3>
            <button className="btn btn-primary flex items-center gap-2">
                <Plus size={18} /> Nouveau Projet
            </button>
        </div>

        <div className="grid-2">
            {projects.map(p => (
                <div key={p.id} className="dash-card flex gap-4">
                     <div style={{ width: '120px', height: '100px', background: '#f0f0f0', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <h4>{p.title}</h4>
                        <span className="text-sm text-muted">{p.category}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default Dashboard;
