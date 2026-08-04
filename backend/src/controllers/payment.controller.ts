import { Request, Response } from 'express';
import * as paymentService from '../services/payment.service.js';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const customerId = (req as any).user.id;
        const { bookingId } = req.body;

        if (!bookingId) {
            res.status(400).json({ success: false, message: 'Booking ID is required.' });
            return;
        }

        const orderDetails = await paymentService.createRazorpayOrder(bookingId, customerId);
        res.status(200).json({ success: true, message: 'Razorpay order created successfully', data: orderDetails });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || 'Payment initialization failed.' });
    }
};

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const customerId = (req as any).user.id;
        const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!bookingId || !razorpay_order_id || !razorpay_payment_id) {
            res.status(400).json({ success: false, message: 'Missing payment verification parameters.' });
            return;
        }

        const updatedBooking = await paymentService.verifyRazorpayPayment(
            bookingId,
            customerId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature || 'mock_sig'
        );

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully and booking marked as COMPLETED.',
            data: updatedBooking
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || 'Payment verification failed.' });
    }
};