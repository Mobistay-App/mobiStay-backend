import { Request, Response } from 'express';
import { z } from 'zod';
import { DriverService } from './driver.service.js';
import { VehicleRegistrationSchema, DriverStatusSchema } from './driver.schema.js';

export class DriverController {
    /**
     * Register/Update Vehicle (Sprint 3.1)
     */
    static async registerVehicle(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }

            const validatedData = VehicleRegistrationSchema.parse(req.body);
            const driverProfile = await DriverService.registerVehicle(req.user.userId, validatedData);

            res.status(200).json({
                success: true,
                message: 'Vehicle details updated successfully',
                data: driverProfile,
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
     * Update Driver Status (Sprint 3.2)
     */
    static async updateStatus(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }

            const validatedData = DriverStatusSchema.parse(req.body);
            const driverProfile = await DriverService.updateStatus(req.user.userId, validatedData);

            res.status(200).json({
                success: true,
                message: validatedData.isOnline ? 'You are now ONLINE' : 'You are now OFFLINE',
                data: driverProfile,
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
