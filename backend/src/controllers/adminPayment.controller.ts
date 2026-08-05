import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import {
    getAdminPaymentStatsService,
    getAdminPaymentsService,
    getAdminPaymentByIdService,
} from '../services/adminPayment.service.js';

export const getAdminPaymentStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const stats = await getAdminPaymentStatsService();
        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch payment statistics',
        });
    }
};

export const getAdminPayments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const {
            page,
            limit,
            search,
            status,
            providerId,
            method,
            startDate,
            endDate,
            minAmount,
            maxAmount,
        } = req.query;

        const result = await getAdminPaymentsService({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search: search ? String(search) : undefined,
            status: status ? String(status) : undefined,
            providerId: providerId ? String(providerId) : undefined,
            method: method ? String(method) : undefined,
            startDate: startDate ? String(startDate) : undefined,
            endDate: endDate ? String(endDate) : undefined,
            minAmount: minAmount ? Number(minAmount) : undefined,
            maxAmount: maxAmount ? Number(maxAmount) : undefined,
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch admin payments',
        });
    }
};

export const getAdminPaymentById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const payment = await getAdminPaymentByIdService(id as string);

        res.status(200).json({
            success: true,
            data: payment,
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message || 'Payment not found',
        });
    }
};
