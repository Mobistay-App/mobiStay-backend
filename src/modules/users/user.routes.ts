import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticate, requireVerified, requireRole } from '../../middleware/auth.middleware.js';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: |
 *     User profile and KYC verification management.
 *     
 *     ## Overview
 *     This module handles:
 *     - **Profile Management** - Get and update user profile information
 *     - **KYC Verification** - Submit verification documents (for OWNER and DRIVER roles)
 *     
 *     ## Pre-requisites for KYC
 *     Before submitting documents, users must complete their profile with:
 *     - First Name
 *     - Last Name  
 *     - Address
 */

const router = Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user's profile
 *     description: |
 *       Retrieves the complete profile for the authenticated user, including:
 *       - Basic info (name, email, phone, bio, address)
 *       - Verification status (isVerified, idStatus)
 *       - Owner profile (if role is OWNER)
 *       - Driver profile (if role is DRIVER)
 *       
 *       **Use Case:** Display user profile in mobile app or admin dashboard
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                   example: Profile retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/UserWithProfiles'
 *             example:
 *               success: true
 *               message: Profile retrieved successfully
 *               data:
 *                 id: clx1abc123def456
 *                 email: user@example.com
 *                 phone: "+237691234567"
 *                 firstName: John
 *                 lastName: Doe
 *                 avatarUrl: /uploads/avatar_123.jpg
 *                 bio: Property owner in Douala
 *                 address: 123 Main Street, Douala
 *                 role: OWNER
 *                 isVerified: true
 *                 idStatus: APPROVED
 *                 createdAt: "2026-01-15T10:30:00.000Z"
 *                 ownerProfile:
 *                   id: clx2owner789
 *                   userId: clx1abc123def456
 *                   idCardUrl: /uploads/id_front_123.jpg
 *                   idBackUrl: /uploads/id_back_123.jpg
 *                   selfieWithIdUrl: /uploads/selfie_123.jpg
 *                   ownershipDocUrl: /uploads/ownership_123.pdf
 *                 driverProfile: null
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Authentication required
 */
router.get('/profile', authenticate, UserController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   patch:
 *     summary: Update current user's profile
 *     description: |
 *       Updates the authenticated user's profile information.
 *       
 *       **All fields are optional** - only include fields you want to update.
 *       
 *       ## Validation Rules
 *       | Field | Rule |
 *       |-------|------|
 *       | firstName | Min 2 characters |
 *       | lastName | Min 2 characters |
 *       | bio | Max 240 characters |
 *       | address | Min 5 characters |
 *       
 *       **Important:** Profile must be complete (firstName, lastName, address) before submitting KYC documents.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *           examples:
 *             fullUpdate:
 *               summary: Update all fields
 *               value:
 *                 firstName: John
 *                 lastName: Doe
 *                 bio: Experienced property owner with 5 years in Douala
 *                 avatarUrl: /uploads/avatar_123.jpg
 *                 address: 456 New Street, Yaoundé, Cameroon
 *             partialUpdate:
 *               summary: Update only name
 *               value:
 *                 firstName: John
 *                 lastName: Doe
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: Profile updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: Profile updated successfully
 *               data:
 *                 id: clx1abc123def456
 *                 email: user@example.com
 *                 firstName: John
 *                 lastName: Doe
 *                 avatarUrl: /uploads/avatar_123.jpg
 *                 bio: Experienced property owner with 5 years in Douala
 *                 address: 456 New Street, Yaoundé, Cameroon
 *                 role: OWNER
 *                 isVerified: true
 *                 idStatus: APPROVED
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             example:
 *               success: false
 *               errors:
 *                 - code: too_small
 *                   minimum: 2
 *                   message: First name too short
 *                   path: [firstName]
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Authentication required
 */
router.patch('/profile', authenticate, UserController.updateProfile);

/**
 * @swagger
 * /api/users/verify/documents:
 *   post:
 *     summary: Submit verification documents (Owner or Driver)
 *     description: |
 *       Submit KYC verification documents for identity verification.
 *       
 *       ## Access Control
 *       | Role | Access |
 *       |------|--------|
 *       | TRAVELER | ❌ Forbidden |
 *       | OWNER | ✅ Allowed |
 *       | DRIVER | ✅ Allowed |
 *       | ADMIN | ❌ Forbidden |
 *       
 *       ## Pre-requisites
 *       ⚠️ **Before submitting**, user profile must have:
 *       - `firstName` (not null)
 *       - `lastName` (not null)
 *       - `address` (not null)
 *       
 *       If incomplete, you'll receive: `"Profile incomplete. Please update your profile (First Name, Last Name, Address) before submitting documents."`
 *       
 *       ## Document Requirements
 *       
 *       ### For OWNER:
 *       - **idCardUrl** - Front of national ID card
 *       - **idBackUrl** - Back of national ID card
 *       - **selfieWithIdUrl** - Photo of user holding their ID
 *       - **ownershipDocUrl** - Property ownership/title document
 *       
 *       ### For DRIVER:
 *       - **idCardUrl** - Front of national ID card
 *       - **idBackUrl** - Back of national ID card
 *       - **selfieWithIdUrl** - Photo of user holding their ID
 *       - **licenseImageUrl** - Driver's license photo
 *       - **licenseNumber** - License number (min 5 chars)
 *       - **insuranceDocUrl** - Vehicle insurance document
 *       
 *       ## What Happens After Submission
 *       1. User's `idStatus` changes from `UNVERIFIED` to `PENDING`
 *       2. An audit log entry is created
 *       3. Admin reviews documents in the Admin Dashboard
 *       4. Admin approves or rejects → user is notified via email/SMS
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/OwnerDocumentsRequest'
 *               - $ref: '#/components/schemas/DriverDocumentsRequest'
 *           examples:
 *             ownerDocuments:
 *               summary: Owner submitting documents
 *               description: Required fields for OWNER role
 *               value:
 *                 idCardUrl: /uploads/owner_id_front_123.jpg
 *                 idBackUrl: /uploads/owner_id_back_123.jpg
 *                 selfieWithIdUrl: /uploads/owner_selfie_123.jpg
 *                 ownershipDocUrl: /uploads/ownership_doc_123.pdf
 *             driverDocuments:
 *               summary: Driver submitting documents
 *               description: Required fields for DRIVER role
 *               value:
 *                 idCardUrl: /uploads/driver_id_front_456.jpg
 *                 idBackUrl: /uploads/driver_id_back_456.jpg
 *                 selfieWithIdUrl: /uploads/driver_selfie_456.jpg
 *                 licenseImageUrl: /uploads/license_456.jpg
 *                 licenseNumber: DL-2026-123456
 *                 insuranceDocUrl: /uploads/insurance_456.pdf
 *     responses:
 *       200:
 *         description: Documents submitted successfully
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
 *                   example: Documents submitted successfully. Your verification is now PENDING.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     role:
 *                       $ref: '#/components/schemas/UserRole'
 *                     idStatus:
 *                       type: string
 *                       example: PENDING
 *                     ownerProfile:
 *                       $ref: '#/components/schemas/OwnerProfile'
 *             example:
 *               success: true
 *               message: Documents submitted successfully. Your verification is now PENDING.
 *               data:
 *                 id: clx1abc123def456
 *                 role: OWNER
 *                 idStatus: PENDING
 *                 ownerProfile:
 *                   id: clx2owner789
 *                   userId: clx1abc123def456
 *                   idCardUrl: /uploads/owner_id_front_123.jpg
 *                   idBackUrl: /uploads/owner_id_back_123.jpg
 *                   selfieWithIdUrl: /uploads/owner_selfie_123.jpg
 *                   ownershipDocUrl: /uploads/ownership_doc_123.pdf
 *       400:
 *         description: Validation error or profile incomplete
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               profileIncomplete:
 *                 summary: Profile not complete
 *                 value:
 *                   success: false
 *                   message: Profile incomplete. Please update your profile (First Name, Last Name, Address) before submitting documents.
 *               validationError:
 *                 summary: Invalid document URL
 *                 value:
 *                   success: false
 *                   errors:
 *                     - code: invalid_string
 *                       message: ID Card front must be a valid URL
 *                       path: [idCardUrl]
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
 *         description: Only OWNER or DRIVER roles can submit documents
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Only OWNERs and DRIVERs can submit verification documents
 */
router.post(
    '/verify/documents',
    authenticate,
    requireRole('OWNER', 'DRIVER'),
    UserController.submitDocuments
);

export default router;

