import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useState, useEffect } from 'react';
import { WEBSITE_VERSION } from '../version';

const ProductDetail = () => {
    const { id } = useParams();
    const { products, addToCart } = useData();
    const product = products.find(p => p.id === parseInt(id));
    const navigate = useNavigate();

    const [selectedOptions, setSelectedOptions] = useState({});
    const [currentPrice, setCurrentPrice] = useState(0);

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


    if (!product) return <div className="container" style={{ paddingTop: '100px' }}>Produit introuvable</div>;

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
        // Validation: Required options check? (Assumed all required for now, or just loose)
        // For 'select' types, check if selected.
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
        addToCart(product, optionsArray);
        navigate('/cart');
    };

    return (
        <div className="page" style={{ paddingTop: '100px', minHeight: '100vh', background: '#080808' }}>
            <div className="container">
                <button onClick={() => navigate('/shop')} className="btn" style={{ marginBottom: '2rem' }}>← Retour</button>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '4rem' }}>
                    <img src={`${product.image}?v=${WEBSITE_VERSION}`} alt={product.name} style={{ width: '100%', height: 'auto', borderRadius: '4px' }} />
                    <div className="product-info-detail">
                        <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{product.category}</span>
                        <h1 style={{ fontSize: '3rem', margin: '1rem 0' }}>{product.name}</h1>
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
                                )}
                            </div>
                        ))}

                        <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.2rem' }} onClick={handleAddToCart}>
                            Ajouter au panier
                        </button>

                        {product.tags && (
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem' }}>
                                {product.tags.map(tag => (
                                    <span key={tag} style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: '#222', borderRadius: '4px' }}>#{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
