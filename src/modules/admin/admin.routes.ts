import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: |
 *     Administrative actions for platform management.
 *     
 *     ## 🔐 Access Control
 *     All endpoints in this module require:
 *     - **Authentication** - Valid JWT token in cookie
 *     - **Authorization** - User must have `role: ADMIN`
 *     
 *     ## 📋 Admin Responsibilities
 *     | Action | Description |
 *     |--------|-------------|
 *     | Verify Users | Review and approve/reject KYC documents |
 *     | Audit Trail | All actions are logged in VerificationLog |
 *     
 *     ## 🔄 Verification Workflow
 *     ```
 *     1. User submits documents → idStatus: PENDING
 *     2. Admin reviews documents in dashboard
 *     3. Admin approves or rejects
 *     4. User notified via email/SMS
 *     ```
 */

const router = Router();

/**
 * @swagger
 * /api/admin/users/{id}/verify:
 *   patch:
 *     summary: Verify or Reject a user's identity
 *     description: |
 *       Approve or reject a user's KYC verification request.
 *       
 *       ## 🔐 Authorization
 *       - Requires `ADMIN` role
 *       - Non-admins will receive 403 Forbidden
 *       
 *       ## 📝 Request Details
 *       - **status** (required): `APPROVED` or `REJECTED`
 *       - **reason** (optional): Explanation for rejection (highly recommended)
 *       
 *       ## ✅ What Happens on APPROVE
 *       1. User's `idStatus` → `APPROVED`
 *       2. User's `isVerified` → `true`
 *       3. Audit log entry created
 *       4. User notified: "Congratulations! Your account has been verified."
 *       
 *       ## ❌ What Happens on REJECT
 *       1. User's `idStatus` → `REJECTED`
 *       2. User's `isVerified` → `false`
 *       3. Audit log entry created (with reason)
 *       4. User notified: "Your verification was rejected. Reason: [reason]"
 *       
 *       ## 📧 Notifications
 *       - **Email** sent if user has email address
 *       - **SMS** sent if user has phone (and no email)
 *       
 *       ## 📋 Audit Logging
 *       Every action creates a `VerificationLog` entry:
 *       ```json
 *       {
 *         "userId": "target_user_id",
 *         "adminId": "admin_who_acted",
 *         "previousStatus": "PENDING",
 *         "newStatus": "APPROVED",
 *         "reason": null,
 *         "createdAt": "2026-01-17T14:45:00.000Z"
 *       }
 *       ```
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The target user's ID (CUID format)
 *         example: clx1abc123def456
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyUserRequest'
 *           examples:
 *             approveUser:
 *               summary: Approve a user
 *               description: Approves the user's verification request
 *               value:
 *                 status: APPROVED
 *             rejectUser:
 *               summary: Reject a user
 *               description: Rejects with a clear reason for the user
 *               value:
 *                 status: REJECTED
 *                 reason: ID card image is blurry and unreadable. Please upload a clearer photo.
 *             rejectDocuments:
 *               summary: Reject - Documents don't match
 *               value:
 *                 status: REJECTED
 *                 reason: The selfie does not appear to match the person in the ID card photo.
 *             rejectExpired:
 *               summary: Reject - Expired documents
 *               value:
 *                 status: REJECTED
 *                 reason: Your driver's license has expired. Please provide a valid license.
 *     responses:
 *       200:
 *         description: User status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User approved successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *             examples:
 *               approved:
 *                 summary: User approved
 *                 value:
 *                   success: true
 *                   message: User approved successfully
 *                   data:
 *                     id: clx1abc123def456
 *                     email: owner@example.com
 *                     phone: "+237691234567"
 *                     firstName: John
 *                     lastName: Doe
 *                     role: OWNER
 *                     isVerified: true
 *                     idStatus: APPROVED
 *                     createdAt: "2026-01-15T10:30:00.000Z"
 *                     updatedAt: "2026-01-17T14:45:00.000Z"
 *               rejected:
 *                 summary: User rejected
 *                 value:
 *                   success: true
 *                   message: User rejected successfully
 *                   data:
 *                     id: clx1abc123def456
 *                     email: owner@example.com
 *                     phone: "+237691234567"
 *                     firstName: John
 *                     lastName: Doe
 *                     role: OWNER
 *                     isVerified: false
 *                     idStatus: REJECTED
 *                     createdAt: "2026-01-15T10:30:00.000Z"
 *                     updatedAt: "2026-01-17T14:45:00.000Z"
 *       400:
 *         description: Validation error or user not found
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               userNotFound:
 *                 summary: User not found
 *                 value:
 *                   success: false
 *                   message: User not found
 *               invalidStatus:
 *                 summary: Invalid status value
 *                 value:
 *                   success: false
 *                   errors:
 *                     - code: invalid_enum_value
 *                       message: "Invalid enum value. Expected 'APPROVED' | 'REJECTED', received 'approved'"
 *                       path: [status]
 *                       options: [APPROVED, REJECTED]
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Authentication required
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Access denied. ADMIN role required.
 */
router.patch(
    '/users/:id/verify',
    authenticate,
    requireRole('ADMIN'),
    AdminController.verifyUser
);

export default router;

