import { ProviderProfile, IProviderProfile } from '../models/ProviderProfile.model.js';
import { User } from '../models/User.model.js';
import jwt from 'jsonwebtoken';

export const applyForProvider = async (userId: string, profileData: Partial<IProviderProfile>) => {
    // 1. Check if the user already has a provider profile
    const existingProfile = await ProviderProfile.findOne({ user_id: userId });
    if (existingProfile) {
        // If profile exists (e.g. auto-created during PROVIDER registration), update documents & bio
        const updatedProfile = await ProviderProfile.findOneAndUpdate(
            { user_id: userId },
            { $set: profileData },
            { new: true, runValidators: true }
        );

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { role: 'PROVIDER' },
            { new: true }
        ).select('-password');

        const newToken = jwt.sign(
            { id: userId, role: 'PROVIDER' },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        return {
            profile: updatedProfile,
            token: newToken,
            user: updatedUser
        };
    }

    // 2. Create the Provider Profile (isApproved defaults to false)
    const newProfile = await ProviderProfile.create({
        ...profileData,
        user_id: userId,
        isApproved: false,
    });

    // 3. Upgrade the User's role from CUSTOMER to PROVIDER
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role: 'PROVIDER' },
        { new: true }
    ).select('-password');

    // 4. Re-issue JWT Token with new role PROVIDER
    const newToken = jwt.sign(
        { id: userId, role: 'PROVIDER' },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );

    return {
        profile: newProfile,
        token: newToken,
        user: updatedUser
    };
};

export const getProviderProfileByUserId = async (userId: string) => {
    return await ProviderProfile.findOne({ user_id: userId }).populate('user_id', 'name email phone');
};

export const updateApprovalStatus = async (profileId: string, isApproved: boolean) => {
    // Admin only operation
    const updatedProfile = await ProviderProfile.findByIdAndUpdate(
        profileId,
        { isApproved },
        { new: true }
    );

    if (!updatedProfile) {
        throw new Error('Provider profile not found');
    }

    return updatedProfile;
};

export const updateProviderProfile = async (userId: string, updateData: Partial<IProviderProfile>) => {
    // We search by user_id to ensure the provider can only update their own profile
    const updatedProfile = await ProviderProfile.findOneAndUpdate(
        { user_id: userId },
        { $set: updateData },
        { new: true, runValidators: true } // Return updated doc & run schema validations
    );

    if (!updatedProfile) {
        throw new Error('Provider profile not found. Please apply first.');
    }

    return updatedProfile;
};