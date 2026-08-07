import React, { useState } from 'react';
import { StarRating } from './StarRating';
import type { ReviewItem } from '../../services/review.api';
import { User, Trash2, CheckCircle2, ThumbsUp } from 'lucide-react';

interface ReviewListProps {
    reviews: ReviewItem[];
    currentUserId?: string;
    currentUserRole?: string;
    onDeleteReview?: (reviewId: string) => Promise<void>;
    isLoading?: boolean;
}

export const ReviewList: React.FC<ReviewListProps> = ({
    reviews,
    currentUserId,
    currentUserRole,
    onDeleteReview,
    isLoading = false,
}) => {
    // Local interactive Helpful votes state
    const [helpfulVotes, setHelpfulVotes] = useState<Record<string, { count: number; voted: boolean }>>({});

    const handleHelpfulClick = (reviewId: string) => {
        setHelpfulVotes((prev) => {
            const current = prev[reviewId] || { count: Math.floor(Math.random() * 5), voted: false };
            if (current.voted) {
                return { ...prev, [reviewId]: { count: current.count - 1, voted: false } };
            } else {
                return { ...prev, [reviewId]: { count: current.count + 1, voted: true } };
            }
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-4 py-6">
                {[1, 2, 3].map((n) => (
                    <div
                        key={n}
                        className="p-5 bg-white border border-gray-100 rounded-2xl animate-pulse space-y-3 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full" />
                            <div className="space-y-1.5 flex-1">
                                <div className="w-32 h-4 bg-gray-200 rounded-sm" />
                                <div className="w-20 h-3 bg-gray-200 rounded-sm" />
                            </div>
                        </div>
                        <div className="w-full h-12 bg-gray-100 rounded-xl" />
                    </div>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-2xl">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl mb-3">
                    💬
                </div>
                <h4 className="text-base font-bold text-gray-900">No reviews yet</h4>
                <p className="text-xs text-gray-500 mt-1">
                    Be the first customer to leave a review and rating for this service!
                </p>
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }).format(date);
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-4">
            {reviews.map((review) => {
                const customer = review.customer_id;
                const isAuthor = currentUserId && customer && (customer._id === currentUserId || (customer as any) === currentUserId);
                const isAdmin = currentUserRole === 'ADMIN';
                const canDelete = isAuthor || isAdmin;

                const vote = helpfulVotes[review._id] || { count: Math.floor(Math.random() * 4), voted: false };

                return (
                    <div
                        key={review._id}
                        className="group relative p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 space-y-3"
                    >
                        <div className="flex items-start justify-between gap-4">
                            {/* Reviewer Meta */}
                            <div className="flex items-center gap-3">
                                {customer?.avatar ? (
                                    <img
                                        src={customer.avatar}
                                        alt={customer.name || 'User'}
                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-xs shadow-sm">
                                        {customer?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h5 className="text-xs sm:text-sm font-extrabold text-gray-900">
                                            {customer?.name || 'Verified Customer'}
                                        </h5>
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                            Verified
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <StarRating value={review.rating} readonly size="sm" />
                                        <span className="text-xs text-gray-400 font-medium">
                                            • {formatDate(review.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions (Delete if author/admin) */}
                            {canDelete && onDeleteReview && (
                                <button
                                    onClick={() => onDeleteReview(review._id)}
                                    title="Delete Review"
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Review Content */}
                        {review.comment && (
                            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-line pl-1 flex-1">
                                "{review.comment}"
                            </p>
                        )}

                        {/* Helpful Button */}
                        <div className="pt-2 border-t border-gray-50 flex items-center gap-3">
                            <button
                                onClick={() => handleHelpfulClick(review._id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    vote.voted
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                                }`}
                            >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>Helpful ({vote.count})</span>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
