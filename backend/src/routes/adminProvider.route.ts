import { Router } from 'express';
import { verifyJWT, authorizeRole } from '../middleware/auth.middleware.js';
import {
    getAdminProviders,
    updateProviderVerification,
} from '../controllers/adminProvider.controller.js';

const adminProviderRouter = Router();

// Protect for ADMIN role only
adminProviderRouter.use(verifyJWT, authorizeRole('ADMIN'));

adminProviderRouter.get('/', getAdminProviders);
adminProviderRouter.patch('/:providerProfileId/status', updateProviderVerification);

export default adminProviderRouter;
