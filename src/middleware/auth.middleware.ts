import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../shared/utils/token.js';
import { prisma } from '../shared/prisma.js';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: string;
                isVerified: boolean;
            };
        }
    }
}

/**
 * Middleware to authenticate requests using the JWT cookie.
 * Attaches user info to req.user if valid.
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.mobistay_token;

        if (!token) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const payload = await verifyJWT(token);

        if (!payload) {
            res.status(401).json({ success: false, message: 'Invalid or expired token' });
            return;
        }

        req.user = {
            userId: payload.userId as string,
            role: payload.role as string,
            isVerified: payload.isVerified as boolean,
        };

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(401).json({ success: false, message: 'Authentication failed' });
    }
};

/**
 * Middleware to require specific roles.
 * Must be used AFTER authenticate middleware.
 */
export const requireRole = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
            });
            return;
        }

        next();
    };
};

/**
 * Middleware to require verified account.
 * Must be used AFTER authenticate middleware.
 */
export const requireVerified = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
    }

    if (!req.user.isVerified) {
        res.status(403).json({
            success: false,
            message: 'Account verification required. Please verify your email first.'
        });
        return;
    }

    next();
};
