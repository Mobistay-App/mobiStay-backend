import { z } from 'zod';

/**
 * Schema for updating user profile (Sprint 1.1)
 */
export const UpdateProfileSchema = z.object({
    firstName: z.string().min(2, 'First name too short').optional(),
    lastName: z.string().min(2, 'Last name too short').optional(),
    bio: z.string().max(240, 'Bio must be 240 characters or less').optional(),
    avatarUrl: z.string().url('Avatar must be a valid URL').startsWith('https://', 'Avatar URL must use HTTPS').optional(),
    address: z.string().min(5, 'Address too short').optional(),
});

/**
 * Schema for Owner document submission (Sprint 1.2)
 */
export const OwnerDocumentsSchema = z.object({
    idCardUrl: z.string().url('ID Card front must be a valid URL'),
    idBackUrl: z.string().url('ID Card back must be a valid URL'),
    selfieWithIdUrl: z.string().url('Selfie with ID must be a valid URL'),
    ownershipDocUrl: z.string().url('Ownership document must be a valid URL'),
});

/**
 * Schema for Driver document submission (Sprint 1.2)
 */
export const DriverDocumentsSchema = z.object({
    idCardUrl: z.string().url('ID Card front must be a valid URL'),
    idBackUrl: z.string().url('ID Card back must be a valid URL'),
    selfieWithIdUrl: z.string().url('Selfie with ID must be a valid URL'),
    licenseImageUrl: z.string().url('License image must be a valid URL'),
    licenseNumber: z.string().min(5, 'License number too short'),
    insuranceDocUrl: z.string().url('Insurance document must be a valid URL'),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type OwnerDocumentsInput = z.infer<typeof OwnerDocumentsSchema>;
export type DriverDocumentsInput = z.infer<typeof DriverDocumentsSchema>;
