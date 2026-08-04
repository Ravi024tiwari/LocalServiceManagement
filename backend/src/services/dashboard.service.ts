import mongoose from 'mongoose';
import { Booking } from '../models/Booking.model.js';
import { User } from '../models/User.model.js';
import { ProviderProfile } from '../models/ProviderProfile.model.js';
import { Service } from '../models/Service.model.js';

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
        .populate('service_id', 'title')
        .populate('provider_id', 'name');

    return {
        stats: stats[0] || { totalBookings: 0, completedBookings: 0, totalSpent: 0 },
        recentBookings
    };
};

export const getProviderDashboard = async (userId: string) => {
    const objectId = new mongoose.Types.ObjectId(userId);


    const profile = await ProviderProfile.findOne({ user_id: userId });
    const totalServices = await Service.countDocuments({ provider_id: userId });

    const stats = await Booking.aggregate([
        { $match: { provider_id: objectId } },
        {
            $group: {
                _id: null,
                totalJobsReceived: { $sum: 1 },
                pendingRequests: {
                    $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] }
                },
                completedJobs: {
                    $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
                },
                totalRevenue: {
                    $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, '$agreed_price', 0] }
                }
            }
        }
    ]);

    const upcomingJobs = await Booking.find({
        provider_id: userId,
        status: { $in: ['ACCEPTED', 'IN_PROGRESS'] }
    }).sort({ scheduled_date: 1 }).limit(5);

    return {
        profileStatus: {
            isApproved: profile?.isApproved || false,
            profileId: profile?._id
        },
        servicesCount: totalServices,
        stats: stats[0] || { totalJobsReceived: 0, pendingRequests: 0, completedJobs: 0, totalRevenue: 0 },
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