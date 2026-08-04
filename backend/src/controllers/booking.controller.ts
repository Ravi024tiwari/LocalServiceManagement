import { Request, Response } from 'express';
import * as bookingService from '../services/booking.service.js';

export const checkAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
        const customer_id = (req as any).user?.id;
        const { service_id, scheduled_date, time_slot } = req.body;

        if (!service_id || !scheduled_date || !time_slot) {
            res.status(400).json({ success: false, message: 'Service ID, date, and time slot are required.' });
            return;
        }

        const result = await bookingService.checkSlotAvailability(service_id, scheduled_date, time_slot, customer_id);
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const customer_id = (req as any).user.id;
        const { provider_id, service_id, scheduled_date, time_slot, booking_address } = req.body;

        if (!booking_address) {
            res.status(400).json({ success: false, message: 'Booking address is required.' });
            return;
        }

        const booking = await bookingService.createBooking({
            customer_id, provider_id, service_id, scheduled_date, time_slot, booking_address
        });

        res.status(201).json({ success: true, message: 'Booking confirmed', data: booking });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const userRole = (req as any).user.role; // Extract role from JWT middleware

        const booking = await bookingService.getBookingById(req.params.id.toString(), userId, userRole);
        res.status(200).json({ success: true, data: booking });
    } catch (error: any) {
        res.status(404).json({ success: false, message: error.message });
    }
};

export const startJob = async (req: Request, res: Response): Promise<void> => {
    try {
        const provider_id = (req as any).user.id;
        const { otp } = req.body;

        if (!otp) {
            res.status(400).json({ success: false, message: 'OTP is required to start the job.' });
            return;
        }

        const booking = await bookingService.verifyOtpAndStartJob(req.params.id.toString(), provider_id, otp);

        res.status(200).json({ success: true, message: 'Job started successfully!', data: booking });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Fetch all bookings for a logged-in customer
export const getCustomerBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const customer_id = (req as any).user.id;
        const { status } = req.query; // Optional filter: /bookings/customer?status=COMPLETED

        const bookings = await bookingService.getBookings(customer_id, 'customer', status as string);
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Fetch all received booking requests for a logged-in provider
export const getProviderBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const provider_id = (req as any).user.id;
        const { status } = req.query; // Optional filter

        const bookings = await bookingService.getBookings(provider_id, 'provider', status as string);
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Provider accepts or completes a booking
export const updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const provider_id = (req as any).user.id;
        const { status } = req.body;

        const booking = await bookingService.updateBookingStatus(req.params.id.toString(), provider_id, status as string);
        res.status(200).json({ success: true, message: `Booking marked as ${status}`, data: booking });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Cancel a booking (soft delete)
export const cancel = async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = (req as any).user.id;
        const { reason } = req.body;

        // we can add one cancellation reason so when customer cancel some booking it have to give some reason

        const booking = await bookingService.cancelBooking(req.params.id.toString(), user_id);
        res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

