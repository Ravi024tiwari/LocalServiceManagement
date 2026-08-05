import { Router } from 'express';
import { verifyJWT, authorizeRole } from '../middleware/auth.middleware.js';
import {
    getAdminBookings,
    getAdminBookingById,
} from '../controllers/adminBooking.controller.js';

const adminBookingRouter = Router();

// Protect for ADMIN role only
adminBookingRouter.use(verifyJWT, authorizeRole('ADMIN'));

adminBookingRouter.get('/', getAdminBookings);
adminBookingRouter.get('/:id', getAdminBookingById);

export default adminBookingRouter;
