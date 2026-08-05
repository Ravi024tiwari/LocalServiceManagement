import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILikedService extends Document {
    user_id: Types.ObjectId;
    service_id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const likedServiceSchema = new Schema<ILikedService>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        service_id: {
            type: Schema.Types.ObjectId,
            ref: 'Service',
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

// Ensure a user can only like a specific service once
likedServiceSchema.index({ user_id: 1, service_id: 1 }, { unique: true });

export const LikedService = mongoose.model<ILikedService>('LikedService', likedServiceSchema);
