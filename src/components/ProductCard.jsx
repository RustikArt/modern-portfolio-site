import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
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
    
    // Check if image is a Lucide icon
    const isLucideIcon = product.image && product.image.startsWith('lucide:');
    const lucideIconName = isLucideIcon ? product.image.replace('lucide:', '') : null;

    return (
        <div className={`product-card glass ${!isGrid ? 'list-view' : ''}`} style={{
            display: isGrid ? 'block' : 'flex',
            gap: isGrid ? '0' : '2rem',
            alignItems: 'center',
            position: 'relative' // For absolute positioning of heart
        }}>
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

            <Link to={`/shop/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
                <div className="product-image" style={{
                    width: isGrid ? '100%' : '300px',
                    height: isGrid ? 'auto' : '200px',
                    aspectRatio: isGrid ? '1/1' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isLucideIcon ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(20, 20, 20, 0.95) 100%)' : undefined
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
                                color: '#d4af37',
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

                <div style={{ marginBottom: '0.5rem' }}>
                    <StarRating rating={rating} readonly />
                    <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem' }}>({reviewCount})</span>
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
