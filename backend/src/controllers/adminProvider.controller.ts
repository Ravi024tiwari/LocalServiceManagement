import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import {
    getAdminProvidersService,
    updateProviderVerificationService,
} from '../services/adminProvider.service.js';

export const getAdminProviders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { page, limit, search, status, category } = req.query;

        const result = await getAdminProvidersService({
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 10,
            search: search ? (search as string) : '',
            status: status ? (status as string) : 'ALL',
            category: category ? (category as string) : '',
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch provider list for verification',
        });
    }
};

export const updateProviderVerification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { providerProfileId } = req.params;
        const { status } = req.body; // 'APPROVED' | 'REJECTED' | 'PENDING'

        if (!providerProfileId || !status) {
            res.status(400).json({ success: false, message: 'Provider profile ID and status are required' });
            return;
        }

        const validStatus = (status as string).toUpperCase() as 'APPROVED' | 'REJECTED' | 'PENDING';
        const updated = await updateProviderVerificationService(providerProfileId as string, validStatus);

        res.status(200).json({
            success: true,
            message: `Provider verification status updated to ${validStatus}`,
            data: updated,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update provider status',
        });
    }
};
