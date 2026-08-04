import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { verifyJWT, authorizeRole } from '../middleware/auth.middleware.js';

const router = Router();

// ==========================================
// PUBLIC ROUTES (Anyone can view reviews)
// ==========================================

// Get all reviews for a specific service (with pagination)
router.get('/service/:serviceId', reviewController.getForService);

// Get all reviews for a specific provider (with pagination)
router.get('/provider/:providerId', reviewController.getForProvider);


router.use(verifyJWT);

router.post('/', authorizeRole('CUSTOMER'), reviewController.create);

export default router;