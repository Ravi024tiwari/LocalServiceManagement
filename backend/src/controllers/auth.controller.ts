import { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';

// Production-grade cookie security settings
const cookieOptions = {
    httpOnly: true, // Prevents JavaScript XSS attacks from reading the token
    secure: process.env.NODE_ENV === 'production', // Only sends cookie over HTTPS in production
    sameSite: 'strict' as const, // Protects against CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, phone, role } = req.body;
        const name = req.body.name || req.body.fullName;

        console.log("registration body", req.body);

        if (!name || !email || !password || !phone) {
            res.status(400).json({
                success: false,
                message: 'Name, email, password, and phone are required'
            });
            return;
        }

        const { user, token } = await authService.registerUser({ name, email, password, phone, role });

        res.status(201)
            .cookie('token', token, cookieOptions) // Set secure cookie
            .json({
                success: true,
                message: 'User registered successfully',
                data: user,
                token // Also sending in response body for mobile clients
            });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Registration failed',
        });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
            return;
        }

        const { user, token } = await authService.loginUser(email, password);

        res.status(200)
            .cookie('token', token, cookieOptions)
            .json({
                success: true,
                message: 'Logged in successfully',
                data: user,
                token
            });
    } catch (error: any) {
        res.status(401).json({
            success: false,
            message: error.message || 'Invalid credentials',
        });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        res.status(200)
            .clearCookie('token', cookieOptions) // Clears the auth cookie
            .json({
                success: true,
                message: 'Logged out successfully',
            });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
};