import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import {
    getAdminDashboardService,
    verifyProviderQuickService,
} from '../services/adminDashboard.service.js';

export const getAdminDashboardMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const data = await getAdminDashboardService();
        res.status(200).json({
            success: true,
            data,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch admin dashboard analytics',
        });
    }
};

export const verifyProviderQuick = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { providerProfileId } = req.params;
        const { status } = req.body; // 'APPROVED' or 'REJECTED'

        if (!providerProfileId) {
            res.status(400).json({ success: false, message: 'Provider profile ID is required' });
            return;
        }

        const updatedProfile = await verifyProviderQuickService(
            providerProfileId as string,
            status === 'REJECTED' ? 'REJECTED' : 'APPROVED'
        );

        res.status(200).json({
            success: true,
            message: `Provider status updated to ${status || 'APPROVED'}`,
            data: updatedProfile,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update provider status',
        });
    }
};
