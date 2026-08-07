import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IService extends Document {
    provider_id: Types.ObjectId;
    name: string;
    description: string;
    category: string;
    price: number;
    duration?: string;
    images: string[];
    service_location: {
        type: 'Point';
        coordinates: number[];
    };
    is_available: boolean;
    is_deleted: boolean;
    averageRating?: number;
    totalReviews?: number;
    createdAt: Date;
    updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
    {
        provider_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true,
            index: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        duration: {
            type: String,
            default: ''
        },
        images: {
            type: [String],
            default: [],
            validate: [
                (val: string[]) => val.length <= 4,
                'Service can have a maximum of 4 images'
            ]
        },

        service_location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            },
        },
        is_available: {
            type: Boolean,
            default: true
        },
        is_deleted: {
            type: Boolean,
            default: false
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalReviews: {
            type: Number,
            default: 0,
            min: 0
        },
    },
    { timestamps: true }
);


serviceSchema.index({ service_location: '2dsphere' });

export const Service = mongoose.model<IService>('Service', serviceSchema);