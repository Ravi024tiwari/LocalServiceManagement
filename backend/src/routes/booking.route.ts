import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { verifyJWT, authorizeRole } from '../middleware/auth.middleware.js';

const bookingRouter = Router();

bookingRouter.use(verifyJWT);

// ==========================================
// CUSTOMER ROUTES
// ==========================================

// Create a new booking request
bookingRouter.post('/', authorizeRole('CUSTOMER'), bookingController.create);

// Check slot & duplicate booking availability
bookingRouter.post('/check-availability', authorizeRole('CUSTOMER'), bookingController.checkAvailability);

// Get all bookings made by the customer (supports ?status= query)
bookingRouter.get('/customer', authorizeRole('CUSTOMER'), bookingController.getCustomerBookings);


// ==========================================
// PROVIDER ROUTES
// ==========================================

// Get all job requests received by the provider
bookingRouter.get('/provider', authorizeRole('PROVIDER'), bookingController.getProviderBookings);

// Provider submits the Customer's OTP to start the job (Changes status to IN_PROGRESS)
bookingRouter.post('/:id/start', authorizeRole('PROVIDER'), bookingController.startJob);

// Provider updates booking status (Only allowed: ACCEPTED, COMPLETED)
bookingRouter.patch('/:id/status', authorizeRole('PROVIDER'), bookingController.updateStatus);


// ==========================================
// SHARED ROUTES (Accessible by Customer & Provider)
// ==========================================

// Get detailed view of a single booking (OTP is revealed if user is Customer)
bookingRouter.get('/:id', bookingController.getDetails);

// Cancel a booking (Soft delete, requires a reason in req.body)
bookingRouter.patch('/:id/cancel', bookingController.cancel);

export default bookingRouter;