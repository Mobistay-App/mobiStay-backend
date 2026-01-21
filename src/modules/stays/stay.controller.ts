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
     * Update property details
     */
    static async updateProperty(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }

            const { id } = req.params;
            const property = await StayService.updateProperty(id, req.user.userId, req.body);

            res.status(200).json({
                success: true,
                message: 'Property updated successfully',
                data: property,
            });
        } catch (error: any) {
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
            const { city, type } = req.query;
            console.log('🔍 Listing properties with filters:', { city, type });

            const properties = await StayService.getAllProperties(city as string, type as string);
            console.log(`🏠 [DB] Found ${properties.length} active properties.`);

            res.status(200).json({
                success: true,
                count: properties.length,
                data: properties
            });
        } catch (error: any) {
            console.error('❌ List Stays Error:', error);
            res.status(400).json({
                success: false,
                message: `Failed to list properties: ${error.message || 'Unknown error'}`,
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * Get a single property
     */
    static async getProperty(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const property = await StayService.getPropertyById(id);

            if (!property) {
                res.status(404).json({ success: false, message: 'Property not found' });
                return;
            }

            res.status(200).json({
                success: true,
                data: property
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: `Failed to get property: ${error.message}` });
        }
    }

    /**
     * Delete a property
     */
    static async deleteProperty(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }

            const { id } = req.params;
            await StayService.deleteProperty(id, req.user.userId);

            res.status(200).json({
                success: true,
                message: 'Property deleted successfully'
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
