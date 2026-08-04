import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage extends Document {
    booking_id: Types.ObjectId; // Context container for the job chat
    sender_id: Types.ObjectId;
    receiver_id: Types.ObjectId;
    message: string;
    is_read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        booking_id: {
            type: Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
            index: true
        },
        sender_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        receiver_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        is_read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Compound index to fetch chat history quickly sorted by time
messageSchema.index({ booking_id: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);