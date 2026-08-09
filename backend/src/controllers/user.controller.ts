import { Request, Response } from 'express';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { updateUserProfile } from '../services/user.service.js';
import { User } from '../models/User.model.js';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id || (req as any).user?._id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            res.status(404).json({ success: false, message: 'User profile not found' });
            return;
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch user profile' });
    }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id || (req as any).user?._id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        // Extract basic text fields from the request body
        const { name, fullName, email, phone, location, avatar, bio, coordinates, longitude, latitude } = req.body;

        const updateData: any = {};

        // 1. Handle standard text fields
        const displayName = name || fullName;
        if (displayName) updateData.name = displayName;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (location !== undefined) updateData.location = location;
        if (bio !== undefined) updateData.bio = bio;

        // Handle GeoJSON coordinates [lng, lat]
        if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
            updateData.current_location = {
                type: 'Point',
                coordinates: [Number(coordinates[0]), Number(coordinates[1])]
            };
        } else if (longitude !== undefined && latitude !== undefined) {
            updateData.current_location = {
                type: 'Point',
                coordinates: [Number(longitude), Number(latitude)]
            };
        }
        
        // Never save blob: URLs from client browser preview into database
        if (avatar !== undefined && typeof avatar === 'string' && !avatar.startsWith('blob:')) {
            updateData.avatar = avatar;
        }

        // 2. Handle the Avatar Image file upload if present
        if (req.file) {
            try {
                const imageBuffer = req.file.buffer;
                const cloudinaryResponse = await uploadOnCloudinary(imageBuffer);
                if (cloudinaryResponse && cloudinaryResponse.secure_url) {
                    updateData.avatar = cloudinaryResponse.secure_url;
                } else {
                    // Fallback to Base64 Data URI if Cloudinary is not configured or fails
                    const mimeType = req.file.mimetype || 'image/png';
                    const base64Data = imageBuffer.toString('base64');
                    updateData.avatar = `data:${mimeType};base64,${base64Data}`;
                }
            } catch (err) {
                console.error("Cloudinary upload warning, using base64 fallback:", err);
                const mimeType = req.file.mimetype || 'image/png';
                const base64Data = req.file.buffer.toString('base64');
                updateData.avatar = `data:${mimeType};base64,${base64Data}`;
            }
        }

        // 3. Ensure there is actually something to update
        if (Object.keys(updateData).length === 0) {
            res.status(400).json({
                success: false,
                message: 'No fields provided to update.'
            });
            return;
        }

        // 4. Update the database
        const updatedUser = await updateUserProfile(userId, updateData);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });

    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || 'Failed to update profile' });
    }
};

export const updateOnlineStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id || (req as any).user?._id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const { isOnline } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isOnline: Boolean(isOnline) },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: `User is now ${isOnline ? 'Online' : 'Offline'}`,
            data: updatedUser
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Failed to update online status' });
    }
};