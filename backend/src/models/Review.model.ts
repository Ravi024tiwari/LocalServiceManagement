import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReview extends Document {
    service_id: Types.ObjectId;
    booking_id?: Types.ObjectId;
    customer_id: Types.ObjectId;
    provider_id: Types.ObjectId;
    rating: number;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
    {
        service_id: {
            type: Schema.Types.ObjectId,
            ref: 'Service',
            required: true
        },
        booking_id: {
            type: Schema.Types.ObjectId,
            ref: 'Booking',
            required: false,
            default: null
        },
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
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: { type: String, trim: true, default: '' },
    },
    { timestamps: true }
);

// Unique index: 1 email / customer user account can only leave 1 review per service
reviewSchema.index({ service_id: 1, customer_id: 1 }, { unique: true });
reviewSchema.index({ provider_id: 1 });
reviewSchema.index({ service_id: 1 });

export const Review = mongoose.model<IReview>('Review', reviewSchema);