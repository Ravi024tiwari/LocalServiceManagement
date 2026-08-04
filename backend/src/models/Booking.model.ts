import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBooking extends Document {
    customer_id: Types.ObjectId;
    provider_id: Types.ObjectId;
    service_id: Types.ObjectId;
    status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    scheduled_date: Date;
    time_slot: string;
    booking_address: string;

    // Payment Details
    payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    razorpay_order_id?: string;
    razorpay_payment_id?: string;

    // Verification
    start_otp: string; // The 4-digit code generated for the customer

    createdAt: Date;
    updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
    {
        customer_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        provider_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        service_id: {
            type: Schema.Types.ObjectId,
            ref: 'Service',
            required: true
        },

        status: {
            type: String,
            enum: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
            default: 'PENDING',
        },

        scheduled_date: {
            type: Date,
            required: true
        },
        time_slot: {
            type: String,
            required: true
        },
        booking_address: {
            type: String,
            required: true
        },

        payment_status: {
            type: String,
            enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
            default: 'PENDING',
        },
        razorpay_order_id: {
            type: String
        },
        razorpay_payment_id: {
            type: String
        },

        start_otp: {
            type: String,
            required: true,
            select: false
        },
    },
    { timestamps: true }
);

// Index for fast conflict checking
bookingSchema.index({ provider_id: 1, scheduled_date: 1, time_slot: 1 });

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);