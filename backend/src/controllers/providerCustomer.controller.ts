import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import {
    getProviderCustomersService,
    getProviderCustomerDetailsService,
} from '../services/providerCustomer.service.js';

export const getProviderCustomers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const providerId = req.user?.id;
        if (!providerId) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const { page, limit, search, serviceCategory, timeRange } = req.query;

        const result = await getProviderCustomersService(providerId, {
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 10,
            search: search ? (search as string) : '',
            serviceCategory: serviceCategory ? (serviceCategory as string) : '',
            timeRange: timeRange ? (timeRange as string) : '',
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch provider customer list',
        });
    }
};

export const getProviderCustomerDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const providerId = req.user?.id;
        const customerId = req.params.customerId ? req.params.customerId.toString() : '';

        if (!providerId || !customerId) {
            res.status(400).json({ success: false, message: 'Invalid request parameters' });
            return;
        }

        const details = await getProviderCustomerDetailsService(providerId, customerId);
        res.status(200).json({
            success: true,
            data: details,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch customer booking history details',
        });
    }
};
