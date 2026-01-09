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
        secureFullReset
    } = useData();

    const [activeTab, setActiveTab] = useState('orders');
    const navigate = useNavigate();

    // --- FORMS STATES ---
    const [projectForm, setProjectForm] = useState({ editId: null, title: '', category: '', image: '', content: '', blocks: [] });

    // Enhanced Product Form
    const [productForm, setProductForm] = useState({
        editId: null,
        name: '', price: '', discountType: 'none', discountValue: '',
        image: '', category: '', tags: '', isFeatured: false,
        options: []
    });

    const [optionBuilder, setOptionBuilder] = useState({ name: '', type: 'select', valuesInput: '' });
    const [promoForm, setPromoForm] = useState({ code: '', type: 'percent', value: '' });

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
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
            tags: product.tags.join(', '),
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
        background: '#1a1a1a',
        border: '1px solid #333',
        color: 'white',
        borderRadius: '4px',
        width: '100%'
    };

    return (
        <div className="page" style={{ paddingTop: '100px', minHeight: '100vh', background: '#050505' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #222', paddingBottom: '1rem' }}>
                    <h1 style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>Dashboard <span style={{ color: 'var(--color-accent)', fontSize: '0.8rem', verticalAlign: 'middle' }}>V2.0</span></h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button onClick={handleFullReset} className="btn" style={{ fontSize: '0.7rem', color: '#ff4d4d', borderColor: '#441111' }}>RÉINITIALISATION TOTALE</button>
                        <div style={{ padding: '0.5rem 1rem', background: '#111', borderRadius: '4px', border: '1px solid #333' }}>
                            <span style={{ color: '#888', marginRight: '0.5rem' }}>Session:</span><strong>Admin</strong>
                        </div>
                        <button onClick={handleLogout} className="btn" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Déconnexion</button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="glass" style={{ padding: '1rem', borderRadius: '8px' }}>
                            <p style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase' }}>Revenus</p>
                            <h3 style={{ margin: 0, color: 'var(--color-accent)' }}>{stats.totalRevenue}€</h3>
                        </div>
                        <div className="glass" style={{ padding: '1rem', borderRadius: '8px' }}>
                            <p style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase' }}>Actives</p>
                            <h3 style={{ margin: 0 }}>{stats.activeOrders}</h3>
                        </div>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                            <button className={`btn ${activeTab === 'orders' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('orders')} style={{ textAlign: 'left' }}>📦 Commandes</button>
                            <button className={`btn ${activeTab === 'products' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('products')} style={{ textAlign: 'left' }}>🛍️ Boutique</button>
                            <button className={`btn ${activeTab === 'promos' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('promos')} style={{ textAlign: 'left' }}>🎟️ Codes Promo</button>
                            <button className={`btn ${activeTab === 'clients' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('clients')} style={{ textAlign: 'left' }}>👥 Clients</button>
                            <button className={`btn ${activeTab === 'projects' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('projects')} style={{ textAlign: 'left' }}>🎨 Portfolio</button>
                        </nav>
                    </aside>

                    <main>
                        {activeTab === 'orders' && (
                            <div className="animate-in">
                                {['Réception', 'En cours', 'Terminé'].map(cat => (
                                    <div key={cat} style={{ marginBottom: '2rem' }}>
                                        <h4 style={{ color: 'var(--color-accent)', marginBottom: '1rem', textTransform: 'uppercase' }}>{cat === 'Terminé' ? 'Archives' : cat}</h4>
                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                            {orders.filter(o => (cat === 'Réception' ? o.status === 'Réception' || o.status === 'En attente' : o.status === cat)).map(order => (
                                                <div key={order.id} style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                        <div>
                                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{order.customerName}</div>
                                                            <span style={{ color: '#666', fontSize: '0.8rem' }}>#{order.id.slice(-6)}</span>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ color: 'var(--color-accent)' }}>{order.total}€</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#444' }}>{new Date(order.date).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>

                                                    {order.checklist && (
                                                        <div style={{ marginBottom: '1rem' }}>
                                                            {order.checklist.map(item => (
                                                                <div key={item.id} onClick={() => toggleChecklistItem(order.id, item.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.3rem 0' }}>
                                                                    <div style={{ width: '14px', height: '14px', border: '1px solid #555', background: item.completed ? '#4caf50' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>{item.completed && '✓'}</div>
                                                                    <span style={{ fontSize: '0.85rem', color: item.completed ? '#555' : '#ccc' }}>{item.label}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <textarea
                                                        value={order.notes || ''}
                                                        onChange={(e) => updateOrderNotes(order.id, e.target.value)}
                                                        placeholder="Notes..."
                                                        style={{ width: '100%', background: '#0a0a0a', border: '1px solid #222', color: '#888', padding: '0.5rem', fontSize: '0.8rem', borderRadius: '4px' }}
                                                    />

                                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                                        <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} style={{ background: '#222', color: 'white', border: '1px solid #444', padding: '0.3rem', flex: 1 }}>
                                                            <option value="Réception">Réception</option>
                                                            <option value="En cours">En cours</option>
                                                            <option value="Terminé">Terminé</option>
                                                        </select>
                                                        <button onClick={() => updateOrderStatus(order.id, order.status === 'Réception' ? 'En cours' : 'Terminé')} className="btn btn-primary" style={{ padding: '0.3rem 1rem', fontSize: '0.8rem' }}>OK</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'products' && (
                            <div className="animate-in">
                                <form onSubmit={handleProductSubmit} style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', marginBottom: '2rem' }}>
                                    <input type="text" placeholder="Nom" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} style={{ ...inputStyle, marginBottom: '1rem' }} />
                                    <input type="number" placeholder="Prix" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} style={{ ...inputStyle, marginBottom: '1rem' }} />
                                    <button type="submit" className="btn btn-primary">{productForm.editId ? 'Mettre à jour' : 'Ajouter'}</button>
                                </form>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {products.map(p => (
                                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#111', padding: '1rem', border: '1px solid #333' }}>
                                            <span>{p.name} - {p.price}€</span>
                                            <button onClick={() => handleEditProduct(p)} style={{ background: 'none', color: 'var(--color-accent)' }}>Edit</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'promos' && (
                            <div className="animate-in">
                                <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', marginBottom: '2rem' }}>
                                    <h4 style={{ marginBottom: '1rem' }}>Créer un coupon</h4>
                                    <form onSubmit={handlePromoSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <input type="text" placeholder="CODE" value={promoForm.code} onChange={e => setPromoForm({ ...promoForm, code: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                                        <select value={promoForm.type} onChange={e => setPromoForm({ ...promoForm, type: e.target.value })} style={{ ...inputStyle, width: '100px' }}>
                                            <option value="percent">%</option>
                                            <option value="fixed">€</option>
                                        </select>
                                        <input type="number" placeholder="Val" value={promoForm.value} onChange={e => setPromoForm({ ...promoForm, value: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                                        <button type="submit" className="btn btn-primary">Créer</button>
                                    </form>
                                </div>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {promoCodes.map(c => (
                                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#111', padding: '1rem', border: '1px dashed var(--color-accent)' }}>
                                            <span>{c.code} (-{c.value}{c.type === 'percent' ? '%' : '€'})</span>
                                            <button onClick={() => deletePromoCode(c.id)} style={{ color: 'red' }}>Supprimer</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'clients' && (
                            <div className="animate-in">
                                <table style={{ width: '100%', color: '#ccc' }}>
                                    <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}><th>Nom</th><th>Email</th></tr></thead>
                                    <tbody>
                                        {users.filter(u => u.role === 'client').map(u => (
                                            <tr key={u.id} style={{ borderBottom: '1px solid #111' }}><td style={{ padding: '0.8rem 0' }}>{u.name}</td><td>{u.email}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'projects' && (
                            <div className="animate-in">
                                <form onSubmit={handleProjectSubmit} style={{ background: '#111', padding: '1.5rem', border: '1px solid #333', marginBottom: '2rem' }}>
                                    <input type="text" placeholder="Titre" value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} style={inputStyle} />
                                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Publier</button>
                                </form>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {projects.map(p => (
                                        <div key={p.id} style={{ background: '#111', border: '1px solid #333' }}>
                                            <img src={p.image} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                                            <div style={{ padding: '0.5rem' }}>
                                                <strong>{p.title}</strong>
                                                <button onClick={() => handleEditProject(p)} style={{ width: '100%', background: '#222', color: 'white', marginTop: '0.5rem' }}>Edit</button>
                                            </div>
                                        </div>
                                    ))}
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