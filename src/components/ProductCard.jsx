import { Link } from 'react-router-dom';
import { Heart, Monitor, Clock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useData } from '../context/DataContext';
import { WEBSITE_VERSION } from '../version';
import StarRating from './StarRating';
import LazyImage from './LazyImage';

// Helper to render Lucide icon by name
const renderLucideIcon = (iconName, props = {}) => {
    if (!iconName) return null;
    const IconComponent = LucideIcons[iconName];
    return IconComponent ? <IconComponent {...props} /> : null;
};

const ProductCard = ({ product, viewMode = 'grid' }) => {
    const { toggleWishlist, isInWishlist, getProductRating, getProductReviews } = useData();
    const isWishlisted = isInWishlist(product.id);
    const rating = getProductRating(product.id);
    const reviewCount = getProductReviews(product.id).length;

    const isGrid = viewMode === 'grid';
    
    // Check if product is digital
    const isDigital = product.isDigital === true || product.is_digital === true;
    
    // Check if product is preorder (available date in the future)
    const availableDate = product.availableDate || product.available_date;
    const isPreorder = availableDate && new Date(availableDate) > new Date();
    
    // Check if image is a Lucide icon
    const isLucideIcon = product.image && product.image.startsWith('lucide:');
    const lucideIconName = isLucideIcon ? product.image.replace('lucide:', '') : null;

    // Handle mouse move for cursor glow effect
    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    };

    return (
        <div 
            className={`product-card glass ${!isGrid ? 'list-view' : ''}`} 
            onMouseMove={handleMouseMove}
            style={{
                display: isGrid ? 'block' : 'flex',
                gap: isGrid ? '0' : '2rem',
                alignItems: 'center',
                position: 'relative' // For absolute positioning of heart
            }}
        >
            <button
                onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(product.id);
                }}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 10,
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    borderRadius: '50%',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                aria-label={isWishlisted ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"}
            >
                <Heart size={18} fill={isWishlisted ? "var(--color-accent)" : "none"} color="var(--color-accent)" />
            </button>

            {/* Badges Digital / Précommande */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {isDigital && (
                    <span style={{
                        display: 'flex', alignItems: 'center', gap: '3px',
                        background: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255,255,255,0.7)',
                        padding: '3px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '500',
                        backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <Monitor size={10} /> Digital
                    </span>
                )}
                {isPreorder && (
                    <span style={{
                        display: 'flex', alignItems: 'center', gap: '3px',
                        background: 'rgba(245, 158, 11, 0.15)', color: 'rgba(245, 158, 11, 0.9)',
                        padding: '3px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '500',
                        backdropFilter: 'blur(4px)', border: '1px solid rgba(245, 158, 11, 0.2)'
                    }}>
                        <Clock size={10} /> Précommande
                    </span>
                )}
            </div>

            <Link to={`/shop/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
                <div className="product-image" style={{
                    width: isGrid ? '100%' : '300px',
                    height: isGrid ? 'auto' : '200px',
                    aspectRatio: isGrid ? '1/1' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isLucideIcon ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(20, 20, 20, 0.95) 100%)' : undefined
                }}>
                    {isLucideIcon ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%',
                            minHeight: isGrid ? '200px' : '100%'
                        }}>
                            {renderLucideIcon(lucideIconName, { 
                                size: isGrid ? 80 : 60, 
                                color: '#a78bfa',
                                strokeWidth: 1.5
                            })}
                        </div>
                    ) : (
                        <LazyImage
                            src={`${product.image}?v=${WEBSITE_VERSION}`}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    )}
                </div>
            </Link>

            <div className="product-info" style={{ flexGrow: 1, padding: isGrid ? '1.5rem' : '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>{product.name}</h3>
                    {!isGrid && product.promoPrice && (
                        <div className="sale-badge" style={{ background: 'var(--color-accent)', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>PROMO</div>
                    )}
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                    <StarRating rating={rating} readonly showCount count={reviewCount} />
                </div>

                {product.promoPrice && product.promoPrice < product.price ? (
                    <div className="price" style={{ margin: '0.5rem 0' }}>
                        <span style={{ textDecoration: 'line-through', color: '#666', fontSize: '0.9em', marginRight: '0.5rem' }}>{product.price}€</span>
                        <span style={{ color: 'var(--color-accent)', fontSize: '1.2rem', fontWeight: 'bold' }}>{product.promoPrice}€</span>
                    </div>
                ) : (
                    <span className="price" style={{ display: 'block', margin: '0.5rem 0', fontSize: '1.2rem', fontWeight: 'bold' }}>{product.price}€</span>
                )}

                {!isGrid && (
                    <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                        {product.shortDescription || "Un produit de qualité de la collection Rustikop. Découvrez les détails complets sur la page produit."}
                    </p>
                )}

                {product.tags && product.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {product.tags.map(tag => (
                            <span key={tag} style={{ fontSize: '0.7rem', color: '#888', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>#{tag}</span>
                        ))}
                    </div>
                )}

                <Link to={`/shop/${product.id}`} className="btn-buy" style={{
                    display: isGrid ? 'block' : 'inline-block',
                    textAlign: 'center',
                    padding: '0.8rem 1.5rem',
                    background: 'var(--color-accent)',
                    color: '#000',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    width: isGrid ? '100%' : 'auto'
                }}>
                    {isGrid ? 'Voir le produit' : 'Voir les détails'}
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;
