import { useState } from 'react';
import StarRating from './StarRating';
import { useData } from '../context/DataContext';

const ProductReviews = ({ reviews = [], averageRating = 0, onAddReview, currentUser, productId }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const { hasPurchasedProduct } = useData();

    const handleSubmit = () => {
        if (!comment.trim()) return;

        onAddReview({
            user: currentUser ? currentUser.email : 'Anonyme',
            rating,
            comment,
            date: new Date().toLocaleDateString()
        });

        setComment("");
        setRating(5);
    };

    return (
        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #333' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-accent)' }}>Avis Clients ({reviews.length})</h3>

            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{averageRating > 0 ? averageRating.toFixed(1) : '-'}</span>
                <div>
                    <StarRating rating={averageRating} readonly size={24} />
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>Moyenne des notes</span>
                </div>
            </div>

            {/* Add Review Form */}
            {currentUser ? (
                hasPurchasedProduct(productId) ? (
                    <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                        <h4 style={{ marginBottom: '1rem' }}>Laisser un avis</h4>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Votre note</label>
                            <StarRating rating={rating} onRatingChange={setRating} size={24} />
                        </div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Partagez votre expérience..."
                            rows="3"
                            style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #333', color: 'white', marginBottom: '1rem', borderRadius: '4px' }}
                        />
                        <button
                            onClick={handleSubmit}
                            className="btn btn-primary"
                            style={{ fontSize: '0.9rem', padding: '0.5rem 1.5rem' }}
                        >
                            Publier l'avis
                        </button>
                    </div>
                ) : (
                    <div style={{ background: 'rgba(212, 175, 55, 0.05)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(212, 175, 55, 0.1)', textAlign: 'center' }}>
                        <p style={{ margin: 0, color: 'var(--color-accent)', fontSize: '0.9rem' }}>
                            Vous devez avoir acheté ce produit pour laisser un avis.
                        </p>
                    </div>
                )
            ) : (
                <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                        Veuillez vous <a href="/login" style={{ color: 'var(--color-accent)' }}>connecter</a> pour laisser un avis.
                    </p>
                </div>
            )}

            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reviews.length > 0 ? reviews.map((review, idx) => (
                    <div key={idx} style={{ borderBottom: '1px solid #222', paddingBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 'bold' }}>{review.user}</span>
                            <span style={{ color: '#666', fontSize: '0.8rem' }}>{review.date}</span>
                        </div>
                        <StarRating rating={review.rating} readonly size={14} />
                        <p style={{ marginTop: '0.5rem', color: '#ccc', lineHeight: '1.4' }}>{review.comment}</p>
                    </div>
                )) : (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>Aucun avis pour le moment.</p>
                )}
            </div>
        </div>
    );
};

export default ProductReviews;
