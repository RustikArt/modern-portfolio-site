import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import './Wishlist.css';

const Wishlist = () => {
    const { wishlist, products, addToCart, toggleWishlist } = useData();

    // Filter products that are in the wishlist
    const wishlistProducts = products.filter(p => wishlist.includes(p.id));

    return (
        <div className="page-wishlist">
            <div className="container">
                {/* Header */}
                <div className="wishlist-header">
                    <div className="wishlist-title-group">
                        <div className="wishlist-icon">
                            <Heart size={28} />
                        </div>
                        <div>
                            <h1>Ma <span>Wishlist</span></h1>
                            <p>{wishlistProducts.length} article{wishlistProducts.length !== 1 ? 's' : ''} sauvegardé{wishlistProducts.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>

                {wishlistProducts.length === 0 ? (
                    <div className="wishlist-empty">
                        <div className="empty-icon">
                            <Sparkles size={48} />
                        </div>
                        <h3>Votre wishlist est vide</h3>
                        <p>Explorez notre boutique et ajoutez vos coups de cœur</p>
                        <Link to="/shop" className="btn btn-primary">
                            Découvrir la boutique <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="wishlist-grid">
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
