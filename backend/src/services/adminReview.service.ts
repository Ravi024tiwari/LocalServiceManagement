import mongoose from 'mongoose';
import { Review } from '../models/Review.model.js';
import { updateAverageRatings } from './review.service.js';

export interface GetAdminReviewsParams {
    page?: number;
    limit?: number;
    search?: string;
    rating?: number;
    category?: string;
    providerId?: string;
    sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low';
}

export const getAdminReviews = async (params: GetAdminReviewsParams) => {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 10);
    const skip = (page - 1) * limit;

    // 1. Calculate overall system KPIs (Total Reviews & Overall Average Rating only)
    const kpiStats = await Review.aggregate([
        {
            $group: {
                _id: null,
                totalReviews: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    const totalReviewsKpi = kpiStats.length > 0 ? kpiStats[0].totalReviews : 0;
    const rawAvgRating = kpiStats.length > 0 ? kpiStats[0].avgRating : 0;
    const averageRatingKpi = Number(rawAvgRating.toFixed(1));

    // 2. Build Aggregation Pipeline for Paginated & Filtered Reviews
    const pipeline: any[] = [];

    // Filter by rating directly if specified
    if (params.rating && params.rating >= 1 && params.rating <= 5) {
        pipeline.push({ $match: { rating: Number(params.rating) } });
    }

    // Filter by providerId directly if specified
    if (params.providerId && mongoose.Types.ObjectId.isValid(params.providerId)) {
        pipeline.push({ $match: { provider_id: new mongoose.Types.ObjectId(params.providerId) } });
    }

    // Lookup customer details
    pipeline.push({
        $lookup: {
            from: 'users',
            localField: 'customer_id',
            foreignField: '_id',
            as: 'customer'
        }
    });
    
    pipeline.push({ $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } });

    // Lookup provider details
    pipeline.push({
        $lookup: {
            from: 'users',
            localField: 'provider_id',
            foreignField: '_id',
            as: 'provider'
        }
    });
    pipeline.push({ $unwind: { path: '$provider', preserveNullAndEmptyArrays: true } });

    // Lookup service details
    pipeline.push({
        $lookup: {
            from: 'services',
            localField: 'service_id',
            foreignField: '_id',
            as: 'service'
        }
    });
    pipeline.push({ $unwind: { path: '$service', preserveNullAndEmptyArrays: true } });

    // Filter by Service Category if specified
    if (params.category && params.category !== 'ALL') {
        pipeline.push({
            $match: {
                'service.category': { $regex: new RegExp(`^${params.category}$`, 'i') }
            }
        });
    }

    // Search query matching (customer name/email, provider name/email, service name, comment)
    if (params.search && params.search.trim() !== '') {
        const searchRegex = new RegExp(params.search.trim(), 'i');
        pipeline.push({
            $match: {
                $or: [
                    { 'customer.name': searchRegex },
                    { 'customer.email': searchRegex },
                    { 'provider.name': searchRegex },
                    { 'provider.email': searchRegex },
                    { 'service.name': searchRegex },
                    { 'service.category': searchRegex },
                    { comment: searchRegex }
                ]
            }
        });
    }

    // Sorting
    let sortStage: any = { createdAt: -1 };
    if (params.sortBy === 'oldest') {
        sortStage = { createdAt: 1 };
    } else if (params.sortBy === 'rating_high') {
        sortStage = { rating: -1, createdAt: -1 };
    } else if (params.sortBy === 'rating_low') {
        sortStage = { rating: 1, createdAt: -1 };
    }
    pipeline.push({ $sort: sortStage });

    // Facet for data and pagination count
    pipeline.push({
        $facet: {
            reviews: [
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        _id: 1,
                        rating: 1,
                        comment: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        booking_id: 1,
                        customer: {
                            _id: '$customer._id',
                            name: '$customer.name',
                            email: '$customer.email',
                            avatar: '$customer.avatar',
                            role: '$customer.role'
                        },
                        provider: {
                            _id: '$provider._id',
                            name: '$provider.name',
                            email: '$provider.email',
                            avatar: '$provider.avatar'
                        },
                        service: {
                            _id: '$service._id',
                            name: '$service.name',
                            category: '$service.category',
                            price: '$service.price',
                            images: '$service.images'
                        }
                    }
                }
            ],
            totalCount: [{ $count: 'count' }]
        }
    });

    const result = await Review.aggregate(pipeline);
    const facetResult = result[0];
    const reviews = facetResult.reviews || [];
    const totalCount = facetResult.totalCount.length > 0 ? facetResult.totalCount[0].count : 0;
    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
        kpis: {
            totalReviews: totalReviewsKpi,
            averageRating: averageRatingKpi
        },
        reviews,
        pagination: {
            total: totalCount,
            page,
            limit,
            totalPages
        }
    };
};

export const deleteAdminReview = async (reviewId: string) => {
    const review = await Review.findById(reviewId);
    if (!review) {
        throw new Error('Review not found.');
    }

    const serviceId = review.service_id.toString();
    const providerId = review.provider_id.toString();

    await Review.findByIdAndDelete(reviewId);

    // Recalculate average ratings for affected service & provider
    const updatedSummary = await updateAverageRatings(serviceId, providerId);

    return { success: true, summary: updatedSummary };
};
