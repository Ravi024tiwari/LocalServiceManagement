import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITimeSlot {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    start_time: string; // 24-hour format e.g., "09:00"
    end_time: string;   // 24-hour format e.g., "18:00"
    is_closed: boolean; // Easy toggle for days off
}

export interface IProviderProfile extends Document {
    user_id: Types.ObjectId;
    verification_status: 'PENDING' | 'APPROVED' | 'REJECTED';
    documents: string[];
    bio?: string;
    experience_years: number;
    is_active: boolean;
    isApproved: boolean;
    average_rating: number;
    total_reviews: number;

    availability: ITimeSlot[];

    createdAt: Date;
    updatedAt: Date;
}

const timeSlotSchema = new Schema<ITimeSlot>({
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    start_time: { type: String, default: "09:00" },
    end_time: { type: String, default: "18:00" },
    is_closed: { type: Boolean, default: false }
}, { _id: false });

const providerProfileSchema = new Schema<IProviderProfile>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        verification_status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING',
        },
        documents: [{
            type: String,
            required: true
        }],
        bio: {
            type: String,
            trim: true
        },
        experience_years: {
            type: Number,
            default: 0
        },
        is_active: {
            type: Boolean,
            default: false
        },
        isApproved: {
            type: Boolean,
            default: false
        },
        average_rating: {
            type: Number,
            default: 0
        },
        total_reviews: {
            type: Number,
            default: 0
        },

        // Embed the availability schema here
        availability: [timeSlotSchema],
    },
    { timestamps: true }
);

export const ProviderProfile = mongoose.model<IProviderProfile>('ProviderProfile', providerProfileSchema);