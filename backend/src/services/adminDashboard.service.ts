import { User } from '../models/User.model.js';
import { ProviderProfile } from '../models/ProviderProfile.model.js';
import { Service } from '../models/Service.model.js';
import { Booking } from '../models/Booking.model.js';
import { Review } from '../models/Review.model.js';

export const getAdminDashboardService = async () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // 1. Core Metrics Counts
    const totalUsersCount = await User.countDocuments();
    const totalProvidersCount = await User.countDocuments({ role: 'PROVIDER' });
    const totalServicesCount = await Service.countDocuments({ is_deleted: { $ne: true } });
    const totalBookingsCount = await Booking.countDocuments();

    // 2. Real Revenue Aggregation from Completed Bookings
    const revenueStats = await Booking.aggregate([
        { $match: { status: 'COMPLETED' } },
        {
            $lookup: {
                from: 'services',
                localField: 'service_id',
                foreignField: '_id',
                as: 'service',
            },
        },
        { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$service.price', 499] } } } }
    ]);
    const totalRevenueSum = revenueStats[0]?.total || 0;

    // 3. Provider Verification Metrics & Pending List
    const pendingProfilesCount = await ProviderProfile.countDocuments({ verification_status: 'PENDING' });
    const approvedProfilesCount = await ProviderProfile.countDocuments({ verification_status: 'APPROVED' });
    const rejectedProfilesCount = await ProviderProfile.countDocuments({ verification_status: 'REJECTED' });

    const pendingProvidersList = await ProviderProfile.find({ verification_status: 'PENDING' })
        .populate('user_id', 'name email phone avatar location createdAt')
        .limit(5);

    const formattedPendingProviders = pendingProvidersList.map((p: any) => {
        const u = p.user_id;
        const appliedDate = u?.createdAt
            ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Recently';
        return {
            providerProfileId: p._id.toString(),
            userId: u?._id?.toString(),
            name: u?.name || 'Applicant Provider',
            email: u?.email || 'provider@servicehub.com',
            phone: u?.phone || '',
            avatar: u?.avatar,
            category: p.category || 'Service Provider',
            appliedDate: `Applied on ${appliedDate}`,
            verificationStatus: p.verification_status,
        };
    });

    // 4. Dynamic Category Breakdown Aggregation
    const categoryAgg = await Service.aggregate([
        { $match: { is_deleted: { $ne: true } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);

    const palette = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#6b7280'];
    const totalCatCount = categoryAgg.reduce((acc, c) => acc + c.count, 0) || 1;

    const servicesByCategoryChart = categoryAgg.map((item, idx) => ({
        name: item._id || 'Uncategorized',
        count: item.count,
        percentage: Math.max(1, Math.round((item.count / totalCatCount) * 100)),
        color: palette[idx % palette.length],
    }));

    // 5. Top Services by Reviews
    const topServicesFromDb = await Service.find({ is_deleted: { $ne: true } })
        .sort({ totalReviews: -1, averageRating: -1 })
        .limit(5);

    const topServicesList = topServicesFromDb.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        category: s.category,
        rating: s.averageRating || 5.0,
        reviewsCount: s.totalReviews || 0,
        price: s.price,
    }));

    // 6. Dynamic Date-Interval Generation for Charts (Past 5 intervals)
    const periods: { label: string; endDate: Date }[] = [];
    for (let i = 4; i >= 0; i--) {
        const endDate = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const label = endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        periods.push({ label, endDate });
    }

    const bookingsOverviewChart = await Promise.all(
        periods.map(async (p) => {
            const count = await Booking.countDocuments({ createdAt: { $lte: p.endDate } });
            return { date: p.label, bookings: count };
        })
    );

    const revenueOverviewChart = await Promise.all(
        periods.map(async (p) => {
            const revRes = await Booking.aggregate([
                { $match: { createdAt: { $lte: p.endDate }, status: 'COMPLETED' } },
                {
                    $lookup: {
                        from: 'services',
                        localField: 'service_id',
                        foreignField: '_id',
                        as: 'service',
                    },
                },
                { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
                { $group: { _id: null, total: { $sum: { $ifNull: ['$service.price', 499] } } } },
            ]);
            return { date: p.label, revenue: revRes[0]?.total || 0 };
        })
    );

    const userGrowthChart = await Promise.all(
        periods.map(async (p) => {
            const count = await User.countDocuments({ createdAt: { $lte: p.endDate } });
            return { date: p.label, users: count };
        })
    );

    // 7. Dynamic Growth Percentage Calculation vs Previous 30-Day Period
    const calcGrowth = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? '+100%' : '0%';
        const pct = (((curr - prev) / prev) * 100).toFixed(1);
        return pct.startsWith('-') ? `${pct}%` : `+${pct}%`;
    };

    const currUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const prevUsers = await User.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });

    const currProviders = await User.countDocuments({ role: 'PROVIDER', createdAt: { $gte: thirtyDaysAgo } });
    const prevProviders = await User.countDocuments({ role: 'PROVIDER', createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });

    const currServices = await Service.countDocuments({ is_deleted: { $ne: true }, createdAt: { $gte: thirtyDaysAgo } });
    const prevServices = await Service.countDocuments({ is_deleted: { $ne: true }, createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });

    const currBookings = await Booking.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const prevBookings = await Booking.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });

    const currRevAgg = await Booking.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, status: 'COMPLETED' } },
        {
            $lookup: {
                from: 'services',
                localField: 'service_id',
                foreignField: '_id',
                as: 'service',
            },
        },
        { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$service.price', 499] } } } },
    ]);
    const currRevenue = currRevAgg[0]?.total || 0;

    const prevRevAgg = await Booking.aggregate([
        { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }, status: 'COMPLETED' } },
        {
            $lookup: {
                from: 'services',
                localField: 'service_id',
                foreignField: '_id',
                as: 'service',
            },
        },
        { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$service.price', 499] } } } },
    ]);
    const prevRevenue = prevRevAgg[0]?.total || 0;

    const avgRatingAgg = await Review.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const averageRating = avgRatingAgg[0]?.avgRating ? Number(avgRatingAgg[0].avgRating.toFixed(1)) : 5.0;

    return {
        metrics: {
            totalUsers: totalUsersCount,
            totalUsersGrowth: calcGrowth(currUsers, prevUsers),
            totalProviders: totalProvidersCount,
            totalProvidersGrowth: calcGrowth(currProviders, prevProviders),
            totalServices: totalServicesCount,
            totalServicesGrowth: calcGrowth(currServices, prevServices),
            totalBookings: totalBookingsCount,
            totalBookingsGrowth: calcGrowth(currBookings, prevBookings),
            totalRevenue: totalRevenueSum,
            totalRevenueGrowth: calcGrowth(currRevenue, prevRevenue),
        },
        charts: {
            bookingsOverview: bookingsOverviewChart,
            servicesByCategory: servicesByCategoryChart,
            revenueOverview: revenueOverviewChart,
            userGrowth: userGrowthChart,
        },
        topServices: topServicesList,
        providerVerification: {
            stats: {
                pending: pendingProfilesCount,
                verified: approvedProfilesCount,
                rejected: rejectedProfilesCount,
                suspended: 0,
            },
            pendingProviders: formattedPendingProviders,
        },
        platformSummary: {
            activeServices: totalServicesCount,
            activeProviders: approvedProfilesCount,
            completedBookings: totalBookingsCount,
            totalCustomers: totalUsersCount,
            averageRating: averageRating,
        },
    };
};

export const verifyProviderQuickService = async (providerProfileId: string, status: 'APPROVED' | 'REJECTED') => {
    const profile = await ProviderProfile.findByIdAndUpdate(
        providerProfileId,
        {
            verification_status: status,
            isApproved: status === 'APPROVED',
            is_active: status === 'APPROVED',
        },
        { new: true }
    ).populate('user_id', 'name email');

    if (!profile) {
        throw new Error('Provider profile not found');
    }

    return profile;
};
