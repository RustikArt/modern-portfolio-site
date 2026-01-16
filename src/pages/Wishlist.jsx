import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
    const { wishlist, products, addToCart, toggleWishlist } = useData();

    // Filter products that are in the wishlist
    const wishlistProducts = products.filter(p => wishlist.includes(p.id));

    return (
        <div className="page" style={{ paddingTop: '120px', minHeight: '100vh', background: '#050505', color: '#eee' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '-1px' }}>
                    Votre <span style={{ color: 'var(--color-accent)' }}>Wishlist</span>
                </h1>

                {wishlistProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                        <p style={{ fontSize: '1.2rem', color: '#888', marginBottom: '2rem' }}>Votre liste de souhaits est vide.</p>
                        <Link to="/shop" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 2rem' }}>
                            Découvrir la boutique <ArrowRight size={20} />
                        </Link>
                    </div>
                ) : (
                    <div className="shop-products grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {wishlistProducts.map(product => (
                            <ProductCard key={product.id} product={product} viewMode="grid" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
