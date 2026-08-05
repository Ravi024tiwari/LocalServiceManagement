import { Router } from 'express';
import { verifyJWT, authorizeRole } from '../middleware/auth.middleware.js';
import {
    getAdminPaymentStats,
    getAdminPayments,
    getAdminPaymentById,
} from '../controllers/adminPayment.controller.js';

const adminPaymentRouter = Router();

// Protect for ADMIN role only
adminPaymentRouter.use(verifyJWT, authorizeRole('ADMIN'));

adminPaymentRouter.get('/stats', getAdminPaymentStats);
adminPaymentRouter.get('/', getAdminPayments);
adminPaymentRouter.get('/:id', getAdminPaymentById);

export default adminPaymentRouter;
