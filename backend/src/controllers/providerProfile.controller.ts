import { Request, Response } from 'express';
import * as providerLogic from '../services/providerProfile.service.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

export const apply = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { bio, experience_years } = req.body;
        let availability = req.body.availability;

        if (typeof availability === 'string') {
            try {
                availability = JSON.parse(availability);
            } catch {
                // fallback if parsing fails
            }
        }

        if (!bio || experience_years === undefined) {
            res.status(400).json({
                success: false,
                message: 'Bio and experience years are required.'
            });
            return;
        }

        const documentUrls: string[] = [];

        // 1. Process uploaded document files via Multer & Cloudinary
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const files = req.files as Express.Multer.File[];
            const uploadPromises = files.map(file => uploadOnCloudinary(file.buffer));
            const uploadResults = await Promise.all(uploadPromises);
            uploadResults.forEach(result => {
                if (result?.secure_url) {
                    documentUrls.push(result.secure_url);
                }
            });
        }

        // 2. Fallback or stringified body document URLs
        if (req.body.documents) {
            let bodyDocs: string[] = [];
            if (typeof req.body.documents === 'string') {
                try {
                    bodyDocs = JSON.parse(req.body.documents);
                } catch {
                    bodyDocs = [req.body.documents];
                }
            } else if (Array.isArray(req.body.documents)) {
                bodyDocs = req.body.documents;
            }
            documentUrls.push(...bodyDocs);
        }

        // Default document placeholder if none uploaded
        if (documentUrls.length === 0) {
            documentUrls.push('https://via.placeholder.com/600x400.png?text=Identity+Proof+Submitted');
        }

        const result = await providerLogic.applyForProvider(userId, {
            bio,
            experience_years: parseInt(experience_years.toString()),
            availability: Array.isArray(availability) ? availability : [],
            documents: documentUrls
        });

        const cookieOptions = {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };

        res.status(201)
            .cookie('token', result.token, cookieOptions)
            .json({
                success: true,
                message: 'Application submitted successfully. Your profile is under verification.',
                data: result.profile,
                token: result.token,
                user: result.user
            });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const profile = await providerLogic.getProviderProfileByUserId(userId);

        res.status(200).json({ success: true, data: profile });
    } catch (error: any) {
        res.status(404).json({ success: false, message: error.message });
    }
};

export const approveProvider = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // Provider Profile ID
        const { isApproved } = req.body; // Boolean sent by admin

        if (typeof isApproved !== 'boolean') {
            res.status(400).json({ success: false, message: 'isApproved must be a boolean' });
            return;
        }

        const profile = await providerLogic.updateApprovalStatus(id.toString(), isApproved);

        res.status(200).json({
            success: true,
            message: `Provider has been ${isApproved ? 'approved' : 'rejected/suspended'}.`,
            data: profile
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateMyProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;

        // Destructure only the fields we allow the provider to update safely.
        // (We intentionally exclude 'isApproved' or 'user_id' so they cannot hack their status)
        const { bio, experience_years, availability } = req.body;

        // Construct the update object dynamically based on what was sent
        const updateData: any = {};
        if (bio) updateData.bio = bio;
        if (experience_years !== undefined) updateData.experience_years = experience_years;
        if (availability) updateData.availability = availability;

        if (Object.keys(updateData).length === 0) {
            res.status(400).json({
                success: false,
                message: 'No valid fields provided for update.'
            });
            return;
        }

        const updatedProfile = await providerLogic.updateProviderProfile(userId, updateData);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedProfile
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};