import { Request, Response } from 'express';
import * as adminCategoryService from '../services/adminCategory.service.js';

export const getAdminCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search ? String(req.query.search) : undefined;
        const status = req.query.status ? String(req.query.status) : undefined;
        const sortBy = req.query.sortBy as 'services_desc' | 'services_asc' | 'bookings_desc' | 'name_asc' | 'rating_desc' | undefined;

        const data = await adminCategoryService.getAdminCategories({
            page,
            limit,
            search,
            status,
            sortBy,
        });

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error: any) {
        console.error('Error fetching admin categories:', error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

export const getCategoryDetail = async (req: Request, res: Response): Promise<void> => {
    try {
        const categoryName = String(req.params.categoryName);
        if (!categoryName) {
            res.status(400).json({ success: false, message: 'Category name is required.' });
            return;
        }

        const data = await adminCategoryService.getCategoryServicesDetail(decodeURIComponent(categoryName));

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error: any) {
        console.error('Error fetching category details:', error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
