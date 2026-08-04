import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service.js';

export const customerDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const data = await dashboardService.getCustomerDashboard(userId);

        res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const providerDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const data = await dashboardService.getProviderDashboard(userId);

        res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const adminDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await dashboardService.getAdminDashboard();

        res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};