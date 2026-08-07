import React from 'react';
import { StarRating } from './StarRating';
import type { RatingSummary } from '@/services/review.api';
import { Star, Sparkles, Award } from 'lucide-react';

interface ServiceReviewSummaryProps {
    summary: RatingSummary;
    selectedStarFilter?: number;
    onSelectStarFilter?: (star: number | undefined) => void;
    onWriteReviewClick?: () => void;
    userReviewExists?: boolean;
    isLoggedIn?: boolean;
}

export const ServiceReviewSummary: React.FC<ServiceReviewSummaryProps> = ({
    summary,
    selectedStarFilter,
    onSelectStarFilter,
    onWriteReviewClick,
    userReviewExists = false,
    isLoggedIn = false,
}) => {
    const { averageRating, totalReviews, distribution } = summary;

    const stars = [5, 4, 3, 2, 1];

    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Score Header */}
                <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6 text-center">
                    <div className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full text-xs font-bold border border-amber-200 mb-2 inline-flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Customer Satisfaction</span>
                    </div>

                    <div className="text-5xl font-black text-gray-900 tracking-tight">
                        {totalReviews > 0 ? averageRating.toFixed(1) : '0.0'}
                    </div>

                    <div className="mt-2">
                        <StarRating value={averageRating} readonly size="lg" />
                    </div>

                    <p className="mt-1.5 text-xs font-bold text-gray-500">
                        Based on {totalReviews} verified {totalReviews === 1 ? 'review' : 'reviews'}
                    </p>

                    {isLoggedIn && onWriteReviewClick && (
                        <button
                            type="button"
                            onClick={onWriteReviewClick}
                            className="mt-4 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>{userReviewExists ? 'Edit Your Review' : 'Write a Review'}</span>
                        </button>
                    )}
                </div>

                {/* Rating Distribution Breakdown */}
                <div className="md:col-span-8 flex flex-col justify-center space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-extrabold text-gray-700 mb-1">
                        <span>Rating Distribution</span>
                        {selectedStarFilter && (
                            <button
                                type="button"
                                onClick={() => onSelectStarFilter && onSelectStarFilter(undefined)}
                                className="text-emerald-600 font-bold hover:underline cursor-pointer"
                            >
                                Clear Filter ({selectedStarFilter} Stars)
                            </button>
                        )}
                    </div>

                    {stars.map((star) => {
                        const count = distribution[star as keyof typeof distribution] || 0;
                        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                        const isSelected = selectedStarFilter === star;

                        return (
                            <button
                                key={star}
                                type="button"
                                onClick={() =>
                                    onSelectStarFilter &&
                                    onSelectStarFilter(isSelected ? undefined : star)
                                }
                                className={`group flex items-center gap-3 w-full text-left p-1.5 rounded-xl transition-all cursor-pointer ${
                                    isSelected
                                        ? 'bg-emerald-50 border border-emerald-200 ring-2 ring-emerald-500/20'
                                        : 'hover:bg-gray-50'
                                }`}
                            >
                                <span className="w-12 text-xs font-bold text-gray-700 flex items-center gap-1">
                                    {star} <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                </span>
                                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="w-14 text-right text-xs font-bold text-gray-600 font-mono">
                                    {count} ({Math.round(percentage)}%)
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Customer Sentiment Tag Pills (Green & Orange Accent Theme) */}
            <div className="pt-4 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-500 block mb-2.5 uppercase tracking-wider">
                    Customer Sentiment Highlights
                </span>
                <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Professional (45)
                    </span>
                    <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Punctual (32)
                    </span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Quality Work (28)
                    </span>
                    <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Value for Money (19)
                    </span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Clean Work (16)
                    </span>
                </div>
            </div>
        </div>
    );
};
