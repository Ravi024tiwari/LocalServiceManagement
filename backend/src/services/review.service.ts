import mongoose from 'mongoose';
import { Review } from '../models/Review.model.js';
import { Booking } from '../models/Booking.model.js';
import { Service } from '../models/Service.model.js';
import { ProviderProfile } from '../models/ProviderProfile.model.js';

// Helper function to calculate and update average ratings asynchronously
const updateAverageRatings = async (serviceId: any, providerId: any) => {
    try {
        // 1. Calculate for Service
        const serviceStats = await Review.aggregate([
            { $match: { service_id: new mongoose.Types.ObjectId(serviceId) } },
            { $group: { _id: '$service_id', averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
        ]);

        if (serviceStats.length > 0) {
            await Service.findByIdAndUpdate(serviceId, {
                averageRating: Number(serviceStats[0].averageRating.toFixed(1)),
                totalReviews: serviceStats[0].totalReviews
            });
        }

        // 2. Calculate for Provider
        const providerStats = await Review.aggregate([
            { $match: { provider_id: new mongoose.Types.ObjectId(providerId) } },
            { $group: { _id: '$provider_id', averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
        ]);

        if (providerStats.length > 0) {
            await ProviderProfile.findOneAndUpdate(
                { user_id: providerId },
                {
                    averageRating: Number(providerStats[0].averageRating.toFixed(1)),
                    totalReviews: providerStats[0].totalReviews
                }
            );
        }
    } catch (error) {
        console.error('Error updating average ratings:', error);
    }
};

export const createReview = async (customerId: string, bookingId: string, rating: number, comment?: string) => {
    // 1. Fetch the booking to ensure it belongs to this customer
    const booking = await Booking.findOne({ _id: bookingId, customer_id: customerId });

    if (!booking) {
        throw new Error('Booking not found or unauthorized.');
    }

    // 2. Ensure job is actually COMPLETED
    if (booking.status !== 'COMPLETED') {
        throw new Error('You can only review a service after the job is COMPLETED.');
    }

    // 3. Prevent duplicate reviews (Our Schema unique index also catches this, but this gives a friendly error)
    const existingReview = await Review.findOne({ booking_id: bookingId });
    if (existingReview) {
        throw new Error('You have already submitted a review for this booking.');
    }

    // 4. Create the review by inferring details safely from the booking record
    const review = await Review.create({
        booking_id: booking._id,
        customer_id: customerId,
        service_id: booking.service_id,
        provider_id: booking.provider_id,
        rating,
        comment
    });

    // 5. Fire and forget: Update averages in the background without blocking the API response
    updateAverageRatings(booking.service_id, booking.provider_id);

    return review;
};

// Fetch paginated reviews for a specific service
export const getServiceReviews = async (serviceId: string, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ service_id: serviceId })
        .populate('customer_id', 'name avatar')
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(limit);

    const total = await Review.countDocuments({ service_id: serviceId });

    return { reviews, total, page, totalPages: Math.ceil(total / limit) };
};

// Fetch paginated reviews for a specific provider
export const getProviderReviews = async (providerId: string, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ provider_id: providerId })
        .populate('customer_id', 'name avatar')
        .populate('service_id', 'title') // Show which service they reviewed
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Review.countDocuments({ provider_id: providerId });

    return { reviews, total, page, totalPages: Math.ceil(total / limit) };
};