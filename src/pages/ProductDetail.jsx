import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useState, useEffect } from 'react';
import { WEBSITE_VERSION } from '../version';
import Breadcrumbs from '../components/Breadcrumbs';
import StarRating from '../components/StarRating';
import ProductReviews from '../components/ProductReviews';
import { Heart, AlertTriangle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();
    const { products, addToCart, reviews, addReview, getProductRating, currentUser, toggleWishlist, isInWishlist } = useData();
    const product = products.find(p => p.id === parseInt(id));
    const navigate = useNavigate();

    const [selectedOptions, setSelectedOptions] = useState({});
    const [currentPrice, setCurrentPrice] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const productReviews = reviews[product?.id] || [];
    const averageRating = getProductRating(product?.id);

    useEffect(() => {
        if (product) {
            // Init price from product base/promo
            setCurrentPrice(product.promoPrice || product.price);
        }
    }, [product]);

    // Update price when options change
    useEffect(() => {
        if (!product) return;
        let base = product.promoPrice || product.price;

        // Sum modifiers
        Object.values(selectedOptions).forEach(opt => {
            if (opt.priceModifier) base += parseFloat(opt.priceModifier);
        });

        setCurrentPrice(base);
    }, [selectedOptions, product]);

    // Vérifier si le produit est disponible (date de disponibilité)
    const isAvailable = !product?.availableDate || new Date(product.availableDate) <= new Date();
    
    // Vérifier si le produit est visible
    if (product && product.isVisible === false && (!currentUser || currentUser.role !== 'admin')) {
        return <div className="container" style={{ paddingTop: 'calc(140px + var(--banner-height, 0px))' }}>Produit non disponible</div>;
    }

    if (!product) return <div className="container" style={{ paddingTop: 'calc(140px + var(--banner-height, 0px))' }}>Produit introuvable</div>;

    const handleOptionChange = (optionName, optionType, value, modifier = 0) => {
        setSelectedOptions(prev => ({
            ...prev,
            [optionName]: {
                name: optionName,
                type: optionType,
                value: value,
                priceModifier: modifier
            }
        }));
    };

    const handleAddToCart = () => {
        // Vérifier le stock
        if (product.stock === 0) {
            alert('Ce produit est en rupture de stock.');
            return;
        }

        // Validation: Required options check
        if (product.options) {
            for (let opt of product.options) {
                if (opt.type === 'select' && !selectedOptions[opt.name]) {
                    alert(`Veuillez sélectionner : ${opt.name}`);
                    return;
                }
            }
        }

        // Convert map to array for cart
        const optionsArray = Object.values(selectedOptions);
        
        // Ajouter avec la quantité sélectionnée
        for (let i = 0; i < quantity; i++) {
            addToCart(product, optionsArray);
        }
        navigate('/cart');
    };

    return (
        <div className="page" style={{ paddingTop: 'calc(140px + var(--banner-height, 0px))', minHeight: '100vh', background: '#080808' }}>
            <div className="container">
                <Breadcrumbs lastItemName={product.name} />
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '4rem' }}>
                    {(() => {
                        const isLucideIcon = product.image && product.image.startsWith('lucide:');
                        const LucideIcon = isLucideIcon ? LucideIcons[product.image.replace('lucide:', '')] : null;
                        return isLucideIcon && LucideIcon ? (
                            <div style={{ width: '100%', aspectRatio: '1', background: 'linear-gradient(135deg, rgba(var(--color-accent-rgb), 0.15) 0%, rgba(18, 18, 26, 0.95) 100%)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LucideIcon size={120} color="var(--color-accent)" strokeWidth={1.5} />
                            </div>
                        ) : (
                            <img src={`${product.image}?v=${WEBSITE_VERSION}`} alt={product.name} style={{ width: '100%', height: 'auto', borderRadius: '4px' }} />
                        );
                    })()}
                    <div className="product-info-detail">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{product.category}</span>
                            <span style={{
                                background: product.stock !== 0 ? 'rgba(75, 181, 67, 0.2)' : 'rgba(255, 77, 77, 0.2)',
                                color: product.stock !== 0 ? '#4bb543' : '#ff4d4d',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>
                                {product.stock === 0 ? 'Rupture' : (product.stock < 5 ? `Dernières pièces (${product.stock})` : 'En Stock')}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h1 style={{ fontSize: '3rem', margin: '1rem 0' }}>{product.name}</h1>
                            <button
                                onClick={() => toggleWishlist(product.id)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '50%',
                                    width: '50px',
                                    height: '50px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    marginTop: '1rem'
                                }}
                            >
                                <Heart size={24} fill={isInWishlist(product.id) ? "var(--color-accent)" : "none"} color="var(--color-accent)" />
                            </button>
                        </div>
                        <div style={{ fontSize: '2rem', marginBottom: '2rem' }}>
                            {(product.promoPrice && product.promoPrice < product.price) ? (
                                <span>
                                    <s style={{ color: '#888', fontSize: '1.5rem', marginRight: '1rem' }}>{product.price.toFixed(2)}€</s>
                                    <span style={{ color: 'var(--color-accent)' }}>{currentPrice.toFixed(2)}€</span>
                                </span>
                            ) : (
                                <span>{currentPrice.toFixed(2)}€</span>
                            )}
                        </div>

                        {/* Description du produit */}
                        {product.description && (
                            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <p style={{ color: '#ccc', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{product.description}</p>
                            </div>
                        )}

                        {/* Badge produit digital */}
                        {product.isDigital && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(167, 139, 250, 0.1)', borderRadius: '20px', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-accent)' }}>
                                🖥️ Produit digital - Livraison instantanée
                            </div>
                        )}

                        {/* Précommande si date future */}
                        {!isAvailable && product.availableDate && (
                            <div style={{ padding: '1rem', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                <AlertTriangle size={18} color="#fbbf24" style={{ marginRight: '0.5rem' }} />
                                <span style={{ color: '#fbbf24' }}>Précommande - Disponible le {new Date(product.availableDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                        )}

                        {/* OPTIONS RENDERER */}
                        {product.options && product.options.map((opt, idx) => (
                            <div key={idx} style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{opt.name}</label>

                                {opt.type === 'select' ? (
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {opt.values.map((val, vIdx) => {
                                            const isSelected = selectedOptions[opt.name]?.value === val.label;
                                            return (
                                                <button
                                                    key={vIdx}
                                                    onClick={() => handleOptionChange(opt.name, 'select', val.label, val.priceModifier)}
                                                    style={{
                                                        padding: '0.8rem 1.5rem',
                                                        border: isSelected ? '1px solid var(--color-accent)' : '1px solid #333',
                                                        background: isSelected ? 'var(--color-accent)' : 'transparent',
                                                        color: isSelected ? '#000' : 'white',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {val.label} {val.priceModifier > 0 && `(+${val.priceModifier}€)`}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    // Text Input
                                    <>
                                        <textarea
                                            rows="3"
                                            placeholder="Votre réponse ici..."
                                            style={{
                                                width: '100%',
                                                padding: '0.8rem',
                                                background: '#1a1a1a',
                                                border: '1px solid #333',
                                                color: 'white',
                                                fontFamily: 'inherit'
                                            }}
                                            onChange={(e) => handleOptionChange(opt.name, 'text', e.target.value, 0)}
                                        />
                                        {opt.requiresQuote && (
                                            <p style={{ color: 'var(--color-accent)', fontSize: '0.8rem', marginTop: '0.5rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <AlertTriangle size={14} /> Cette option nécessite un devis manuel après commande.
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}

                        {product.alertMessage && (
                            <div style={{ padding: '1rem', background: 'rgba(255,204,0,0.1)', border: '1px solid rgba(255,204,0,0.3)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <AlertTriangle size={20} color="#fbbf24" />
                                <span style={{ color: '#eee', fontSize: '0.9rem' }}>{product.alertMessage}</span>
                            </div>
                        )}

                        {/* Sélecteur de quantité avec limite */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.9rem', color: '#888' }}>Quantité :</span>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #333', borderRadius: '8px' }}>
                                <button 
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}
                                >-</button>
                                <span style={{ padding: '0.5rem 1rem', minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(q => product.maxPerOrder ? Math.min(product.maxPerOrder, q + 1) : q + 1)}
                                    style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}
                                >+</button>
                            </div>
                            {product.maxPerOrder && (
                                <span style={{ fontSize: '0.75rem', color: '#666' }}>Max {product.maxPerOrder} par commande</span>
                            )}
                        </div>

                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', fontSize: '1.2rem' }} 
                            onClick={handleAddToCart}
                            disabled={product.stock === 0 || !isAvailable}
                        >
                            {product.stock === 0 
                                ? 'Rupture de stock'
                                : !isAvailable 
                                    ? 'Précommander'
                                    : Object.values(selectedOptions).some(o => product.options?.find(po => po.name === o.name)?.requiresQuote && o.value)
                                        ? 'Demander un devis'
                                        : 'Ajouter au panier'}
                        </button>

                        {product.tags && (
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {product.tags.map(tag => (
                                    <span key={tag} style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: '#222', borderRadius: '4px' }}>#{tag}</span>
                                ))}
                            </div>
                        )}

                        {/* Produits liés */}
                        {product.relatedProducts && product.relatedProducts.length > 0 && (
                            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #222' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Produits similaires</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                                    {product.relatedProducts.map(relId => {
                                        const relProd = products.find(p => p.id === relId);
                                        if (!relProd || relProd.isVisible === false) return null;
                                        const isLucide = relProd.image && relProd.image.startsWith('lucide:');
                                        const RelIcon = isLucide ? LucideIcons[relProd.image.replace('lucide:', '')] : null;
                                        return (
                                            <div 
                                                key={relId} 
                                                onClick={() => navigate(`/shop/${relId}`)}
                                                style={{ cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}
                                                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                                                onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                                            >
                                                {isLucide && RelIcon ? (
                                                    <div style={{ width: '100%', aspectRatio: '1', background: 'rgba(167,139,250,0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                                                        <RelIcon size={40} color="var(--color-accent)" />
                                                    </div>
                                                ) : (
                                                    <img src={relProd.image} alt={relProd.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }} />
                                                )}
                                                <p style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>{relProd.name}</p>
                                                <p style={{ fontSize: '0.9rem', color: 'var(--color-accent)', fontWeight: 'bold' }}>
                                                    {(relProd.promoPrice || relProd.price).toFixed(2)}€
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* REVIEWS SECTION */}
                        <ProductReviews
                            productId={product.id}
                            reviews={productReviews}
                            averageRating={averageRating}
                            onAddReview={(review) => addReview(product.id, review)}
                            currentUser={currentUser}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
