import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { verifyJWT, authorizeRole } from '../middleware/auth.middleware.js';

const router = Router();

// ==========================================
// PUBLIC ROUTES (Anyone can view reviews)
// ==========================================

// Get all reviews & rating summary for a specific service
router.get('/service/:serviceId', reviewController.getForService);

// Get all reviews for a specific provider
router.get('/provider/:providerId', reviewController.getForProvider);

// ==========================================
// AUTHENTICATED ROUTES
// ==========================================
router.use(verifyJWT);

// Get logged-in user's review for a service
router.get('/service/:serviceId/user-review', reviewController.getUserReview);

// Upsert (create or update) review for a service
router.post('/', authorizeRole('CUSTOMER'), reviewController.upsert);

// Delete review (by review author or ADMIN)
router.delete('/:reviewId', reviewController.remove);

export default router;