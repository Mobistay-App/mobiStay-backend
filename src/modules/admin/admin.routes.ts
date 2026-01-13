import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative actions
 */

const router = Router();

/**
 * @swagger
 * /api/admin/users/{id}/verify:
 *   patch:
 *     summary: Verify or Reject a user's identity
 *     tags: [Admin]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User status updated
 *       403:
 *         description: Admin access required
 */
router.patch(
    '/users/:id/verify',
    authenticate,
    requireRole('ADMIN'),
    AdminController.verifyUser
);

export default router;
