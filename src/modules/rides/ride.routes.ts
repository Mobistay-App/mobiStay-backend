import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { RideController } from './ride.controller.js';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Rides
 *   description: Ride matching and management
 */

/**
 * @swagger
 * /api/rides/request:
 *   post:
 *     summary: Request a new ride
 *     tags: [Rides]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pickupAddress, pickupLat, pickupLng, dropoffAddress, dropoffLat, dropoffLng]
 *             properties:
 *               pickupAddress:
 *                 type: string
 *               pickupLat:
 *                 type: number
 *               pickupLng:
 *                 type: number
 *               dropoffAddress:
 *                 type: string
 *               dropoffLat:
 *                 type: number
 *               dropoffLng:
 *                 type: number
 *     responses:
 *       201:
 *         description: Ride requested
 */
router.post('/request', RideController.requestRide);

/**
 * @swagger
 * /api/rides/{id}/accept:
 *   patch:
 *     summary: Driver accepts a ride request
 *     tags: [Rides]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ride accepted
 */
router.patch('/:id/accept', requireRole('DRIVER'), RideController.acceptRide);

/**
 * @swagger
 * /api/rides/{id}/status:
 *   patch:
 *     summary: Update ride status (IN_PROGRESS, COMPLETED)
 *     tags: [Rides]
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
 *               status:
 *                 type: string
 *                 enum: [IN_PROGRESS, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', requireRole('DRIVER'), RideController.updateStatus);

/**
 * @swagger
 * /api/rides/active:
 *   get:
 *     summary: Get currently active ride (if any)
 *     tags: [Rides]
 *     responses:
 *       200:
 *         description: Active ride details
 */
router.get('/active', RideController.getActive);

export default router;
