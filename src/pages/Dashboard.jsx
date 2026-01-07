import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import BlockEditor from '../components/BlockEditor';

const Dashboard = () => {
    const {
        projects, products, orders, users, promoCodes,
        addProject, deleteProject, updateProject,
        addProduct, updateProduct, deleteProduct,
        updateOrderStatus, addPromoCode, deletePromoCode
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
        options: [] // Array of { id, name, type, values } where values is [{ label, priceModifier }]
    });

    // Option Builder State
    const [optionBuilder, setOptionBuilder] = useState({ name: '', type: 'select', valuesInput: '' });

    // Promo Form
    const [promoForm, setPromoForm] = useState({ code: '', type: 'percent', value: '' });

    // Email Modal State
    const [emailModal, setEmailModal] = useState({ isOpen: false, order: null, subject: '', body: '' });

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        navigate('/login');
    };

    // --- PRODUCT ACTIONS ---
    const handleAddOption = () => {
        if (!optionBuilder.name) return;

        let parsedValues = [];
        if (optionBuilder.type === 'select') {
            // Parse "S:0, XL:5" -> [{ label: 'S', priceModifier: 0 }, { label: 'XL', priceModifier: 5 }]
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
                type: optionBuilder.type, // 'select' or 'text'
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

        // Calculate Promo Price
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

    // --- EMAIL ACTIONS ---
    const openEmailModal = (order) => {
        setEmailModal({
            isOpen: true,
            order: order,
            subject: `Votre commande #${order.id.slice(-6)} - Artisanat Digital`,
            body: `Bonjour ${order.customerName},\n\nMerci pour votre commande.\n\nCordialement,\nRustik`
        });
    };

    const handleSendEmail = () => {
        const { order, subject, body } = emailModal;
        if (!order || !order.email) {
            alert("Erreur : Pas d'email client associé à cette commande.");
            return;
        }

        // Revert to known working mailto
        const mailtoLink = `mailto:${order.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_self');
        setEmailModal({ isOpen: false, order: null, subject: '', body: '' });
    };

    const handleCopyEmail = () => {
        const { body } = emailModal;
        navigator.clipboard.writeText(body).then(() => {
            alert('Message copié dans le presse-papier !');
        });
    };

    // --- PROMO & PROJECT ---
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
            content: projectForm.content, // Legacy support
            blocks: projectForm.blocks // New blocks
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
            blocks: project.blocks || [] // Load blocks or empty
        });
        // Switch to tab if not active (though button is in tab)
        setActiveTab('projects');
        window.scrollTo(0, 0);
    };

    return (
        <div className="page" style={{ paddingTop: '100px', minHeight: '100vh', background: '#080808' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                    <h1 style={{ fontSize: '2rem' }}>Tableau de Bord</h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ color: '#888' }}>Admin</span>
                        <button onClick={handleLogout} className="btn" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Déconnexion</button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <button className={`btn ${activeTab === 'orders' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('orders')}>Commandes</button>
                    <button className={`btn ${activeTab === 'products' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('products')}>Boutique</button>
                    <button className={`btn ${activeTab === 'promos' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('promos')}>Codes Promo</button>
                    <button className={`btn ${activeTab === 'clients' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('clients')}>Clients CRM</button>
                    <button className={`btn ${activeTab === 'projects' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('projects')}>Projets</button>
                </div>

                {/* --- ORDERS TAB --- */}
                {activeTab === 'orders' && (
                    <div className="animate-in">
                        <h3>Gestion des Commandes</h3>
                        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                            {orders.map(order => (
                                <div key={order.id} style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '4px', border: '1px solid #333' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <strong>Commande #{order.id.slice(-6)}</strong>
                                        <div style={{ fontWeight: 'bold' }}>{order.total}€</div>
                                    </div>
                                    <p style={{ color: '#ccc' }}>Client: {order.customerName} ({order.email})</p>
                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            style={{ padding: '0.5rem', background: '#222', color: 'white', border: '1px solid #444' }}
                                        >
                                            <option value="En attente">En attente</option>
                                            <option value="Payé">Payé</option>
                                            <option value="Expédié">Expédié</option>
                                            <option value="Terminé">Terminé</option>
                                        </select>
                                        <button className="btn" onClick={() => openEmailModal(order)}>✉️ Contacter le client</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- PRODUCTS TAB --- */}
                {activeTab === 'products' && (
                    <div className="animate-in">
                        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '4px', marginBottom: '2rem', border: '1px solid #333' }}>
                            <h3 style={{ marginBottom: '1rem' }}>{productForm.editId ? 'Modifier le Produit' : '+ Nouveau Produit'}</h3>
                            <form onSubmit={handleProductSubmit} style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                                    <input type="text" placeholder="Nom" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} style={inputStyle} />
                                    <input type="number" placeholder="Prix (€)" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} style={inputStyle} />
                                </div>

                                {/* Discount */}
                                <div style={{ background: '#0a0a0a', padding: '1rem', border: '1px dashed #444', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span style={{ color: '#aaa' }}>Réduction :</span>
                                    <select value={productForm.discountType} onChange={e => setProductForm({ ...productForm, discountType: e.target.value })} style={inputStyle}>
                                        <option value="none">Aucune</option>
                                        <option value="percent">%</option>
                                        <option value="fixed">EUR</option>
                                    </select>
                                    {productForm.discountType !== 'none' && (
                                        <input type="number" placeholder="Value" value={productForm.discountValue} onChange={e => setProductForm({ ...productForm, discountValue: e.target.value })} style={inputStyle} />
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input type="text" placeholder="Catégorie" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} style={inputStyle} />
                                    <input type="text" placeholder="Tags" value={productForm.tags} onChange={e => setProductForm({ ...productForm, tags: e.target.value })} style={inputStyle} />
                                </div>
                                <input type="text" placeholder="URL Image" value={productForm.image} onChange={e => setProductForm({ ...productForm, image: e.target.value })} style={inputStyle} />

                                {/* Advanced Option Builder */}
                                <div style={{ background: '#0a0a0a', padding: '1rem', border: '1px dashed #444', borderRadius: '4px' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.5rem' }}>Options Avancées (Impact Prix & Champs Texte)</p>

                                    {/* List of current options */}
                                    {productForm.options.map((opt, idx) => (
                                        <div key={idx} style={{ background: '#222', padding: '0.5rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>
                                                <strong>{opt.name}</strong> ({opt.type === 'select' ? 'Choix' : 'Texte'})
                                                {opt.type === 'select' && <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: '#888' }}>
                                                    {opt.values.map(v => `${v.label}${v.priceModifier ? `(+${v.priceModifier}€)` : ''}`).join(', ')}
                                                </span>}
                                            </span>
                                            <button type="button" onClick={() => handleRemoveOption(opt.id)} style={{ color: 'red', background: 'none' }}>x</button>
                                        </div>
                                    ))}

                                    {/* Builder Inputs */}
                                    <div style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #333', paddingTop: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <input type="text" placeholder="Nom de l'option (ex: Taille)" value={optionBuilder.name} onChange={e => setOptionBuilder({ ...optionBuilder, name: e.target.value })} style={inputStyle} />
                                            <select value={optionBuilder.type} onChange={e => setOptionBuilder({ ...optionBuilder, type: e.target.value })} style={inputStyle}>
                                                <option value="select">Liste de choix (Select)</option>
                                                <option value="text">Champ Texte Libre</option>
                                            </select>
                                        </div>
                                        {optionBuilder.type === 'select' && (
                                            <input
                                                type="text"
                                                placeholder="Valeurs : Label:Prix, Label (ex: S:0, XL:5, XXL:10)"
                                                value={optionBuilder.valuesInput}
                                                onChange={e => setOptionBuilder({ ...optionBuilder, valuesInput: e.target.value })}
                                                style={inputStyle}
                                            />
                                        )}
                                        <button type="button" onClick={handleAddOption} className="btn" style={{ fontSize: '0.9rem' }}>Ajouter l'option</button>
                                    </div>
                                </div>

                                <div style={{ marginTop: '0.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'gold' }}>
                                        <input type="checkbox" checked={productForm.isFeatured} onChange={e => setProductForm({ ...productForm, isFeatured: e.target.checked })} />
                                        Mettre en avant ce produit (Featured)
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary">{productForm.editId ? 'Mettre à jour' : 'Ajouter le Produit'}</button>
                                    {productForm.editId && <button type="button" className="btn" onClick={() => setProductForm({ editId: null, name: '', price: '', discountType: 'none', discountValue: '', image: '', category: '', tags: '', isFeatured: false, options: [] })}>Annuler</button>}
                                </div>
                            </form>
                        </div>

                        {/* Product List */}
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {products.map(p => (
                                <div key={p.id} onClick={() => handleEditProduct(p)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface)', padding: '1rem', border: '1px solid #333', cursor: 'pointer', transition: '0.3s' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <img src={p.image} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                        <div>
                                            <strong>{p.name}</strong>
                                            <div style={{ fontSize: '0.9rem', color: '#888' }}>
                                                {p.promoPrice ? <span><s>{p.price}€</s> <span style={{ color: 'var(--color-accent)' }}>{p.promoPrice}€</span></span> : <span>{p.price}€</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); deleteProduct(p.id); }} style={{ color: 'red', background: 'transparent', border: '1px solid red', padding: '0.3rem', borderRadius: '4px' }}>Supprimer</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- PROMOS TAB --- */}
                {activeTab === 'promos' && (
                    <div className="animate-in">
                        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '4px', marginBottom: '2rem' }}>
                            <h3>Créer un Code Promo</h3>
                            <form onSubmit={handlePromoSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                <input type="text" placeholder="Code" value={promoForm.code} onChange={e => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })} style={inputStyle} />
                                <input type="number" placeholder="Valeur" value={promoForm.value} onChange={e => setPromoForm({ ...promoForm, value: e.target.value })} style={inputStyle} />
                                <button type="submit" className="btn btn-primary">Créer</button>
                            </form>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {promoCodes.map(code => (
                                <div key={code.id} style={{ background: 'var(--color-surface)', padding: '1rem', border: '1px dashed var(--color-accent)', textAlign: 'center' }}>
                                    <h4>{code.code}</h4>
                                    <p>-{code.value}{code.type === 'percent' ? '%' : '€'}</p>
                                    <button onClick={() => deletePromoCode(code.id)} style={{ color: 'red', background: 'none', border: 'none' }}>Supprimer</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- CLIENTS TAB --- */}
                {activeTab === 'clients' && (
                    <div className="animate-in">
                        <h3>Clients CRM</h3>
                        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #444' }}>
                                        <th style={{ padding: '1rem' }}>Nom</th>
                                        <th style={{ padding: '1rem' }}>Email</th>
                                        <th style={{ padding: '1rem' }}>Dépensé</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.filter(u => u.role === 'client').map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid #222' }}>
                                            <td style={{ padding: '1rem' }}>{u.name}</td>
                                            <td style={{ padding: '1rem' }}>{u.email}</td>
                                            <td style={{ padding: '1rem' }}>{orders.filter(o => o.userId === u.id).reduce((sum, o) => sum + o.total, 0)}€</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- PROJECTS TAB (FIXED) --- */}
                {activeTab === 'projects' && (
                    <div className="animate-in">
                        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '4px', marginBottom: '2rem', border: '1px solid #333' }}>
                            <h3 style={{ marginBottom: '1rem' }}>{projectForm.editId ? 'Modifier le Projet' : '+ Nouveau Projet'}</h3>
                            <form onSubmit={handleProjectSubmit} style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input type="text" placeholder="Titre" value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} style={inputStyle} />
                                    <input type="text" placeholder="Catégorie" value={projectForm.category} onChange={e => setProjectForm({ ...projectForm, category: e.target.value })} style={inputStyle} />
                                </div>
                                <input type="text" placeholder="URL Image" value={projectForm.image} onChange={e => setProjectForm({ ...projectForm, image: e.target.value })} style={inputStyle} />

                                {/* BLOCK EDITOR */}
                                <div style={{ border: '1px solid #333', padding: '1rem', borderRadius: '4px', background: '#0e0e0e' }}>
                                    <h4 style={{ marginBottom: '1rem', color: '#888' }}>Contenu du Projet</h4>
                                    <BlockEditor
                                        blocks={projectForm.blocks}
                                        onChange={newBlocks => setProjectForm({ ...projectForm, blocks: newBlocks })}
                                    />
                                </div>

                                {/* Legacy Content Fallback (Hidden or Optional) */}
                                {(!projectForm.blocks || projectForm.blocks.length === 0) && (
                                    <textarea rows="4" placeholder="Description HTML (Legacy)..." value={projectForm.content} onChange={e => setProjectForm({ ...projectForm, content: e.target.value })} style={{ ...inputStyle, fontFamily: 'monospace', display: 'none' }} />
                                )}

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary">{projectForm.editId ? 'Mettre à jour' : 'Publier'}</button>
                                    {projectForm.editId && <button type="button" className="btn" onClick={() => setProjectForm({ editId: null, title: '', category: '', image: '', content: '', blocks: [] })}>Annuler</button>}
                                </div>
                            </form>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                            {projects.map(p => (
                                <div key={p.id} style={{ background: 'var(--color-surface)', border: '1px solid #333', overflow: 'hidden' }}>
                                    <img src={p.image} alt={p.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                                    <div style={{ padding: '1rem' }}>
                                        <h4>{p.title}</h4>
                                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{p.category}</span>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                            <button onClick={() => handleEditProject(p)} style={{ flex: 1, padding: '0.3rem', background: '#333', color: 'white', border: 'none', cursor: 'pointer' }}>Modifier</button>
                                            <button onClick={() => deleteProject(p.id)} style={{ flex: 1, padding: '0.3rem', color: 'red', background: 'none', border: '1px solid #333', cursor: 'pointer' }}>Supprimer</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* EMAIL MODAL */}
                {emailModal.isOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ background: '#111', padding: '2rem', width: '600px', borderRadius: '8px', border: '1px solid #333' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Contacter {emailModal.order.customerName}</h3>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Sujet</label>
                                <input type="text" value={emailModal.subject} onChange={e => setEmailModal({ ...emailModal, subject: e.target.value })} style={inputStyle} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Message</label>
                                <textarea rows="8" value={emailModal.body} onChange={e => setEmailModal({ ...emailModal, body: e.target.value })} style={inputStyle} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setEmailModal({ isOpen: false, order: null, subject: '', body: '' })} className="btn">Annuler</button>
                                <button onClick={handleCopyEmail} className="btn" style={{ background: '#333' }}>📋 Copier le texte</button>
                                <button onClick={handleSendEmail} className="btn btn-primary">Ouvrir le Client Mail</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

const inputStyle = {
    padding: '0.8rem',
    background: '#1a1a1a',
    border: '1px solid #333',
    color: 'white',
    borderRadius: '4px',
    width: '100%'
};

export default Dashboard;
