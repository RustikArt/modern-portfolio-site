import { useData } from '../context/DataContext';
import { useState, useMemo } from 'react';
import { Grid, List, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import './Shop.css';

const Shop = () => {
    const { products } = useData();

    // State
    const [filterCategory, setFilterCategory] = useState('All');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [sortBy, setSortBy] = useState('popular'); // 'popular', 'priceAsc', 'priceDesc', 'new'
    const [priceRange, setPriceRange] = useState([0, 2000]);
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 9;

    // Derived Data - Robustness
    const safeProducts = Array.isArray(products) ? products : [];
    const categories = ['All', ...new Set(safeProducts.map(p => p.category).filter(Boolean))];
    const maxPrice = safeProducts.length > 0 ? Math.max(...safeProducts.map(p => p.price), 0) : 2000;

    // Filter & Sort Logic using useMemo for performance
    const processedProducts = useMemo(() => {
        let result = [...safeProducts];

        // 1. Filter by Category
        if (filterCategory !== 'All') {
            result = result.filter(p => p.category === filterCategory);
        }

        // 2. Filter by Price Range
        result = result.filter(p => {
            const price = p.promoPrice || p.price;
            return price >= priceRange[0] && price <= priceRange[1];
        });

        // 3. Sort
        result.sort((a, b) => {
            const priceA = a.promoPrice || a.price;
            const priceB = b.promoPrice || b.price;

            switch (sortBy) {
                case 'priceAsc': return priceA - priceB;
                case 'priceDesc': return priceB - priceA;
                case 'new': return b.id - a.id; // Assuming higher ID = newer
                default: return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0); // Popular/Featured first
            }
        });

        return result;
    }, [safeProducts, filterCategory, priceRange, sortBy]);

    // Pagination Logic
    const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
    const paginatedProducts = processedProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="page page-shop">
            <div className="container">
                <div className="shop-header">
                    <h1 className="page-title">Shop</h1>
                    <div className="shop-controls">
                        {/* Sort Dropdown */}
                        <div className="control-group">
                            <label>Trier par :</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                                <option value="popular">Populaire</option>
                                <option value="new">Nouveautés</option>
                                <option value="priceAsc">Prix croissant</option>
                                <option value="priceDesc">Prix décroissant</option>
                            </select>
                        </div>

                        {/* View Toggle */}
                        <div className="view-toggle">
                            <button
                                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                aria-label="Vue Grille"
                            >
                                <Grid size={20} />
                            </button>
                            <button
                                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                aria-label="Vue Liste"
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="shop-layout">
                    {/* SIDEBAR */}
                    <aside className="shop-sidebar">
                        <div className="sidebar-section">
                            <h3><Filter size={16} /> Catégories</h3>
                            <ul>
                                {categories.map(cat => (
                                    <li key={cat}>
                                        <button
                                            className={filterCategory === cat ? 'active' : ''}
                                            onClick={() => { setFilterCategory(cat); setCurrentPage(1); }}
                                        >
                                            {cat}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="sidebar-section">
                            <h3>Prix</h3>
                            <div className="price-slider">
                                <input
                                    type="range"
                                    min="0"
                                    max={maxPrice}
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                />
                                <div className="price-labels">
                                    <span>0€</span>
                                    <span>{priceRange[1]}€</span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* MAIN GRID */}
                    <main className="shop-main">
                        <div className={`shop-products ${viewMode}`}>
                            {paginatedProducts.length > 0 ? (
                                paginatedProducts.map(product => (
                                    <ProductCard key={product.id} product={product} viewMode={viewMode} />
                                ))
                            ) : (
                                <div className="no-results">
                                    <p>Aucun produit ne correspond à vos critères.</p>
                                    <button onClick={() => { setFilterCategory('All'); setPriceRange([0, 2000]); }} className="btn-link">
                                        Réinitialiser les filtres
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="page-btn"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <span className="page-info">Page {currentPage} sur {totalPages}</span>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="page-btn"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Shop;
