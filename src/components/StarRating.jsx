import { Star } from 'lucide-react';

const StarRating = ({ rating, max = 5, size = 16, onRatingChange, readonly = false, showCount = false, count = 0 }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(max)].map((_, i) => {
                    const isFilled = i < Math.round(rating);
                    return (
                        <Star
                            key={i}
                            size={size}
                            fill={isFilled ? "#a78bfa" : "none"}
                            color={isFilled ? "#a78bfa" : "#4b5563"}
                            style={{ cursor: readonly ? 'default' : 'pointer' }}
                            onClick={() => !readonly && onRatingChange && onRatingChange(i + 1)}
                        />
                    );
                })}
            </div>
            {showCount && (
                <span style={{ 
                    fontSize: '0.8rem', 
                    color: '#64748b',
                    fontWeight: '500'
                }}>
                    ({count})
                </span>
            )}
        </div>
    );
};

export default StarRating;
