import { User, IUser } from '../models/User.model.js';

export const updateUserProfile = async (userId: string, updateData: Partial<IUser>) => {
    // We use $set to only update the provided fields without touching others
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true } // new: true returns the updated document
    ).select('-password'); // Always exclude the password from the returned document

    if (!updatedUser) {
        throw new Error('User not found.');
    }

    return updatedUser;
};