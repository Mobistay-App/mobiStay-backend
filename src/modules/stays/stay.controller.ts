import { Request, Response } from 'express';
import { z } from 'zod';
import { StayService } from './stay.service.js';
import { CreatePropertySchema, UpdateAvailabilitySchema } from './stay.schema.js';

export class StayController {
    /**
     * Create a new property
     */
    static async createProperty(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }

            // Validation (Auth middleware handles role and verification check usually, but we should confirm)
            // The route definition will handle role='OWNER' and Verified check.

            const validatedData = CreatePropertySchema.parse(req.body);

            const property = await StayService.createProperty(req.user.userId, validatedData);

            res.status(201).json({
                success: true,
                message: 'Property created successfully',
                data: property,
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
     * Update property availability
     */
    static async updateAvailability(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }

            const { id } = req.params;
            const validatedData = UpdateAvailabilitySchema.parse(req.body);

            const property = await StayService.updateAvailability(id, req.user.userId, validatedData);

            res.status(200).json({
                success: true,
                message: 'Availability updated successfully',
                data: property,
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
     * Get owner's listings
     */
    static async getMyListings(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }

            const properties = await StayService.getOwnerProperties(req.user.userId);

            res.status(200).json({
                success: true,
                message: 'Listings retrieved successfully',
                data: properties,
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    /**
     * List all active properties
     */
    static async listProperties(req: Request, res: Response): Promise<void> {
        try {
            const { city } = req.query;
            const properties = await StayService.getAllProperties(city as string);

            res.status(200).json({
                success: true,
                data: properties
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
