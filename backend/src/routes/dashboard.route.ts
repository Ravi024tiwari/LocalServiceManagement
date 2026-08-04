import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { verifyJWT, authorizeRole } from '../middleware/auth.middleware.js';

const dashboardRouter = Router();

dashboardRouter.use(verifyJWT);


dashboardRouter.get('/customer', authorizeRole('CUSTOMER'), dashboardController.customerDashboard);

// Provider Dashboard: Revenue, pending jobs, profile status
dashboardRouter.get('/provider', authorizeRole('PROVIDER'), dashboardController.providerDashboard);

// Admin Dashboard: Platform metrics, pending approvals
dashboardRouter.get('/admin', authorizeRole('ADMIN'), dashboardController.adminDashboard);

export default dashboardRouter;