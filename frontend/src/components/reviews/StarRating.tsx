import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    value: number; // 0 to 5
    onChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    showLabel?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
    value,
    onChange,
    readonly = false,
    size = 'md',
    className = '',
    showLabel = false,
}) => {
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8',
    };

    const activeRating = hoverValue !== null ? hoverValue : value;

    return (
        <div className={`inline-flex items-center gap-1 ${className}`}>
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= activeRating;
                const isHalf = !isFilled && star - 0.5 <= activeRating;

                return (
                    <button
                        key={star}
                        type="button"
                        disabled={readonly}
                        onClick={() => !readonly && onChange && onChange(star)}
                        onMouseEnter={() => !readonly && setHoverValue(star)}
                        onMouseLeave={() => !readonly && setHoverValue(null)}
                        className={`transition-transform focus:outline-none ${
                            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                        }`}
                        aria-label={`Rate ${star} out of 5 stars`}
                    >
                        <Star
                            className={`${sizeClasses[size]} ${
                                isFilled
                                    ? 'fill-amber-400 text-amber-400'
                                    : isHalf
                                    ? 'fill-amber-400/50 text-amber-400'
                                    : 'fill-slate-100 text-slate-300 dark:fill-zinc-800 dark:text-zinc-600'
                            }`}
                        />
                    </button>
                );
            })}
            {showLabel && (
                <span className="ml-1.5 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                    {value > 0 ? value.toFixed(1) : 'No reviews'}
                </span>
            )}
        </div>
    );
};
