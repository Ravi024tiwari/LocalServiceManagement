import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import {
    getAdminBookingsService,
    getAdminBookingByIdService,
} from '../services/adminBooking.service.js';

export const getAdminBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const {
            page,
            limit,
            search,
            status,
            providerId,
            serviceId,
            startDate,
            endDate,
        } = req.query;

        const result = await getAdminBookingsService({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search: search ? String(search) : undefined,
            status: status ? String(status) : undefined,
            providerId: providerId ? String(providerId) : undefined,
            serviceId: serviceId ? String(serviceId) : undefined,
            startDate: startDate ? String(startDate) : undefined,
            endDate: endDate ? String(endDate) : undefined,
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch admin bookings',
        });
    }
};

export const getAdminBookingById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const booking = await getAdminBookingByIdService(id as string);

        res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message || 'Booking not found',
        });
    }
};
