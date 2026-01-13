import { Request, Response } from 'express';
import { RideService } from './ride.service.js';
import { RequestRideSchema, UpdateRideStatusSchema } from './ride.schema.js';
import { z } from 'zod';

export class RideController {

    static async requestRide(req: Request, res: Response): Promise<void> {
        try {
            const data = RequestRideSchema.parse(req.body);
            // @ts-ignore
            const ride = await RideService.requestRide(req.user.userId, data);

            res.status(201).json({
                success: true,
                message: 'Ride requested successfully',
                data: ride
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, errors: error.issues });
                return;
            }
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async acceptRide(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            // @ts-ignore
            const ride = await RideService.acceptRide(req.user.userId, id);

            res.status(200).json({
                success: true,
                message: 'Ride accepted',
                data: ride
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async updateStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const data = UpdateRideStatusSchema.parse(req.body);
            // @ts-ignore
            const ride = await RideService.updateStatus(req.user.userId, id, data.status);

            res.status(200).json({
                success: true,
                message: `Ride ${data.status.toLowerCase()}`,
                data: ride
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async getActive(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const ride = await RideService.getActiveRide(req.user.userId, req.user.role);
            res.status(200).json({
                success: true,
                data: ride
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
