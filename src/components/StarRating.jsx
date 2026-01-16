import { Star } from 'lucide-react';

const StarRating = ({ rating, max = 5, size = 16, onRatingChange, readonly = false }) => {
    return (
        <div style={{ display: 'flex', gap: '2px' }}>
            {[...Array(max)].map((_, i) => {
                const isFilled = i < Math.round(rating);
                return (
                    <Star
                        key={i}
                        size={size}
                        fill={isFilled ? "var(--color-accent)" : "none"}
                        color={isFilled ? "var(--color-accent)" : "#666"}
                        style={{ cursor: readonly ? 'default' : 'pointer' }}
                        onClick={() => !readonly && onRatingChange && onRatingChange(i + 1)}
                    />
                );
            })}
        </div>
    );
};

export default StarRating;
