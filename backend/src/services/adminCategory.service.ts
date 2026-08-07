import mongoose from 'mongoose';
import { Service } from '../models/Service.model.js';
import { Booking } from '../models/Booking.model.js';

export interface GetAdminCategoriesParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string; // 'ALL' | 'Active' | 'Inactive'
    sortBy?: 'services_desc' | 'services_asc' | 'bookings_desc' | 'name_asc' | 'rating_desc';
}

export const getAdminCategories = async (params: GetAdminCategoriesParams) => {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 10);
    const skip = (page - 1) * limit;

    // 1. Core Aggregation Pipeline on Services grouped by Category
    const pipeline: any[] = [
        {
            $match: {
                is_deleted: { $ne: true }
            }
        },
        {
            $group: {
                _id: '$category',
                serviceCount: { $sum: 1 },
                activeServicesCount: {
                    $sum: { $cond: [{ $eq: ['$is_available', true] }, 1, 0] }
                },
                serviceIds: { $push: '$_id' },
                rawAvgRating: { $avg: '$averageRating' },
                totalReviews: { $sum: '$totalReviews' }
            }
        },
        {
            $lookup: {
                from: 'bookings',
                localField: 'serviceIds',
                foreignField: 'service_id',
                as: 'bookings'
            }
        },
        {
            $addFields: {
                category: '$_id',
                bookingCount: { $size: '$bookings' },
                status: {
                    $cond: [{ $gt: ['$activeServicesCount', 0] }, 'Active', 'Inactive']
                },
                averageRating: {
                    $cond: [
                        { $gt: ['$rawAvgRating', 0] },
                        { $round: ['$rawAvgRating', 1] },
                        0
                    ]
                }
            }
        }
    ];

    // 2. Filter by search query (matching category name)
    if (params.search && params.search.trim() !== '') {
        const searchRegex = new RegExp(params.search.trim(), 'i');
        pipeline.push({
            $match: {
                category: searchRegex
            }
        });
    }

    // 3. Filter by Status (Active / Inactive)
    if (params.status && params.status !== 'ALL') {
        pipeline.push({
            $match: {
                status: params.status
            }
        });
    }

    // 4. Sorting logic
    let sortStage: any = { bookingCount: -1, serviceCount: -1 };
    if (params.sortBy === 'services_desc') {
        sortStage = { serviceCount: -1, category: 1 };
    } else if (params.sortBy === 'services_asc') {
        sortStage = { serviceCount: 1, category: 1 };
    } else if (params.sortBy === 'name_asc') {
        sortStage = { category: 1 };
    } else if (params.sortBy === 'rating_desc') {
        sortStage = { averageRating: -1, bookingCount: -1 };
    }
    pipeline.push({ $sort: sortStage });

    // 5. Run aggregation with $facet for data & pagination count
    const [allCategoriesResult, facetResult] = await Promise.all([
        // Global aggregate across all categories for Top KPIs
        Service.aggregate([
            { $match: { is_deleted: { $ne: true } } },
            {
                $group: {
                    _id: '$category',
                    serviceCount: { $sum: 1 },
                    activeServicesCount: {
                        $sum: { $cond: [{ $eq: ['$is_available', true] }, 1, 0] }
                    },
                    serviceIds: { $push: '$_id' },
                    avgRating: { $avg: '$averageRating' }
                }
            },
            {
                $lookup: {
                    from: 'bookings',
                    localField: 'serviceIds',
                    foreignField: 'service_id',
                    as: 'bookings'
                }
            },
            {
                $project: {
                    category: '$_id',
                    serviceCount: 1,
                    activeServicesCount: 1,
                    bookingCount: { $size: '$bookings' },
                    avgRating: 1
                }
            }
        ]),
        Service.aggregate([
            ...pipeline,
            {
                $facet: {
                    categories: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 0,
                                category: 1,
                                serviceCount: 1,
                                activeServicesCount: 1,
                                bookingCount: 1,
                                status: 1,
                                averageRating: 1,
                                totalReviews: 1
                            }
                        }
                    ],
                    totalCount: [{ $count: 'count' }]
                }
            }
        ])
    ]);

    // Calculate Global KPIs
    const totalCategories = allCategoriesResult.length;
    const activeCategories = allCategoriesResult.filter((c) => c.activeServicesCount > 0).length;
    const totalServices = allCategoriesResult.reduce((acc, c) => acc + c.serviceCount, 0);
    const totalBookings = allCategoriesResult.reduce((acc, c) => acc + c.bookingCount, 0);
    
    const validRatings = allCategoriesResult.filter((c) => c.avgRating > 0);
    const averageRating = validRatings.length > 0
        ? Number((validRatings.reduce((acc, c) => acc + c.avgRating, 0) / validRatings.length).toFixed(1))
        : 0;

    // Format top categories by bookings for the highlights card
    const topCategories = [...allCategoriesResult]
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .slice(0, 5)
        .map((c) => ({
            category: c.category,
            serviceCount: c.serviceCount,
            bookingCount: c.bookingCount,
        }));

    const categoriesData = facetResult[0]?.categories || [];
    const totalCount = facetResult[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
        kpis: {
            totalCategories,
            activeCategories,
            totalServices,
            totalBookings,
            averageRating,
        },
        topCategories,
        categories: categoriesData,
        pagination: {
            total: totalCount,
            page,
            limit,
            totalPages,
        }
    };
};

export const getCategoryServicesDetail = async (categoryName: string) => {
    const services = await Service.find({
        category: { $regex: new RegExp(`^${categoryName}$`, 'i') },
        is_deleted: { $ne: true }
    })
        .populate('provider_id', 'name email avatar')
        .sort({ averageRating: -1, createdAt: -1 });

    const totalServices = services.length;
    const activeServices = services.filter((s) => s.is_available).length;
    
    // Fetch total bookings for all services in this category
    const serviceIds = services.map((s) => s._id);
    const bookingCount = await Booking.countDocuments({ service_id: { $in: serviceIds } });

    return {
        category: categoryName,
        totalServices,
        activeServices,
        bookingCount,
        services,
    };
};
