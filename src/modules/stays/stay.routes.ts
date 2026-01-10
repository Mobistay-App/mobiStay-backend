import { Router } from 'express';
import { StayController } from './stay.controller.js';
import { authenticate, requireVerified, requireRole } from '../../middleware/auth.middleware.js';

/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: Property management for Owners
 */

const router = Router();

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property listing
 *     tags: [Properties]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, address, city, pricePerNight, amenities, images]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *                 enum: [DOUALA, YAOUNDE, BAMENDA, BUEA, LIMBE]
 *               pricePerNight:
 *                 type: number
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Property created successfully
 *       403:
 *         description: Only verified OWNERS can create properties
 */
router.post(
    '/',
    authenticate,
    requireVerified,
    requireRole('OWNER'),
    StayController.createProperty
);

/**
 * @swagger
 * /api/properties/{id}/availability:
 *   patch:
 *     summary: Update property availability
 *     tags: [Properties]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               blockedDates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date-time
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *       403:
 *         description: Unauthorized
 */
router.patch(
    '/:id/availability',
    authenticate,
    requireVerified,
    requireRole('OWNER'),
    StayController.updateAvailability
);

export default router;
