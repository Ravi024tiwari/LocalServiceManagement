import { Router } from 'express';
import * as providerController from '../controllers/providerProfile.controller.js';
import { verifyJWT, authorizeRole } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';

const ProviderProfileRouter = Router();

// A CUSTOMER hits this route to become a provider (supports up to 5 document uploads)
ProviderProfileRouter.post('/apply', verifyJWT, authorizeRole('CUSTOMER', 'PROVIDER'), upload.array('documents', 5), providerController.apply);

// Check current user's provider profile status (accessible by CUSTOMER, PROVIDER, and ADMIN)
ProviderProfileRouter.get('/me', verifyJWT, providerController.getMyProfile);

// An ADMIN hits this route to approve the provider profile
ProviderProfileRouter.patch('/:id/approve', verifyJWT, authorizeRole('ADMIN'), providerController.approveProvider);

ProviderProfileRouter.patch('/me', verifyJWT, authorizeRole('PROVIDER'), providerController.updateMyProfile);

export default ProviderProfileRouter;