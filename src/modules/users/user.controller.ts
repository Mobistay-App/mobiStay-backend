import { Request, Response } from 'express';
import { z } from 'zod';
import { UserService } from './user.service.js';
import { UpdateProfileSchema, OwnerDocumentsSchema, DriverDocumentsSchema } from './user.schema.js';

export class UserController {
    /**
     * Get current user's profile
     */
    static async getProfile(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }

            const user = await UserService.getProfile(req.user.userId);

            res.status(200).json({
                success: true,
                message: 'Profile retrieved successfully',
                data: user,
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    /**
     * Update user profile (Sprint 1.1)
     */
    static async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }

            const validatedData = UpdateProfileSchema.parse(req.body);
            const user = await UserService.updateProfile(req.user.userId, validatedData);

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: user,
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, errors: error.issues });
                return;
            }
            res.status(400).json({ success: false, message: error.message });
        }
    }

    /**
     * Submit verification documents (Sprint 1.2)
     * Automatically routes to Owner or Driver based on user role
     */
    static async submitDocuments(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }

            const { role, userId } = req.user;

            let result;

            if (role === 'OWNER') {
                const validatedData = OwnerDocumentsSchema.parse(req.body);
                result = await UserService.submitOwnerDocuments(userId, validatedData);
            } else if (role === 'DRIVER') {
                const validatedData = DriverDocumentsSchema.parse(req.body);
                result = await UserService.submitDriverDocuments(userId, validatedData);
            } else {
                res.status(403).json({
                    success: false,
                    message: 'Only OWNERs and DRIVERs can submit verification documents',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Documents submitted successfully. Your verification is now PENDING.',
                data: result,
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, errors: error.issues });
                return;
            }
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
