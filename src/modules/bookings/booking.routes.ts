import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { BookingController } from './booking.controller.js';

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Reservation management
 */
const router = Router();

// Used for Authenticated users
router.use(authenticate);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [propertyId, checkIn, checkOut]
 *             properties:
 *               propertyId:
 *                 type: string
 *               checkIn:
 *                 type: string
 *                 format: date
 *               checkOut:
 *                 type: string
 *                 format: date
 *               guestCount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Booking created
 *   get:
 *     summary: List my bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.post('/', BookingController.create);
router.get('/', BookingController.list);
router.get('/stats', BookingController.getOwnerStats);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status (Cancel/Confirm)
 *     tags: [Bookings]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', BookingController.updateStatus);

export default router;
