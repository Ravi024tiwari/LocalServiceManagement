import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import {
    toggleLikeService,
    getLikedServices,
    getLikedServiceStats,
    checkLikedStatus,
} from '../controllers/likedService.controller.js';

const likedServiceRouter = Router();

// Protect all liked service routes with JWT verification
likedServiceRouter.use(verifyJWT);

likedServiceRouter.post('/toggle/:serviceId', toggleLikeService);
likedServiceRouter.get('/', getLikedServices);
likedServiceRouter.get('/stats', getLikedServiceStats);
likedServiceRouter.get('/check/:serviceId', checkLikedStatus);

export default likedServiceRouter;
