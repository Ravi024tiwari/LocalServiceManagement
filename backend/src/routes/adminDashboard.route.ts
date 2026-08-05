import { Router } from 'express';
import { verifyJWT, authorizeRole } from '../middleware/auth.middleware.js';
import {
    getAdminDashboardMetrics,
    verifyProviderQuick,
} from '../controllers/adminDashboard.controller.js';

const adminDashboardRouter = Router();

// Protect all admin routes with JWT and ADMIN role check
adminDashboardRouter.use(verifyJWT, authorizeRole('ADMIN'));

adminDashboardRouter.get('/', getAdminDashboardMetrics);
adminDashboardRouter.patch('/verify-provider/:providerProfileId', verifyProviderQuick);

export default adminDashboardRouter;
