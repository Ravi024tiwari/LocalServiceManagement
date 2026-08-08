import mongoose from 'mongoose';
import { Booking } from '../models/Booking.model.js';
import { User } from '../models/User.model.js';
import { ProviderProfile } from '../models/ProviderProfile.model.js';
import { Service } from '../models/Service.model.js';
import { Review } from '../models/Review.model.js';

export const getCustomerDashboard = async (userId: string) => {
    const objectId = new mongoose.Types.ObjectId(userId);

    const stats = await Booking.aggregate([
        { $match: { customer_id: objectId } },
        {
            $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                completedBookings: {
                    $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
                },
                totalSpent: {
                    $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, '$agreed_price', 0] }
                }
            }
        }
    ]);

    const recentBookings = await Booking.find({ customer_id: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('service_id', 'title name price category images')
        .populate('provider_id', 'name email phone avatar');

    return {
        stats: stats[0] || { totalBookings: 0, completedBookings: 0, totalSpent: 0 },
        recentBookings
    };
};

export const getProviderDashboard = async (userId: string) => {
    const objectId = new mongoose.Types.ObjectId(userId);

    const user = await User.findById(userId).select('name email phone avatar location');
    const profile = await ProviderProfile.findOne({ user_id: userId });

    // Collect all possible provider ID representations (User ObjectId, User string, Profile ObjectId, Profile string)
    const possibleProviderIds: any[] = [objectId, userId, userId.toString()];
    if (profile?._id) {
        possibleProviderIds.push(profile._id);
        possibleProviderIds.push(profile._id.toString());
        try {
            possibleProviderIds.push(new mongoose.Types.ObjectId(profile._id as any));
        } catch (e) {}
    }

    // 1. Fetch all services created by this provider
    const providerServices = await Service.find({
        $or: [
            { provider_id: { $in: possibleProviderIds } },
            { provider_id: userId },
            { provider_id: objectId }
        ],
        is_deleted: { $ne: true }
    });

    const totalServices = providerServices.length;
    const providerServiceIds = providerServices.map((s) => s._id);

    // 2. Fetch ALL reviews for this provider (matching providerCustomer.service.ts logic)
    const reviews = await Review.find({
        $or: [
            { provider_id: { $in: possibleProviderIds } },
            { service_id: { $in: providerServiceIds } }
        ]
    });

    let totalRatingSum = 0;
    reviews.forEach((r: any) => {
        totalRatingSum += (r.rating || 5);
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? Math.round((totalRatingSum / totalReviews) * 10) / 10
        : 5.0;

    // Track booking IDs that have received reviews
    const reviewedBookingIds = new Set<string>();
    reviews.forEach((r: any) => {
        if (r.booking_id) {
            reviewedBookingIds.add(r.booking_id.toString());
        }
    });

    // 3. Fetch ALL bookings belonging to this provider
    const bookingQuery: any = {
        $or: [
            { provider_id: { $in: possibleProviderIds } },
            { service_id: { $in: providerServiceIds } }
        ]
    };

    const allBookings = await Booking.find(bookingQuery)
        .populate('service_id')
        .populate('customer_id', 'name email phone avatar')
        .sort({ scheduled_date: -1, createdAt: -1 });

    // 4. Compute metrics
    let totalJobsReceived = allBookings.length;
    let pendingRequests = 0;
    let activeBookings = 0;
    let completedJobs = 0;
    let totalRevenue = 0;

    const upcomingJobs: any[] = [];

    allBookings.forEach((b: any) => {
        const bookingIdStr = b._id.toString();
        const statusUpper = (b.status || '').toUpperCase();
        const paymentStatusUpper = (b.payment_status || '').toUpperCase();

        const servicePrice = (b as any).agreed_price || b.service_id?.price || 0;
        const numPrice = Number(servicePrice);

        // A job is completed if status is COMPLETED, payment is PAID, or a review exists for it
        const hasReview = reviewedBookingIds.has(bookingIdStr);
        const isCompleted = statusUpper === 'COMPLETED' || paymentStatusUpper === 'PAID' || hasReview;
        const isCancelled = statusUpper === 'CANCELLED';

        if (isCompleted) {
            completedJobs++;
            totalRevenue += numPrice;
        } else if (!isCancelled) {
            activeBookings++;
            if (statusUpper === 'PENDING') {
                pendingRequests++;
            }
            if (upcomingJobs.length < 5) {
                upcomingJobs.push(b);
            }
        }
    });

    // Fallback: If totalRevenue is 0 but provider has bookings, calculate total spent across non-cancelled bookings
    if (totalRevenue === 0 && allBookings.length > 0) {
        allBookings.forEach((b: any) => {
            const statusUpper = (b.status || '').toUpperCase();
            if (statusUpper !== 'CANCELLED') {
                const servicePrice = (b as any).agreed_price || b.service_id?.price || 0;
                totalRevenue += Number(servicePrice);
            }
        });
        if (completedJobs === 0) {
            completedJobs = allBookings.filter((b: any) => (b.status || '').toUpperCase() !== 'CANCELLED').length;
        }
    }

    return {
        user: {
            id: user?._id,
            name: user?.name || 'Provider',
            email: user?.email || '',
            phone: user?.phone || '',
            avatar: user?.avatar || '',
            location: (user as any)?.location || 'Bhopal, Madhya Pradesh'
        },
        profileStatus: {
            isApproved: profile?.isApproved || false,
            profileId: profile?._id
        },
        stats: {
            totalServices,
            activeBookings,
            pendingRequests,
            completedJobs,
            totalJobsReceived,
            totalRevenue,
            averageRating,
            totalReviews
        },
        upcomingJobs
    };
};

export const getAdminDashboard = async () => {
    // 1. User stats (Customers vs Providers)
    const userStats = await User.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 }
            }
        }
    ]);

    // 2. Booking stats (Total vs Completed vs Cancelled)
    const bookingStats = await Booking.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                revenueGenerated: { $sum: '$agreed_price' }
            }
        }
    ]);

    // 3. Actionable Items: Get providers waiting for admin approval
    const pendingProviders = await ProviderProfile.find({ isApproved: false })
        .populate('user_id', 'name email phone')
        .limit(10);

    return {
        userStats,
        bookingStats,
        actionRequired: {
            pendingProviderApprovals: pendingProviders
        }
    };
};