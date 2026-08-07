import { Router } from 'express';
import { verifyJWT, authorizeRole } from '../middleware/auth.middleware.js';
import {
    getAdminCategories,
    getCategoryDetail,
} from '../controllers/adminCategory.controller.js';

const adminCategoryRouter = Router();

// Protect all admin category routes for ADMIN role only
adminCategoryRouter.use(verifyJWT, authorizeRole('ADMIN'));

adminCategoryRouter.get('/', getAdminCategories);
adminCategoryRouter.get('/:categoryName', getCategoryDetail);

export default adminCategoryRouter;
