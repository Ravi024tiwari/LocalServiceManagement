import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
    avatar?: string;
    location?: string;
    bio?: string;
    current_location: {
        type: 'Point';
        coordinates: number[]; // [longitude, latitude]
    };
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            select: false
        }, // Excluded by default
        phone: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['CUSTOMER', 'PROVIDER', 'ADMIN'],
            default: 'CUSTOMER',
        },
        avatar: {
            type: String,
            default: ''
        },
        location: {
            type: String,
            default: ''
        },
        bio: {
            type: String,
            default: ''
        },
        // GeoJSON for geospatial queries
        current_location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                default: [0, 0], // Note: longitude comes first, then latitude in GeoJSON
            },
        },
    },
    { timestamps: true }
);

// Create a 2dsphere index for location-based queries
userSchema.index({ current_location: '2dsphere' });

export const User = mongoose.model<IUser>('User', userSchema);