import { Request, Response } from 'express';
import { z } from 'zod';
import { BookingService } from './booking.service.js';
import { CreateBookingSchema, UpdateBookingStatusSchema } from './booking.schema.js';

export class BookingController {
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const data = CreateBookingSchema.parse(req.body);
            // @ts-ignore - req.user exists from auth middleware
            const booking = await BookingService.createBooking(req.user.userId, data);

            res.status(201).json({
                success: true,
                message: 'Booking request created successfully',
                data: booking
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, errors: error.issues });
                return;
            }
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async list(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const bookings = await BookingService.getUserBookings(req.user.userId, req.user.role);
            res.status(200).json({
                success: true,
                data: bookings
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const data = UpdateBookingStatusSchema.parse(req.body);
            // @ts-ignore
            const updated = await BookingService.updateStatus(req.user.userId, id, data);

            res.status(200).json({
                success: true,
                message: `Booking ${data.status.toLowerCase()}`,
                data: updated
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async getOwnerStats(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const stats = await BookingService.getOwnerStats(req.user.userId);
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
