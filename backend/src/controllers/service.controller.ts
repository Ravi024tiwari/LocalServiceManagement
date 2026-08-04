import { Request, Response } from 'express';
import * as serviceLogic from '../services/service.service.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

export const createService = async (req: Request, res: Response): Promise<void> => {
    try {
        const providerId = (req as any).user.id;
        const imageUrls: string[] = [];

        // 1. Process uploaded file buffers via Multer
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const files = req.files as Express.Multer.File[];
            if (files.length > 4) {
                res.status(400).json({ success: false, message: 'Maximum 4 images allowed per service' });
                return;
            }

            const uploadPromises = files.map(file => uploadOnCloudinary(file.buffer));
            const uploadResults = await Promise.all(uploadPromises);
            uploadResults.forEach(result => {
                if (result?.secure_url) {
                    imageUrls.push(result.secure_url);
                }
            });
        }

        // 2. Handle stringified array or body image URLs
        if (req.body.images) {
            let bodyImages: string[] = [];
            if (typeof req.body.images === 'string') {
                try {
                    bodyImages = JSON.parse(req.body.images);
                } catch {
                    bodyImages = [req.body.images];
                }
            } else if (Array.isArray(req.body.images)) {
                bodyImages = req.body.images;
            }
            imageUrls.push(...bodyImages);
        }

        // 3. Enforce maximum 4 images
        const finalImages = imageUrls.slice(0, 4);

        // 4. Parse service_location if sent as stringified JSON in FormData
        let serviceLocation = req.body.service_location;
        if (typeof serviceLocation === 'string') {
            try {
                serviceLocation = JSON.parse(serviceLocation);
            } catch (err) {
                // Keep as is if parsing fails
            }
        }

        const serviceData = {
            ...req.body,
            provider_id: providerId,
            images: finalImages,
            ...(serviceLocation && { service_location: serviceLocation })
        };

        const service = await serviceLogic.createService(serviceData);
        res.status(201).json({ success: true, data: service });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
    try {
        const providerId = (req as any).user.id;
        const serviceId = req.params.id.toString();
        const imageUrls: string[] = [];

        // 1. Process uploaded file buffers via Multer
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const files = req.files as Express.Multer.File[];
            if (files.length > 4) {
                res.status(400).json({ success: false, message: 'Maximum 4 images allowed per service' });
                return;
            }

            const uploadPromises = files.map(file => uploadOnCloudinary(file.buffer));
            const uploadResults = await Promise.all(uploadPromises);
            uploadResults.forEach(result => {
                if (result?.secure_url) {
                    imageUrls.push(result.secure_url);
                }
            });
        }

        // 2. Handle stringified array or body image URLs
        if (req.body.images) {
            let bodyImages: string[] = [];
            if (typeof req.body.images === 'string') {
                try {
                    bodyImages = JSON.parse(req.body.images);
                } catch {
                    bodyImages = [req.body.images];
                }
            } else if (Array.isArray(req.body.images)) {
                bodyImages = req.body.images;
            }
            imageUrls.push(...bodyImages);
        }

        // Parse service_location if sent as stringified JSON in FormData
        let serviceLocation = req.body.service_location;
        if (typeof serviceLocation === 'string') {
            try {
                serviceLocation = JSON.parse(serviceLocation);
            } catch (err) {
                // Keep as is
            }
        }

        const updateData: any = {
            ...req.body,
            ...(imageUrls.length > 0 && { images: imageUrls.slice(0, 4) }),
            ...(serviceLocation && { service_location: serviceLocation })
        };

        const updatedService = await serviceLogic.updateService(serviceId, providerId, updateData);
        if (!updatedService) {
            res.status(404).json({ success: false, message: 'Service not found or unauthorized' });
            return;
        }

        res.status(200).json({ success: true, data: updatedService });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getNearby = async (req: Request, res: Response): Promise<void> => {
    try {
        const { lng, lat, distance } = req.query;
        if (!lng || !lat) {
            res.status(400).json({ success: false, message: 'Longitude and latitude are required' });
            return;
        }

        const services = await serviceLogic.getNearbyServices(
            parseFloat(lng as string),
            parseFloat(lat as string),
            distance ? parseFloat(distance as string) : 10
        );

        res.status(200).json({ success: true, count: services.length, data: services });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Geospatial search failed' });
    }
};

export const search = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = '1', limit = '10', category, sortBy, sortOrder } = req.query;

        // Build dynamic filters
        const filters: any = {};
        if (category) filters.category = category;

        // Build dynamic sorting
        const sortConfig: any = {};
        if (sortBy) {
            sortConfig[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sortConfig.createdAt = -1; // Default sort
        }

        const result = await serviceLogic.searchServices(
            filters,
            parseInt(page as string),
            parseInt(limit as string),
            sortConfig
        );

        res.status(200).json({ success: true, ...result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Search failed' });
    }
};

export const getServiceDetail = async (req: Request, res: Response): Promise<void> => {
    try {
        const service = await serviceLogic.getServiceById(req.params.id.toString());
        if (!service) {
            res.status(404).json({ success: false, message: 'Service not found' });
            return;
        }
        res.status(200).json({ success: true, data: service });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch service' });
    }
};

export const toggleStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const providerId = (req as any).user.id;
        const { isActive } = req.body;

        const service = await serviceLogic.toggleServiceStatus(req.params.id.toString(), providerId, isActive);
        if (!service) {
            res.status(404).json({ success: false, message: 'Service not found or unauthorized' });
            return;
        }

        res.status(200).json({ success: true, message: `Service ${isActive ? 'activated' : 'deactivated'}`, data: service });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
};

export const getStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const providerId = (req as any).user.id;
        const stats = await serviceLogic.getServiceStats(providerId);
        res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
};

export const getMyServices = async (req: Request, res: Response): Promise<void> => {
    try {
        const providerId = (req as any).user.id;
        const { category, is_available } = req.query;

        const filters: any = {};
        if (category && category !== 'All Categories') filters.category = category;
        if (is_available !== undefined) filters.is_available = is_available === 'true';

        const result = await serviceLogic.getServicesByProviderId(providerId, filters);
        res.status(200).json({ success: true, ...result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch provider services' });
    }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
    try {
        const providerId = (req as any).user.id;
        const serviceId = req.params.id.toString();

        const deleted = await serviceLogic.deleteServiceById(serviceId, providerId);
        if (!deleted) {
            res.status(404).json({ success: false, message: 'Service not found or unauthorized' });
            return;
        }

        res.status(200).json({ success: true, message: 'Service deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to delete service' });
    }
};