import mongoose from 'mongoose';
import { Booking, IBooking } from '../models/Booking.model.js';
import { Service } from '../models/Service.model.js';
import { ProviderProfile } from '../models/ProviderProfile.model.js';

export const checkSlotAvailability = async (
    serviceId: string,
    scheduledDate: string | Date,
    timeSlot: string,
    customerId?: string
) => {
    const parsedDate = new Date(scheduledDate);
    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingSlotBooking = await Booking.findOne({
        service_id: serviceId,
        scheduled_date: { $gte: startOfDay, $lte: endOfDay },
        time_slot: timeSlot,
        status: { $nin: ['CANCELLED'] }
    });

    if (existingSlotBooking) {
        return {
            isAvailable: false,
            reason: 'SLOT_TAKEN',
            message: 'This slot is already booked for this service on this day.'
        };
    }

    if (customerId) {
        const existingCustomerBooking = await Booking.findOne({
            customer_id: customerId,
            service_id: serviceId,
            scheduled_date: { $gte: startOfDay, $lte: endOfDay },
            time_slot: timeSlot,
            status: { $nin: ['CANCELLED'] }
        });

        if (existingCustomerBooking) {
            return {
                isAvailable: false,
                reason: 'CUSTOMER_ALREADY_BOOKED',
                message: 'You have already booked this service for this slot.'
            };
        }
    }

    return { isAvailable: true, message: 'Slot is available' };
};

export const createBooking = async (bookingData: Partial<IBooking>) => {
    // Auto-populate provider_id from Service if missing
    if (!bookingData.provider_id && bookingData.service_id) {
        const service = await Service.findById(bookingData.service_id);
        if (service) {
            bookingData.provider_id = service.provider_id;
        }
    }

    // Conflict Check: Ensure provider/service isn't double-booked
    const availability = await checkSlotAvailability(
        bookingData.service_id?.toString() || '',
        bookingData.scheduled_date!,
        bookingData.time_slot!,
        bookingData.customer_id?.toString()
    );

    if (!availability.isAvailable) {
        throw new Error(availability.message);
    }

    // Generate a secure 4-digit OTP
    const start_otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Create the booking
    const newBooking = await Booking.create({
        ...bookingData,
        start_otp
    });

    return newBooking;
};


export const getBookingById = async (bookingId: string, userId: string, role: string) => {
    // If the user requesting is the CUSTOMER, we need to reveal the OTP so they can give it to the provider
    let query = Booking.findById(bookingId)
        .populate('service_id')
        .populate('customer_id', 'name phone avatar')
        .populate('provider_id', 'name phone avatar');

    if (role === 'CUSTOMER') {
        query = query.select('+start_otp');
    }

    const booking = await query.exec();

    if (!booking) throw new Error('Booking not found');
    return booking;
};

export const verifyOtpAndStartJob = async (bookingId: string, providerId: string, otp: string) => {
    // We explicitly select start_otp here to compare it
    const booking = await Booking.findOne({ _id: bookingId, provider_id: providerId }).select('+start_otp');

    if (!booking) {
        throw new Error('Booking not found or unauthorized.');
    }

    if (booking.status !== 'ACCEPTED') {
        throw new Error('Job must be ACCEPTED before it can be started.');
    }

    if (booking.start_otp !== otp) {
        throw new Error('Invalid OTP provided.');
    }

    // OTP matches! Update status to IN_PROGRESS
    booking.status = 'IN_PROGRESS';
    await booking.save();

    return booking;
};

// Fetch bookings dynamically based on whether the user is a Customer or Provider
export const getBookings = async (
    userId: string,
    roleType: 'customer' | 'provider',
    statusFilter?: string
) => {
    let query: any = {};

    if (roleType === 'customer') {
        query.customer_id = userId;
    } else {
        const objectId = new mongoose.Types.ObjectId(userId);
        const profile = await ProviderProfile.findOne({ user_id: userId });
        const possibleIds: any[] = [objectId, userId, userId.toString()];
        if (profile?._id) {
            possibleIds.push(profile._id);
            possibleIds.push(profile._id.toString());
        }

        const providerServices = await Service.find({
            provider_id: { $in: possibleIds },
            is_deleted: { $ne: true }
        }).select('_id');
        const providerServiceIds = providerServices.map((s) => s._id);

        query.$or = [
            { provider_id: { $in: possibleIds } },
            { service_id: { $in: providerServiceIds } }
        ];
    }

    // Apply status filter if provided (e.g., ?status=PENDING)
    if (statusFilter) {
        query.status = statusFilter.toUpperCase();
    }

    return await Booking.find(query)
        .populate('service_id', 'name title category price images') // Get service details
        .populate(
            roleType === 'customer' ? 'provider_id' : 'customer_id',
            'name email phone avatar'
        ) // If customer is fetching, show provider details, and vice versa
        .sort({ scheduled_date: 1 }); // Sort by upcoming dates first
};

// Provider updates the status (to ACCEPTED or COMPLETED)
export const updateBookingStatus = async (bookingId: string, providerId: string, newStatus: string) => {
    const validStatuses = ['ACCEPTED', 'COMPLETED'];

    // Prevent standard updates to IN_PROGRESS (must use OTP route) or CANCELLED (must use cancel route)
    if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status update via this method. Allowed: ${validStatuses.join(', ')}`);
    }

    // Ensure only the assigned provider can update the status
    const booking = await Booking.findOneAndUpdate(
        { _id: bookingId, provider_id: providerId, status: { $ne: 'CANCELLED' } },
        { status: newStatus },
        { new: true }
    );

    if (!booking) {
        throw new Error('Booking not found, is already cancelled, or you are unauthorized.');
    }

    return booking;
};

// Soft-delete: Cancel a booking with a reason
export const cancelBooking = async (bookingId: string, userId: string) => {
    // A booking can be cancelled by either the customer or the provider
    const booking = await Booking.findOne({
        _id: bookingId,
        $or: [{ customer_id: userId }, { provider_id: userId }]
    });

    if (!booking) {
        throw new Error('Booking not found or unauthorized');
    }

    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
        throw new Error(`Cannot cancel a booking that is already ${booking.status}.`);
    }

    booking.status = 'CANCELLED';
    await booking.save();

    return booking;
};