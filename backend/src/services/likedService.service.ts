import { LikedService } from '../models/LikedService.model.js';
import { Service } from '../models/Service.model.js';
import { User } from '../models/User.model.js';
import { ProviderProfile } from '../models/ProviderProfile.model.js';

// Haversine formula for calculating spherical distance between two coordinates in Kilometers
export const calculateDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Earth's radius in KM
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place (e.g. 0.8)
};

export interface LikedServicePopulatedItem {
    _id: string; // LikedService ID
    service_id: string;
    service: {
        _id: string;
        name: string;
        description: string;
        category: string;
        price: number;
        duration?: string;
        images: string[];
        is_available: boolean;
        service_location?: {
            type: 'Point';
            coordinates: number[]; // [lng, lat]
        };
        provider?: {
            _id: string;
            name: string;
            email: string;
            avatar?: string;
            rating?: number;
            experience_years?: number;
        };
    };
    likedAt: Date;
    distanceKm: number;
    isWithinRange: boolean;
}

export const toggleLikeServiceService = async (userId: string, serviceId: string) => {
    const existing = await LikedService.findOne({ user_id: userId, service_id: serviceId });
    if (existing) {
        await LikedService.deleteOne({ _id: existing._id });
        return { isLiked: false, message: 'Service removed from liked list' };
    } else {
        // Ensure service exists and is not deleted
        const service = await Service.findById(serviceId);
        if (!service || service.is_deleted) {
            throw new Error('Service not found or no longer available');
        }

        await LikedService.create({ user_id: userId, service_id: serviceId });
        return { isLiked: true, message: 'Service saved to your liked list' };
    }
};

export const getUserLikedServicesService = async (
    userId: string,
    userLat?: number,
    userLng?: number,
    maxAllowedRadiusKm: number = 20
) => {
    // Fetch user to get default coordinates if not passed explicitly
    let currentLat = userLat;
    let currentLng = userLng;

    if (currentLat === undefined || currentLng === undefined) {
        const user = await User.findById(userId);
        if (user && user.current_location && user.current_location.coordinates?.length === 2) {
            currentLng = user.current_location.coordinates[0];
            currentLat = user.current_location.coordinates[1];
        }
    }

    // Default coordinates if user coordinates are unavailable (e.g., Bilaspur default: 22.0797, 82.1409)
    if (!currentLat || !currentLng) {
        currentLat = 22.0797;
        currentLng = 82.1409;
    }

    const likedRecords = await LikedService.find({ user_id: userId })
        .populate({
            path: 'service_id',
            match: { is_deleted: { $ne: true } },
            populate: {
                path: 'provider_id',
                select: 'name email avatar phone',
            },
        })
        .sort({ createdAt: -1 });

    // Filter out null service_id (in case service was soft-deleted)
    const validLikedRecords = likedRecords.filter((rec) => rec.service_id !== null);

    // Fetch provider profiles for extra metrics like experience & rating
    const providerUserIds = validLikedRecords
        .map((rec: any) => rec.service_id?.provider_id?._id)
        .filter(Boolean);

    const providerProfiles = await ProviderProfile.find({
        user_id: { $in: providerUserIds },
    });

    const providerProfileMap = new Map<string, any>();
    providerProfiles.forEach((prof) => {
        providerProfileMap.set(prof.user_id.toString(), prof);
    });

    const items: LikedServicePopulatedItem[] = validLikedRecords.map((rec: any) => {
        const s = rec.service_id;
        const pUser = s.provider_id;
        const pProf = pUser ? providerProfileMap.get(pUser._id.toString()) : null;

        // Calculate distance
        let distanceKm = 0.5; // fallback
        if (s.service_location && s.service_location.coordinates?.length === 2) {
            const serviceLng = s.service_location.coordinates[0];
            const serviceLat = s.service_location.coordinates[1];
            distanceKm = calculateDistanceKm(currentLat!, currentLng!, serviceLat, serviceLng);
        }

        const isWithinRange = distanceKm <= maxAllowedRadiusKm && s.is_available;

        return {
            _id: rec._id.toString(),
            service_id: s._id.toString(),
            service: {
                _id: s._id.toString(),
                name: s.name,
                description: s.description,
                category: s.category,
                price: s.price,
                duration: s.duration,
                images: s.images || [],
                is_available: s.is_available,
                service_location: s.service_location,
                provider: pUser
                    ? {
                          _id: pUser._id.toString(),
                          name: pUser.name,
                          email: pUser.email,
                          avatar: pUser.avatar,
                          rating: pProf ? pProf.average_rating || 4.7 : 4.8,
                          experience_years: pProf ? pProf.experience_years || 5 : 5,
                      }
                    : undefined,
            },
            likedAt: rec.createdAt,
            distanceKm,
            isWithinRange,
        };
    });

    return items;
};

export const getLikedServiceStatsService = async (userId: string) => {
    const likedRecords = await getUserLikedServicesService(userId);

    const totalLiked = likedRecords.length;
    const categoriesSet = new Set(likedRecords.map((item) => item.service.category));
    const totalCategories = categoriesSet.size;

    let lastLikedText = 'No items';
    if (likedRecords.length > 0) {
        const latestDate = likedRecords[0].likedAt;
        const diffMs = Date.now() - new Date(latestDate).getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
            lastLikedText = 'Today';
        } else if (diffDays === 1) {
            lastLikedText = '1 Day ago';
        } else {
            lastLikedText = `${diffDays} Days ago`;
        }
    }

    // Estimate potential savings (e.g., 15% bundle discount when booking multiple liked services)
    const totalPriceSum = likedRecords.reduce((acc, item) => acc + (item.service.price || 0), 0);
    const potentialSavings = Math.round(totalPriceSum * 0.15);

    return {
        totalLiked,
        totalCategories,
        lastLikedText,
        potentialSavings,
    };
};
