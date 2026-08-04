import { Router } from 'express';
import * as serviceController from '../controllers/service.controller.js';
import { verifyJWT, authorizeRole } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';

const serviceRouter = Router();
// ==========================================

// Search & filter services (Pagination, Sorting)

serviceRouter.get('/search', serviceController.search);

// Geospatial search (requires lng/lat in query)
serviceRouter.get('/nearby', serviceController.getNearby);

// ==========================================
// PROTECTED ROUTES (Requires Authentication)
// ==========================================

// Only PROVIDER and ADMIN can view their own created services
serviceRouter.get('/provider/my-services', verifyJWT, authorizeRole('PROVIDER', 'ADMIN'), serviceController.getMyServices);

// Only PROVIDER and ADMIN can view provider-specific stats
serviceRouter.get('/provider/stats', verifyJWT, authorizeRole('PROVIDER', 'ADMIN'), serviceController.getStats);

// Only PROVIDER and ADMIN can create a new service (up to 4 images)
serviceRouter.post('/create', verifyJWT, authorizeRole('PROVIDER', 'ADMIN'), upload.array('images', 4), serviceController.createService);

// Only PROVIDER and ADMIN can update an existing service (up to 4 images)
serviceRouter.put('/:id', verifyJWT, authorizeRole('PROVIDER', 'ADMIN'), upload.array('images', 4), serviceController.updateService);

// Only PROVIDER and ADMIN can activate/deactivate a service
serviceRouter.patch('/:id/status', verifyJWT, authorizeRole('PROVIDER', 'ADMIN'), serviceController.toggleStatus);

// Only PROVIDER and ADMIN can delete a service
serviceRouter.delete('/:id', verifyJWT, authorizeRole('PROVIDER', 'ADMIN'), serviceController.deleteService);

serviceRouter.get('/:id', serviceController.getServiceDetail);

export default serviceRouter;