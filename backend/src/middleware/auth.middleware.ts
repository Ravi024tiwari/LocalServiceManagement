import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include our user payload
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const verifyJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
        // 1. Extract token from Cookie OR Authorization Header (Bearer token)
        let token;
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // 2. Check if token exists
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'You are not logged in. Please log in to get access.'
            });
            return;
        }

        // 3. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, role: string };

        // 4. Attach the user payload to the request object
        req.user = decoded;

        next(); // Move to the next middleware or controller
    } catch (error: any) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please log in again.'
        });
    }
};

export const authorizeRole = (...allowedRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        // Ensure verifyJWT has run first
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        // Check if the user's role is in the list of allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Role (${req.user.role}) is not allowed to access this resource.`
            });
            return;
        }

        next();
    };
};