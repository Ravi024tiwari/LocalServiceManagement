import { Request, Response } from 'express';
import * as reviewService from '../services/review.service.js';

export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const customerId = (req as any).user.id;
        const { bookingId, rating, comment } = req.body;

        if (!bookingId || !rating) {
            res.status(400).json({ success: false, message: 'Booking ID and Rating are required.' });
            return;
        }

        if (rating < 1 || rating > 5) {
            res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
            return;
        }

        const review = await reviewService.createReview(customerId, bookingId, rating, comment);

        res.status(201).json({ success: true, message: 'Review submitted successfully', data: review });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getForService = async (req: Request, res: Response): Promise<void> => {
    try {
        const { serviceId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const data = await reviewService.getServiceReviews(serviceId.toString(), page, limit);

        res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getForProvider = async (req: Request, res: Response): Promise<void> => {
    try {
        const { providerId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const data = await reviewService.getProviderReviews(providerId.toString(), page, limit);

        res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};