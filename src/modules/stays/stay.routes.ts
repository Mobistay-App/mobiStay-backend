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
 *   get:
 *     summary: List all active properties
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get('/', StayController.listProperties);

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get a single property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property details
 *       404:
 *         description: Property not found
 */
router.get('/:id', StayController.getProperty);

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
 * /api/properties/my-listings:
 *   get:
 *     summary: Get current authenticated owner's properties
 *     tags: [Properties]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of owner properties
 *       401:
 *         description: Authentication required
 */
router.get(
    '/my-listings',
    authenticate,
    requireVerified,
    requireRole('OWNER'),
    StayController.getMyListings
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

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete a property
 *     tags: [Properties]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       403:
 *         description: Unauthorized
 */
router.delete(
    '/:id',
    authenticate,
    requireVerified,
    requireRole('OWNER'),
    StayController.deleteProperty
);

export default router;
