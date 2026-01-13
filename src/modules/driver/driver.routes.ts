import { Router } from 'express';
import { DriverController } from './driver.controller.js';
import { authenticate, requireRole, requireVerified } from '../../middleware/auth.middleware.js';

/**
 * @swagger
 * tags:
 *   name: Driver
 *   description: Driver management and status
 */

const router = Router();

/**
 * @swagger
 * /api/driver/vehicle:
 *   post:
 *     summary: Register or update vehicle details
 *     tags: [Driver]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleModel, vehiclePlate, vehicleColor, vehicleType, licenseNumber]
 *             properties:
 *               vehicleModel:
 *                 type: string
 *               vehiclePlate:
 *                 type: string
 *               vehicleColor:
 *                 type: string
 *               vehicleType:
 *                 type: string
 *                 enum: [STANDARD, COMFORT, LARGE_GROUP]
 *               licenseNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vehicle details updated
 *       403:
 *         description: Only DRIVER role allowed
 */
router.post(
    '/vehicle',
    authenticate,
    requireRole('DRIVER'),
    DriverController.registerVehicle
);

/**
 * @swagger
 * /api/driver/status:
 *   patch:
 *     summary: Go Online/Offline
 *     tags: [Driver]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isOnline]
 *             properties:
 *               isOnline:
 *                 type: boolean
 *               location:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *     responses:
 *       200:
 *         description: Status updated
 *       403:
 *         description: Unauthorized (Must be Verified Driver)
 */
router.patch(
    '/status',
    authenticate,
    requireRole('DRIVER'),
    requireVerified,
    DriverController.updateStatus
);

export default router;
