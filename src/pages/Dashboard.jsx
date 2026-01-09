import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import BlockEditor from '../components/BlockEditor';

const Dashboard = () => {
    const {
        projects, products, orders, users, promoCodes,
        addProject, deleteProject, updateProject,
        addProduct, updateProduct, deleteProduct,
        updateOrderStatus, toggleChecklistItem, updateOrderNotes, addPromoCode, deletePromoCode,
        secureFullReset, logout
    } = useData();

    const [activeTab, setActiveTab] = useState('orders');
    const navigate = useNavigate();

    // --- FORMS STATES ---
    const [projectForm, setProjectForm] = useState({ editId: null, title: '', category: '', image: '', content: '', blocks: [] });

    const [productForm, setProductForm] = useState({
        editId: null,
        name: '', price: '', discountType: 'none', discountValue: '',
        image: '', category: '', tags: '', isFeatured: false,
        options: []
    });

    const [optionBuilder, setOptionBuilder] = useState({ name: '', type: 'select', valuesInput: '' });
    const [promoForm, setPromoForm] = useState({ code: '', type: 'percent', value: '' });

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
            isFeatured: product.isFeatured || false,
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
            isFeatured: productForm.isFeatured,
            options: productForm.options
        };
        if (productForm.editId) {
            updateProduct(productForm.editId, productData);
        } else {
            addProduct(productData);
        }
        setProductForm({
            editId: null, name: '', price: '', discountType: 'none', discountValue: '',
            image: '', category: '', tags: '', isFeatured: false, options: []
        });
    };

    const handlePromoSubmit = (e) => {
        e.preventDefault();
        if (!promoForm.code) return;
        addPromoCode({ ...promoForm, code: promoForm.code.toUpperCase(), value: parseFloat(promoForm.value) });
        setPromoForm({ code: '', type: 'percent', value: '' });
    };

    const handleProjectSubmit = (e) => {
        e.preventDefault();
        if (!projectForm.title) return;
        const projectData = {
            title: projectForm.title,
            category: projectForm.category,
            image: projectForm.image || 'https://placehold.co/600x400/333?text=Project',
            content: projectForm.content,
            blocks: projectForm.blocks
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

    const handleFullReset = () => {
        const pass = prompt("ENTREZ LE MOT DE PASSE ADMIN POUR RÉINITIALISER TOUTE LA PLATEFORME :");
        if (pass) {
            if (secureFullReset(pass)) {
                alert("Réinitialisation réussie. Redirection...");
            } else {
                alert("Mot de passe incorrect.");
            }
        }
    };

    const stats = {
        totalRevenue: orders.reduce((acc, o) => acc + parseFloat(o.total || 0), 0).toFixed(2),
        totalOrders: orders.length,
        activeOrders: orders.filter(o => o.status !== 'Terminé').length,
        totalUsers: users.length
    };

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
                        <p style={{ color: '#444', margin: '5px 0 0', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.7rem' }}>Version 2.3 Premium Glass</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button onClick={handleFullReset} style={{ background: 'transparent', border: '1px solid #441111', color: '#ff4d4d', borderRadius: '4px', padding: '0.4rem 0.8rem', fontSize: '0.7rem', cursor: 'pointer' }}>
                            WIPE DATA
                        </button>
                        <div style={{ padding: '0.5rem 1rem', background: '#111', borderRadius: '30px', border: '1px solid #333', fontSize: '0.85rem' }}>
                            <span style={{ color: '#666' }}>root@</span><strong>rustikop</strong>
                        </div>
                        <button onClick={handleLogout} className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', borderRadius: '30px' }}>Logout</button>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3rem' }}>
                    {/* SIDE PANEL */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                            <div style={{ ...cardStyle, padding: '1rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', color: '#666', textTransform: 'uppercase' }}>Revenue</div>
                                <div style={{ fontSize: '1.2rem', color: 'var(--color-accent)', fontWeight: 'bold' }}>{stats.totalRevenue}€</div>
                            </div>
                            <div style={{ ...cardStyle, padding: '1rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', color: '#666', textTransform: 'uppercase' }}>Orders</div>
                                <div style={{ fontSize: '1.2rem', color: 'white', fontWeight: 'bold' }}>{stats.activeOrders}</div>
                            </div>
                        </div>

                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <button
                                onClick={() => setActiveTab('orders')}
                                style={activeTab === 'orders' ? btnPrimaryModern : btnModern}
                            >
                                <span style={{ fontSize: '1.2rem' }}>📦</span> Commandes
                            </button>
                            <button
                                onClick={() => setActiveTab('products')}
                                style={activeTab === 'products' ? btnPrimaryModern : btnModern}
                            >
                                <span style={{ fontSize: '1.2rem' }}>🛍️</span> Boutique
                            </button>
                            <button
                                onClick={() => setActiveTab('promos')}
                                style={activeTab === 'promos' ? btnPrimaryModern : btnModern}
                            >
                                <span style={{ fontSize: '1.2rem' }}>🎟️</span> Coupons
                            </button>
                            <button
                                onClick={() => setActiveTab('clients')}
                                style={activeTab === 'clients' ? btnPrimaryModern : btnModern}
                            >
                                <span style={{ fontSize: '1.2rem' }}>👥</span> CRM Clients
                            </button>
                            <button
                                onClick={() => setActiveTab('projects')}
                                style={activeTab === 'projects' ? btnPrimaryModern : btnModern}
                            >
                                <span style={{ fontSize: '1.2rem' }}>🎨</span> Portfolio
                            </button>
                        </nav>

                        <div style={{ marginTop: 'auto', padding: '1.5rem', background: '#0a0a0a', borderRadius: '12px', border: '1px solid #111', fontSize: '0.8rem', color: '#444' }}>
                            <strong>Système Artisan</strong><br />
                            Status: <span style={{ color: '#4caf50' }}>En ligne</span><br />
                            Bridge: <span style={{ color: '#4caf50' }}>Actif</span>
                        </div>
                    </aside>

                    {/* MAIN CONTENT */}
                    <main>
                        {/* --- ORDERS TAB --- */}
                        {activeTab === 'orders' && (
                            <div className="animate-in">
                                {['Réception', 'En cours', 'Terminé', 'En attente'].map(cat => (
                                    <div key={cat} style={{ marginBottom: '3rem' }}>
                                        <h3 style={{
                                            marginBottom: '1.5rem',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '2px',
                                            color: cat === 'Terminé' ? '#444' : cat === 'En attente' ? '#ff8c00' : 'var(--color-accent)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.8rem'
                                        }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat === 'Réception' ? '#ff4d4d' : cat === 'En cours' ? '#ffd700' : cat === 'Terminé' ? '#4caf50' : '#ff8c00' }}></span>
                                            {cat === 'Terminé' ? 'Completed Tasks' : cat === 'En attente' ? 'Problèmes / En attente' : cat}
                                        </h3>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                                            {orders.filter(o => {
                                                if (cat === 'Réception') return o.status === 'Réception' || o.status === 'Payé';
                                                return o.status === cat;
                                            }).map(order => (
                                                <div key={order.id} style={cardStyle}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                                        <div>
                                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>{order.customerName}</div>
                                                            <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.2rem' }}>{order.email}</div>
                                                            <div style={{ color: '#555', fontSize: '0.75rem', marginTop: '0.5rem' }}>ID {order.id.slice(-8).toUpperCase()}</div>
                                                            {order.shipping && (
                                                                <div style={{ color: '#444', fontSize: '0.7rem', marginTop: '0.5rem', background: 'rgba(255,100,100,0.05)', padding: '0.4rem', borderRadius: '4px' }}>
                                                                    📍 {order.shipping.address}, {order.shipping.city} ({order.shipping.zip})
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ color: 'var(--color-accent)', fontSize: '1.2rem', fontWeight: 'bold' }}>{order.total}€</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#444' }}>{new Date(order.date).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>

                                                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                                        {order.items.map((it, idx) => (
                                                            <div key={idx} style={{ marginBottom: '1rem', borderBottom: idx === order.items.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
                                                                <div style={{ fontSize: '0.9rem', color: 'white', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                                                    <span>{it.name} x{it.quantity}</span>
                                                                    <span>{it.price}€</span>
                                                                </div>
                                                                {it.selectedOptions && it.selectedOptions.length > 0 && (
                                                                    <div style={{ marginTop: '0.5rem', paddingLeft: '0.5rem', borderLeft: '2px solid var(--color-accent)' }}>
                                                                        {it.selectedOptions.map((opt, oIdx) => (
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
                                                        <div style={{ marginBottom: '1.5rem' }}>
                                                            {order.checklist.map(item => (
                                                                <div
                                                                    key={item.id}
                                                                    onClick={() => toggleChecklistItem(order.id, item.id)}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '0.8rem',
                                                                        cursor: 'pointer',
                                                                        padding: '0.5rem',
                                                                        borderRadius: '6px',
                                                                        background: item.completed ? 'rgba(76,175,80,0.05)' : 'transparent',
                                                                        transition: 'all 0.2s'
                                                                    }}>
                                                                    <div style={{
                                                                        width: '18px',
                                                                        height: '18px',
                                                                        border: '2px solid #333',
                                                                        borderRadius: '4px',
                                                                        background: item.completed ? '#4caf50' : 'transparent',
                                                                        borderColor: item.completed ? '#4caf50' : '#333',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        color: 'white',
                                                                        fontSize: '10px'
                                                                    }}>{item.completed && '✓'}</div>
                                                                    <span style={{ fontSize: '0.85rem', color: item.completed ? '#555' : '#ccc', textDecoration: item.completed ? 'line-through' : 'none' }}>{item.label}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                            style={{ ...inputStyle, padding: '0.5rem', fontSize: '0.8rem', flex: 1 }}
                                                        >
                                                            <option value="Réception">Réception</option>
                                                            <option value="En cours">En cours</option>
                                                            <option value="Terminé">Terminé / Livré</option>
                                                            <option value="En attente">En attente (Problème)</option>
                                                        </select>
                                                        <button
                                                            onClick={() => updateOrderStatus(order.id, order.status === 'Réception' ? 'En cours' : 'Terminé')}
                                                            style={{ ...btnPrimaryModern, padding: '0.5rem 1rem' }}
                                                        >
                                                            Update
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
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
                                                        <option value="text">Text Input</option>
                                                    </select>
                                                </div>
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
                                        <input type="text" placeholder="Image URL" value={productForm.image} onChange={e => setProductForm({ ...productForm, image: e.target.value })} style={inputStyle} />

                                        <button type="submit" style={btnPrimaryModern}>
                                            {productForm.editId ? 'Save Changes' : 'Publish Product'}
                                        </button>
                                    </form>
                                </section>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                    {products.map(p => (
                                        <div key={p.id} style={cardStyle}>
                                            <img src={p.image} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} alt="" />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <h4 style={{ margin: 0 }}>{p.name}</h4>
                                                    <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{p.price}€</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => handleEditProduct(p)} style={{ ...btnModern, padding: '0.5rem' }}>Edit</button>
                                                    <button onClick={() => deleteProduct(p.id)} style={{ ...btnModern, padding: '0.5rem', color: '#ff4d4d' }}>Delete</button>
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
                                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>{projectForm.editId ? 'Update Case Study' : 'New Project'}</h2>
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

                                        <button type="submit" style={btnPrimaryModern}>
                                            {projectForm.editId ? 'Update Project' : 'Publish Project'}
                                        </button>
                                    </form>
                                </section>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                    {projects.map(p => (
                                        <div key={p.id} style={cardStyle}>
                                            <img src={p.image} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} alt="" />
                                            <h4 style={{ margin: '0 0 0.5rem' }}>{p.title}</h4>
                                            <p style={{ fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', marginBottom: '1.5rem' }}>{p.category}</p>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button onClick={() => handleEditProject(p)} style={{ ...btnModern, flex: 1, textAlign: 'center', justifyContent: 'center' }}>Edit Content</button>
                                                <button onClick={() => deleteProject(p.id)} style={{ ...btnModern, color: '#ff4d4d' }}>✕</button>
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
                                        <input type="text" placeholder="CODE (ex: RUSTIK20)" value={promoForm.code} onChange={e => setPromoForm({ ...promoForm, code: e.target.value })} style={inputStyle} required />
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <select value={promoForm.type} onChange={e => setPromoForm({ ...promoForm, type: e.target.value })} style={inputStyle}>
                                                <option value="percent">Percentage (%)</option>
                                                <option value="fixed">Fixed (€)</option>
                                            </select>
                                            <input type="number" placeholder="Value" value={promoForm.value} onChange={e => setPromoForm({ ...promoForm, value: e.target.value })} style={inputStyle} required />
                                        </div>
                                        <button type="submit" style={btnPrimaryModern}>Generate Coupon</button>
                                    </form>
                                </section>

                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {promoCodes.map(c => (
                                        <div key={c.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderStyle: 'dashed' }}>
                                            <div>
                                                <strong style={{ fontSize: '1.2rem', color: 'var(--color-accent)' }}>{c.code}</strong>
                                                <span style={{ marginLeft: '1rem', color: '#555' }}>-{c.value}{c.type === 'percent' ? '%' : '€'}</span>
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
                                <div style={cardStyle}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #222' }}>
                                                <th style={{ padding: '1rem', color: '#666', fontSize: '0.7rem', textTransform: 'uppercase' }}>User Name</th>
                                                <th style={{ padding: '1rem', color: '#666', fontSize: '0.7rem', textTransform: 'uppercase' }}>Email Address</th>
                                                <th style={{ padding: '1rem', color: '#666', fontSize: '0.7rem', textTransform: 'uppercase' }}>Role</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.id} style={{ borderBottom: '1px solid #111' }}>
                                                    <td style={{ padding: '1rem' }}>{u.name}</td>
                                                    <td style={{ padding: '1rem', color: '#999' }}>{u.email}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{ background: u.role === 'admin' ? 'var(--color-accent)' : '#222', color: u.role === 'admin' ? 'black' : '#666', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>{u.role}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;