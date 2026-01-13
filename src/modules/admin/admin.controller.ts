import { Request, Response } from 'express';
import { z } from 'zod';
import { AdminService } from './admin.service.js';
import { VerifyUserSchema } from './admin.schema.js';

export class AdminController {
    /**
     * Verify a user
     */
    static async verifyUser(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }

            const { id } = req.params;
            const validatedData = VerifyUserSchema.parse(req.body);

            const user = await AdminService.verifyUser(req.user.userId, id, validatedData);

            res.status(200).json({
                success: true,
                message: `User ${validatedData.status.toLowerCase()} successfully`,
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
}
