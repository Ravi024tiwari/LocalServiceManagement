import mongoose from 'mongoose';
import { Review } from '../models/Review.model.js';
import { Booking } from '../models/Booking.model.js';
import { Service } from '../models/Service.model.js';
import { ProviderProfile } from '../models/ProviderProfile.model.js';
import { broadcastReviewUpdate } from '../utils/socket.js';

// Helper function to calculate and update average ratings & rating distribution
export const calculateServiceRatingSummary = async (serviceId: string) => {
    const sId = new mongoose.Types.ObjectId(serviceId);

    const stats = await Review.aggregate([
        { $match: { service_id: sId } },
        {
            $group: {
                _id: '$service_id',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
                fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
            }
        }
    ]);

    if (stats.length === 0) {
        return {
            averageRating: 0,
            totalReviews: 0,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };
    }

    const stat = stats[0];
    return {
        averageRating: Number((stat.averageRating || 0).toFixed(1)),
        totalReviews: stat.totalReviews || 0,
        distribution: {
            5: stat.fiveStar || 0,
            4: stat.fourStar || 0,
            3: stat.threeStar || 0,
            2: stat.twoStar || 0,
            1: stat.oneStar || 0,
        }
    };
};

export const updateAverageRatings = async (serviceId: string, providerId: string) => {
    try {
        const summary = await calculateServiceRatingSummary(serviceId);

        // Update Service
        await Service.findByIdAndUpdate(serviceId, {
            averageRating: summary.averageRating,
            totalReviews: summary.totalReviews
        });

        // Calculate for Provider across all provider's services
        const pId = new mongoose.Types.ObjectId(providerId);
        const providerStats = await Review.aggregate([
            { $match: { provider_id: pId } },
            {
                $group: {
                    _id: '$provider_id',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        if (providerStats.length > 0) {
            await ProviderProfile.findOneAndUpdate(
                { user_id: providerId },
                {
                    averageRating: Number(providerStats[0].averageRating.toFixed(1)),
                    totalReviews: providerStats[0].totalReviews
                }
            );
        } else {
            await ProviderProfile.findOneAndUpdate(
                { user_id: providerId },
                { averageRating: 0, totalReviews: 0 }
            );
        }

        return summary;
    } catch (error) {
        console.error('Error updating average ratings:', error);
        throw error;
    }
};

/**
 * Upsert Review: 1 User / Email per service constraint
 * If user already reviewed this service, updates existing review.
 * If new, creates new review.
 */
export const upsertServiceReview = async (
    customerId: string,
    serviceId: string,
    rating: number,
    comment?: string,
    bookingId?: string
) => {
    // 1. Verify service exists & get provider_id
    const service = await Service.findById(serviceId);
    if (!service || service.is_deleted) {
        throw new Error('Service not found or has been removed.');
    }

    const providerId = service.provider_id.toString();

    // Prevent provider from reviewing their own service
    if (providerId === customerId.toString()) {
        throw new Error('Service providers cannot review their own services.');
    }

    // 2. Find existing review by this customer for this service
    let review = await Review.findOne({
        service_id: serviceId,
        customer_id: customerId
    });

    let isNew = false;

    if (review) {
        // Update existing review
        review.rating = rating;
        review.comment = comment || '';
        if (bookingId) review.booking_id = new mongoose.Types.ObjectId(bookingId);
        await review.save();
    } else {
        // Create new review
        isNew = true;
        review = await Review.create({
            service_id: serviceId,
            customer_id: customerId,
            provider_id: providerId,
            booking_id: bookingId ? new mongoose.Types.ObjectId(bookingId) : undefined,
            rating,
            comment: comment || ''
        });
    }

    // Populate reviewer details for UI
    await review.populate('customer_id', 'name email avatar');

    // 3. Update aggregated ratings for Service & Provider
    const updatedSummary = await updateAverageRatings(serviceId, providerId);

    // 4. Real-time broadcast to all connected Customers, Providers, and Admins
    broadcastReviewUpdate(serviceId, providerId, {
        type: isNew ? 'REVIEW_CREATED' : 'REVIEW_UPDATED',
        serviceId,
        providerId,
        review,
        summary: updatedSummary
    });

    return { review, summary: updatedSummary, isNew };
};

// Legacy compatibility for createReview linked with booking
export const createReview = async (customerId: string, bookingId: string, rating: number, comment?: string) => {
    const booking = await Booking.findOne({ _id: bookingId, customer_id: customerId });
    if (!booking) {
        throw new Error('Booking not found or unauthorized.');
    }
    if (booking.status !== 'COMPLETED') {
        throw new Error('You can only review a service after the job is COMPLETED.');
    }

    return upsertServiceReview(customerId, booking.service_id.toString(), rating, comment, bookingId);
};

// Fetch user's existing review for a service
export const getUserReviewForService = async (customerId: string, serviceId: string) => {
    const review = await Review.findOne({
        service_id: serviceId,
        customer_id: customerId
    }).populate('customer_id', 'name email avatar');

    return review;
};

// Fetch paginated reviews & rating summary for a service
export const getServiceReviews = async (serviceId: string, page: number = 1, limit: number = 10, starFilter?: number) => {
    const skip = (page - 1) * limit;

    const query: any = { service_id: serviceId };
    if (starFilter && starFilter >= 1 && starFilter <= 5) {
        query.rating = starFilter;
    }

    const [reviews, totalCount, summary] = await Promise.all([
        Review.find(query)
            .populate('customer_id', 'name email avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Review.countDocuments(query),
        calculateServiceRatingSummary(serviceId)
    ]);

    return {
        reviews,
        total: totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
        summary
    };
};

// Fetch paginated reviews for a provider
export const getProviderReviews = async (providerId: string, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const [reviews, totalCount] = await Promise.all([
        Review.find({ provider_id: providerId })
            .populate('customer_id', 'name email avatar')
            .populate('service_id', 'name category price')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Review.countDocuments({ provider_id: providerId })
    ]);

    return {
        reviews,
        total: totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit)
    };
};

// Delete review (by review author or Admin)
export const deleteReview = async (reviewId: string, userId: string, userRole: string) => {
    const review = await Review.findById(reviewId);
    if (!review) {
        throw new Error('Review not found.');
    }

    if (userRole !== 'ADMIN' && review.customer_id.toString() !== userId) {
        throw new Error('Unauthorized to delete this review.');
    }

    const serviceId = review.service_id.toString();
    const providerId = review.provider_id.toString();

    await Review.findByIdAndDelete(reviewId);

    // Recalculate average ratings
    const updatedSummary = await updateAverageRatings(serviceId, providerId);

    // Broadcast real-time deletion
    broadcastReviewUpdate(serviceId, providerId, {
        type: 'REVIEW_DELETED',
        serviceId,
        providerId,
        reviewId,
        summary: updatedSummary
    });

    return { success: true, summary: updatedSummary };
};