import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import {
    toggleLikeServiceService,
    getUserLikedServicesService,
    getLikedServiceStatsService,
} from '../services/likedService.service.js';

export const toggleLikeService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { serviceId } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        if (!serviceId) {
            res.status(400).json({ success: false, message: 'Service ID is required' });
            return;
        }

        const targetServiceId = Array.isArray(serviceId) ? serviceId[0] : serviceId;
        const result = await toggleLikeServiceService(userId, targetServiceId);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to toggle service like status',
        });
    }
};

export const getLikedServices = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const { lat, lng, radius } = req.query;
        const userLat = lat ? parseFloat(lat as string) : undefined;
        const userLng = lng ? parseFloat(lng as string) : undefined;
        const maxRadius = radius ? parseFloat(radius as string) : 20;

        const likedServices = await getUserLikedServicesService(userId, userLat, userLng, maxRadius);
        res.status(200).json({
            success: true,
            data: likedServices,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch liked services',
        });
    }
};

export const getLikedServiceStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const stats = await getLikedServiceStatsService(userId);
        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch liked service statistics',
        });
    }
};

export const checkLikedStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { serviceId } = req.params;

        if (!userId || !serviceId) {
            res.status(400).json({ success: false, message: 'Invalid request' });
            return;
        }

        const targetServiceId = Array.isArray(serviceId) ? serviceId[0] : serviceId;
        const likedServices = await getUserLikedServicesService(userId);
        const match = likedServices.find((item) => item.service_id === targetServiceId);

        res.status(200).json({
            success: true,
            data: {
                isLiked: !!match,
                distanceKm: match ? match.distanceKm : null,
                isWithinRange: match ? match.isWithinRange : true,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to check service status',
        });
    }
};
