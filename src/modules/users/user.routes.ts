import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticate, requireVerified, requireRole } from '../../middleware/auth.middleware.js';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and KYC verification management
 */

const router = Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/profile', authenticate, UserController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   patch:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               bio:
 *                 type: string
 *                 maxLength: 240
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 */
router.patch('/profile', authenticate, requireVerified, UserController.updateProfile);

/**
 * @swagger
 * /api/users/verify/documents:
 *   post:
 *     summary: Submit verification documents (Owner or Driver)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 title: Owner Documents
 *                 required: [idCardUrl]
 *                 properties:
 *                   idCardUrl:
 *                     type: string
 *                     format: uri
 *                   ownershipDocUrl:
 *                     type: string
 *                     format: uri
 *               - type: object
 *                 title: Driver Documents
 *                 required: [idCardUrl, licenseImageUrl, licenseNumber, vehicleModel, vehiclePlate]
 *                 properties:
 *                   idCardUrl:
 *                     type: string
 *                     format: uri
 *                   licenseImageUrl:
 *                     type: string
 *                     format: uri
 *                   licenseNumber:
 *                     type: string
 *                   vehicleModel:
 *                     type: string
 *                   vehiclePlate:
 *                     type: string
 *     responses:
 *       200:
 *         description: Documents submitted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only OWNER or DRIVER roles can submit documents
 */
router.post(
    '/verify/documents',
    authenticate,
    requireVerified,
    requireRole('OWNER', 'DRIVER'),
    UserController.submitDocuments
);

export default router;
