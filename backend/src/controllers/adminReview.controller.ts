import { Request, Response } from 'express';
import * as adminReviewService from '../services/adminReview.service.js';


export const getAdminReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search ? String(req.query.search) : undefined;
        const rating = req.query.rating ? parseInt(req.query.rating as string) : undefined;
        const category = req.query.category ? String(req.query.category) : undefined;
        const providerId = req.query.providerId ? String(req.query.providerId) : undefined;
        const sortBy = req.query.sortBy as 'newest' | 'oldest' | 'rating_high' | 'rating_low' | undefined;

        const data = await adminReviewService.getAdminReviews({
            page,
            limit,
            search,
            rating,
            category,
            providerId,
            sortBy
        });

        res.status(200).json({
            success: true,
            data
        });
    } catch (error: any) {
        console.error('Error fetching admin reviews:', error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

export const deleteAdminReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { reviewId } = req.params;
        if (!reviewId) {
            res.status(400).json({ success: false, message: 'Review ID is required.' });
            return;
        }

        const result = await adminReviewService.deleteAdminReview(String(reviewId));

        res.status(200).json({
            success: true,
            message: 'Review removed successfully.',
            data: result
        });
    } catch (error: any) {
        console.error('Error deleting review (admin):', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to delete review.' });
    }
};
