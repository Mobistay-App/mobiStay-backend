import { prisma } from '../../shared/prisma.js';
import { UpdateProfileInput, OwnerDocumentsInput, DriverDocumentsInput } from './user.schema.js';

export class UserService {
    /**
     * Get current user's profile
     */
    static async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                bio: true,
                address: true,
                role: true,
                isVerified: true,
                idStatus: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    /**
     * Update user profile (Sprint 1.1)
     */
    static async updateProfile(userId: string, data: UpdateProfileInput) {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                bio: data.bio,
                avatarUrl: data.avatarUrl,
                address: data.address,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                bio: true,
                address: true,
                role: true,
                isVerified: true,
                idStatus: true,
            },
        });

        return updatedUser;
    }

    /**
     * Submit Owner verification documents (Sprint 1.2)
     */
    static async submitOwnerDocuments(userId: string, data: OwnerDocumentsInput) {
        // Check if owner profile exists
        const existingProfile = await prisma.ownerProfile.findUnique({
            where: { userId },
        });

        if (existingProfile) {
            // Update existing profile
            await prisma.ownerProfile.update({
                where: { userId },
                data: {
                    idCardUrl: data.idCardUrl,
                    businessLicense: data.ownershipDocUrl,
                },
            });
        } else {
            // Create new profile
            await prisma.ownerProfile.create({
                data: {
                    userId,
                    idCardUrl: data.idCardUrl,
                    businessLicense: data.ownershipDocUrl,
                },
            });
        }

        // Update user's verification status to PENDING
        const user = await prisma.user.update({
            where: { id: userId },
            data: { idStatus: 'PENDING' },
            select: {
                id: true,
                role: true,
                idStatus: true,
                ownerProfile: true,
            },
        });

        // Add to audit log
        await prisma.verificationLog.create({
            data: {
                userId,
                previousStatus: 'UNVERIFIED', // Assumption: They are submitting for the first time or re-submitting
                newStatus: 'PENDING',
                reason: 'Owner documents submitted',
            }
        });

        console.info(`📄 [KYC] Owner documents submitted for user ${userId}`);
        // TODO: Emit Pusher event to Admin Dashboard for "New Verification Pending"

        return user;
    }

    /**
     * Submit Driver verification documents (Sprint 1.2)
     */
    static async submitDriverDocuments(userId: string, data: DriverDocumentsInput) {
        // Check if driver profile exists
        const existingProfile = await prisma.driverProfile.findUnique({
            where: { userId },
        });

        if (existingProfile) {
            // Update existing profile
            await prisma.driverProfile.update({
                where: { userId },
                data: {
                    licenseImageUrl: data.licenseImageUrl,
                    licenseNumber: data.licenseNumber,
                    vehicleModel: data.vehicleModel,
                    vehiclePlate: data.vehiclePlate,
                },
            });
        } else {
            // Create new profile
            await prisma.driverProfile.create({
                data: {
                    userId,
                    licenseImageUrl: data.licenseImageUrl,
                    licenseNumber: data.licenseNumber,
                    vehicleModel: data.vehicleModel,
                    vehiclePlate: data.vehiclePlate,
                },
            });
        }

        // Update user's verification status to PENDING
        const user = await prisma.user.update({
            where: { id: userId },
            data: { idStatus: 'PENDING' },
            select: {
                id: true,
                role: true,
                idStatus: true,
                driverProfile: true,
            },
        });

        // Add to audit log
        await prisma.verificationLog.create({
            data: {
                userId,
                previousStatus: 'UNVERIFIED',
                newStatus: 'PENDING',
                reason: 'Driver documents submitted',
            }
        });

        console.info(`📄 [KYC] Driver documents submitted for user ${userId}`);
        // TODO: Emit Pusher event to Admin Dashboard for "New Verification Pending"

        return user;
    }
}
