import mongoose, { Document, Schema, Types } from 'mongoose';

export interface INotification extends Document {
    recipient_id: Types.ObjectId; // User who receives the notification
    title: string;
    message: string;
    type: 'BOOKING' | 'PAYMENT' | 'VERIFICATION' | 'SYSTEM';
    is_read: boolean;
    related_id?: Types.ObjectId; // Optional pointer to a booking or service ID
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        recipient_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ['BOOKING', 'PAYMENT', 'VERIFICATION', 'SYSTEM'],
            required: true,
        },
        is_read: { type: Boolean, default: false },
        related_id: { type: Schema.Types.ObjectId },
    },
    { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);