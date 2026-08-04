import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { verifyJWT, authorizeRole } from '../middleware/auth.middleware.js';

const paymentRouter = Router();

paymentRouter.use(verifyJWT);

// Create Razorpay payment order
paymentRouter.post('/create-order', authorizeRole('CUSTOMER'), paymentController.createOrder);

// Verify Razorpay payment signature
paymentRouter.post('/verify-payment', authorizeRole('CUSTOMER'), paymentController.verifyPayment);

export default paymentRouter;