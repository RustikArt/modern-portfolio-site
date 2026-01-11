import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { WEBSITE_VERSION } from '../version';
import './Shop.css';

const Shop = () => {
    const { products } = useData();
    const [filterCategory, setFilterCategory] = useState('All');

    // Extract unique categories
    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

    const filteredProducts = filterCategory === 'All'
        ? products
        : products.filter(p => p.category === filterCategory);

    return (
        <div className="page page-shop">
            <div className="container">
                <h1 className="page-title">Shop</h1>

                <div className="shop-layout" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem' }}>
                    {/* Sidebar Filter */}
                    <div className="shop-sidebar">
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Filtres</h3>
                        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                            {categories.map(cat => (
                                <li key={cat} style={{ marginBottom: '0.5rem' }}>
                                    <button
                                        onClick={() => setFilterCategory(cat)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: filterCategory === cat ? 'var(--color-accent)' : '#888',
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {cat}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Grid */}
                    <div className="shop-grid">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="product-card">
                                <Link to={`/shop/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="product-image">
                                        <img src={`${product.image}?v=${WEBSITE_VERSION}`} alt={product.name} />
                                    </div>
                                </Link>
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    {product.promoPrice && product.promoPrice < product.price ? (
                                        <div className="price">
                                            <span style={{ textDecoration: 'line-through', color: '#666', fontSize: '0.9em', marginRight: '0.5rem' }}>{product.price}€</span>
                                            <span style={{ color: 'var(--color-accent)' }}>{product.promoPrice}€</span>
                                        </div>
                                    ) : (
                                        <span className="price">{product.price}€</span>
                                    )}
                                </div>
                                {product.tags && product.tags.length > 0 && (
                                    <div style={{ padding: '0 1rem 1rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                        {product.tags.map(tag => (
                                            <span key={tag} style={{ fontSize: '0.7rem', color: '#666', background: '#111', padding: '2px 6px', borderRadius: '2px' }}>#{tag}</span>
                                        ))}
                                    </div>
                                )}
                                <Link to={`/shop/${product.id}`} className="btn-buy" style={{ display: 'block', textAlign: 'center' }}>Voir / Ajouter</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;
