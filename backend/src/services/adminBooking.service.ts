import { Booking } from '../models/Booking.model.js';
import { User } from '../models/User.model.js';
import { Service } from '../models/Service.model.js';
import mongoose from 'mongoose';

export interface GetAdminBookingsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    providerId?: string;
    serviceId?: string;
    startDate?: string;
    endDate?: string;
}

export const getAdminBookingsService = async (params: GetAdminBookingsParams) => {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const skip = (page - 1) * limit;

    const query: any = {};

    // Filter by Status (if provided and not 'ALL')
    if (params.status && params.status.toUpperCase() !== 'ALL') {
        const normalizedStatus = params.status.toUpperCase();
        if (normalizedStatus === 'CONFIRMED') {
            query.status = 'ACCEPTED';
        } else {
            query.status = normalizedStatus;
        }
    }

    // Filter by Provider ID
    if (params.providerId && params.providerId !== 'ALL') {
        if (mongoose.Types.ObjectId.isValid(params.providerId)) {
            query.provider_id = new mongoose.Types.ObjectId(params.providerId);
        }
    }

    // Filter by Service ID
    if (params.serviceId && params.serviceId !== 'ALL') {
        if (mongoose.Types.ObjectId.isValid(params.serviceId)) {
            query.service_id = new mongoose.Types.ObjectId(params.serviceId);
        }
    }

    // Filter by Date Range
    if (params.startDate || params.endDate) {
        query.scheduled_date = {};
        if (params.startDate) {
            query.scheduled_date.$gte = new Date(params.startDate);
        }
        if (params.endDate) {
            const end = new Date(params.endDate);
            end.setHours(23, 59, 59, 999);
            query.scheduled_date.$lte = end;
        }
    }

    // If Search Query Provided: search by Booking ID or find matching Customer/Provider IDs
    if (params.search && params.search.trim() !== '') {
        const searchRegex = new RegExp(params.search.trim(), 'i');

        const matchingUsers = await User.find({
            $or: [
                { name: searchRegex },
                { email: searchRegex },
                { phone: searchRegex }
            ]
        }).select('_id');

        const matchingUserIds = matchingUsers.map(u => u._id);

        const matchingServices = await Service.find({
            title: searchRegex
        }).select('_id');

        const matchingServiceIds = matchingServices.map(s => s._id);

        let isObjectId = mongoose.Types.ObjectId.isValid(params.search.trim());

        query.$or = [
            { customer_id: { $in: matchingUserIds } },
            { provider_id: { $in: matchingUserIds } },
            { service_id: { $in: matchingServiceIds } },
        ];

        if (isObjectId) {
            query.$or.push({ _id: new mongoose.Types.ObjectId(params.search.trim()) });
        }
    }

    // Execute paginated query with populated references
    const [bookings, totalBookings] = await Promise.all([
        Booking.find(query)
            .populate('customer_id', 'name email phone avatar')
            .populate('provider_id', 'name email phone avatar')
            .populate('service_id', 'title category price thumbnail images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Booking.countDocuments(query)
    ]);

    // Calculate aggregated stats for top KPI metrics
    const statsAgg = await Booking.aggregate([
        {
            $facet: {
                total: [{ $count: 'count' }],
                pending: [{ $match: { status: 'PENDING' } }, { $count: 'count' }],
                confirmed: [{ $match: { status: 'ACCEPTED' } }, { $count: 'count' }],
                ongoing: [{ $match: { status: 'IN_PROGRESS' } }, { $count: 'count' }],
                completed: [{ $match: { status: 'COMPLETED' } }, { $count: 'count' }],
                cancelled: [{ $match: { status: 'CANCELLED' } }, { $count: 'count' }],
                revenueAgg: [
                    { $match: { status: 'COMPLETED', payment_status: 'PAID' } },
                    {
                        $lookup: {
                            from: 'services',
                            localField: 'service_id',
                            foreignField: '_id',
                            as: 'serviceDetails'
                        }
                    },
                    { $unwind: '$serviceDetails' },
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: '$serviceDetails.price' }
                        }
                    }
                ]
            }
        }
    ]);

    const facet = statsAgg[0] || {};
    const stats = {
        total: facet.total?.[0]?.count || 0,
        pending: facet.pending?.[0]?.count || 0,
        confirmed: facet.confirmed?.[0]?.count || 0,
        ongoing: facet.ongoing?.[0]?.count || 0,
        completed: facet.completed?.[0]?.count || 0,
        cancelled: facet.cancelled?.[0]?.count || 0,
        totalRevenue: facet.revenueAgg?.[0]?.totalRevenue || 0
    };

    const totalPages = Math.ceil(totalBookings / limit) || 1;

    return {
        bookings,
        pagination: {
            currentPage: page,
            totalPages,
            totalBookings,
            limit
        },
        stats
    };
};

export const getAdminBookingByIdService = async (bookingId: string) => {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        throw new Error('Invalid Booking ID format');
    }

    const booking = await Booking.findById(bookingId)
        .populate('customer_id', 'name email phone avatar')
        .populate('provider_id', 'name email phone avatar')
        .populate('service_id', 'title category price thumbnail images description')
        .select('+start_otp')
        .lean();

    if (!booking) {
        throw new Error('Booking not found');
    }

    return booking;
};
