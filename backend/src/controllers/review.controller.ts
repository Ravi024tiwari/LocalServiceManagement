import { Request, Response } from 'express';
import * as reviewService from '../services/review.service.js';

export const upsert = async (req: Request, res: Response): Promise<void> => {
    try {
        const customerId = (req as any).user.id;
        const { serviceId, rating, comment, bookingId } = req.body;

        if (!serviceId || !rating) {
            res.status(400).json({ success: false, message: 'Service ID and Rating are required.' });
            return;
        }

        const numericRating = Number(rating);
        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5.' });
            return;
        }

        const result = await reviewService.upsertServiceReview(
            String(customerId),
            String(serviceId),
            numericRating,
            comment,
            bookingId ? String(bookingId) : undefined
        );

        res.status(result.isNew ? 201 : 200).json({
            success: true,
            message: result.isNew ? 'Review submitted successfully.' : 'Review updated successfully.',
            data: result.review,
            summary: result.summary
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getUserReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const customerId = (req as any).user.id;
        const serviceId = String(req.params.serviceId);

        const review = await reviewService.getUserReviewForService(String(customerId), serviceId);

        res.status(200).json({ success: true, data: review });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getForService = async (req: Request, res: Response): Promise<void> => {
    try {
        const serviceId = String(req.params.serviceId);
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const star = req.query.star ? parseInt(req.query.star as string) : undefined;

        const data = await reviewService.getServiceReviews(serviceId, page, limit, star);

        res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getForProvider = async (req: Request, res: Response): Promise<void> => {
    try {
        const providerId = String(req.params.providerId);
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const data = await reviewService.getProviderReviews(providerId, page, limit);

        res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const userRole = (req as any).user.role;
        const reviewId = String(req.params.reviewId);

        const result = await reviewService.deleteReview(reviewId, String(userId), String(userRole));

        res.status(200).json({ success: true, message: 'Review removed successfully.', data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};