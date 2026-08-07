import { Router } from 'express';
import { verifyJWT, authorizeRole } from '../middleware/auth.middleware.js';
import {
    getAdminReviews,
    deleteAdminReview
} from '../controllers/adminReview.controller.js';

const adminReviewRouter = Router();

// Protect all admin review routes for ADMIN role only
adminReviewRouter.use(verifyJWT, authorizeRole('ADMIN'));

adminReviewRouter.get('/', getAdminReviews);
adminReviewRouter.delete('/:reviewId', deleteAdminReview);

export default adminReviewRouter;
