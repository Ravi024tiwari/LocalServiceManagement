import React, { useState, useEffect, useCallback } from 'react';
import { ServiceReviewSummary } from './ServiceReviewSummary';
import { ReviewFormModal } from './ReviewFormModal';
import { ReviewList } from './ReviewList';
import { reviewApi } from '../../services/review.api';
import type { ReviewItem, RatingSummary } from '../../services/review.api';
import { getSocket } from '../../lib/socket';

interface ServiceReviewsSectionProps {
    serviceId: string;
    serviceName?: string;
    currentUserId?: string;
    currentUserRole?: string;
    isLoggedIn?: boolean;
}

export const ServiceReviewsSection: React.FC<ServiceReviewsSectionProps> = ({
    serviceId,
    serviceName = 'Service',
    currentUserId,
    currentUserRole,
    isLoggedIn = false,
}) => {
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [summary, setSummary] = useState<RatingSummary>({
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });
    const [userReview, setUserReview] = useState<ReviewItem | null>(null);
    const [starFilter, setStarFilter] = useState<number | undefined>(undefined);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Fetch service reviews & rating summary
    const loadReviews = useCallback(async () => {
        if (!serviceId) return;
        setIsLoading(true);
        try {
            const data = await reviewApi.getServiceReviews(serviceId, page, 10, starFilter);
            setReviews(data.reviews);
            setSummary(data.summary);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error('Failed to load service reviews:', err);
        } finally {
            setIsLoading(false);
        }
    }, [serviceId, page, starFilter]);

    // Fetch user's existing review for this service if logged in
    const loadUserReview = useCallback(async () => {
        if (!serviceId || !isLoggedIn || currentUserRole === 'PROVIDER') return;
        try {
            const review = await reviewApi.getUserReviewForService(serviceId);
            setUserReview(review);
        } catch (err) {
            console.error('Failed to check user review:', err);
        }
    }, [serviceId, isLoggedIn, currentUserRole]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    useEffect(() => {
        loadUserReview();
    }, [loadUserReview]);

    // Socket.io Real-time setup
    useEffect(() => {
        if (!serviceId) return;

        const socket = getSocket();
        socket.emit('join_service', serviceId);

        const handleRealtimeUpdate = (payload: any) => {
            if (payload.serviceId === serviceId) {
                // Instantly update aggregated summary
                if (payload.summary) {
                    setSummary(payload.summary);
                }
                // Reload review list to reflect new/updated/deleted review
                loadReviews();
                loadUserReview();
            }
        };

        socket.on('review:updated', handleRealtimeUpdate);

        return () => {
            socket.emit('leave_service', serviceId);
            socket.off('review:updated', handleRealtimeUpdate);
        };
    }, [serviceId, loadReviews, loadUserReview]);

    // Handle review submission (upsert)
    const handleSubmitReview = async (rating: number, comment: string) => {
        setIsSubmitting(true);
        try {
            const res = await reviewApi.submitServiceReview({
                serviceId,
                rating,
                comment
            });
            if (res.data) {
                setUserReview(res.data);
            }
            await loadReviews();
        } catch (err) {
            console.error('Submit review error:', err);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle review deletion
    const handleDeleteReview = async (reviewId: string) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await reviewApi.deleteReview(reviewId);
            if (userReview?._id === reviewId) {
                setUserReview(null);
            }
            await loadReviews();
        } catch (err) {
            console.error('Delete review error:', err);
            alert('Failed to delete review');
        }
    };

    return (
        <div className="space-y-6 my-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Customer Reviews & Ratings
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        Real-time verified feedback from community members
                    </p>
                </div>
            </div>

            {/* Summary Card */}
            <ServiceReviewSummary
                summary={summary}
                selectedStarFilter={starFilter}
                onSelectStarFilter={(star) => {
                    setStarFilter(star);
                    setPage(1);
                }}
                onWriteReviewClick={() => setIsModalOpen(true)}
                userReviewExists={!!userReview}
                isLoggedIn={isLoggedIn && currentUserRole === 'CUSTOMER'}
            />

            {/* Review List */}
            <ReviewList
                reviews={reviews}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onDeleteReview={handleDeleteReview}
                isLoading={isLoading}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-zinc-800">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
                    >
                        ← Previous
                    </button>
                    <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Modal Dialog */}
            <ReviewFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitReview}
                existingRating={userReview?.rating}
                existingComment={userReview?.comment}
                serviceName={serviceName}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};
