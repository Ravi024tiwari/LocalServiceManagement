import mongoose from 'mongoose';
import { Service, IService } from '../models/Service.model.js';



export const createService = async (serviceData: Partial<IService>): Promise<IService> => {
    return await Service.create(serviceData);
};


export const getServiceById = async (serviceId: string): Promise<IService | null> => {
    return await Service.findById(serviceId).populate('provider_id', 'name email phone');
};

export const getServicesByProviderId = async (providerId: string, extraFilters: any = {}) => {
    const query = { provider_id: providerId, is_deleted: { $ne: true }, ...extraFilters };
    const services = await Service.find(query).sort({ createdAt: -1 });

    const total = services.length;
    const active = services.filter((s) => s.is_available).length;
    const inactive = total - active;
    const draft = 0; // Available for future draft states

    return {
        services,
        stats: {
            totalServices: total,
            activeServices: active,
            inactiveServices: inactive,
            draftServices: draft,
        }
    };
};

export const deleteServiceById = async (serviceId: string, providerId: string) => {
    return await Service.findOneAndUpdate(
        { _id: serviceId, provider_id: providerId },
        { is_deleted: true },
        { new: true }
    );
};



export const updateService = async (serviceId: string, providerId: string, updateData: Partial<IService>) => {
    // Ensure the provider only updates their own service
    return await Service.findOneAndUpdate(
        { _id: serviceId, provider_id: providerId },
        updateData,
        { new: true, runValidators: true }
    );
};

export const toggleServiceStatus = async (serviceId: string, providerId: string, isActive: boolean) => {
    // Soft Delete / Status Toggle
    return await Service.findOneAndUpdate(
        { _id: serviceId, provider_id: providerId },
        { isActive },
        { new: true }
    );
};

// --- ADVANCED APIs ---

export const getNearbyServices = async (longitude: number, latitude: number, maxDistanceKm: number = 20) => {
    try {
        const nearby = await Service.find({
            is_available: true,
            is_deleted: { $ne: true },
            service_location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: maxDistanceKm * 1000,
                },
            },
        }).populate('provider_id', 'name email phone rating');

        if (nearby && nearby.length > 0) {
            return nearby;
        }

        // Fallback: return active services if geospatial index returns 0 results
        return await Service.find({ is_available: true, is_deleted: { $ne: true } }).populate('provider_id', 'name email phone rating');
    } catch {
        return await Service.find({ is_available: true, is_deleted: { $ne: true } }).populate('provider_id', 'name email phone rating');
    }
};

export const searchServices = async (filters: any, page: number = 1, limit: number = 10, sortConfig: any) => {
    const skip = (page - 1) * limit;

    // Enforce active services only for customer searches
    const query = { ...filters, isActive: true };

    const services = await Service.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(limit)
        .populate('provider_id', 'name rating');

    const total = await Service.countDocuments(query);

    return {
        services,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalResults: total
    };
};

export const getServiceStats = async (providerId: string) => {
    // Aggregation pipeline to get business metrics for a provider
    const stats = await Service.aggregate([
        { $match: { provider_id: new mongoose.Types.ObjectId(providerId) } },
        {
            $group: {
                _id: null,
                totalServices: { $sum: 1 },
                activeServices: { $sum: { $cond: ["$isActive", 1, 0] } },
                averageBasePrice: { $avg: "$base_price" }
            }
        }
    ]);
    return stats[0] || { totalServices: 0, activeServices: 0, averageBasePrice: 0 };
};