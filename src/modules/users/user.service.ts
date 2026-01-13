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
    /**
     * Submit Owner verification documents (Sprint 1.2)
     */
    /**
     * Submit Owner verification documents (Sprint 1.2)
     */
    static async submitOwnerDocuments(userId: string, data: OwnerDocumentsInput) {
        return await prisma.$transaction(async (tx) => {
            // 0. Pre-check: Profile Completeness
            const userCheck = await tx.user.findUnique({
                where: { id: userId },
                select: { firstName: true, lastName: true, address: true }
            });

            if (!userCheck?.firstName || !userCheck?.lastName || !userCheck?.address) {
                throw new Error('Profile incomplete. Please update your profile (First Name, Last Name, Address) before submitting documents.');
            }

            // 1. Create or Update Owner Profile using Upsert
            await tx.ownerProfile.upsert({
                where: { userId },
                create: {
                    userId,
                    idCardUrl: data.idCardUrl,
                    ownershipDocUrl: data.ownershipDocUrl,
                },
                update: {
                    idCardUrl: data.idCardUrl,
                    ownershipDocUrl: data.ownershipDocUrl,
                },
            });

            // 2. Update user's verification status
            const user = await tx.user.update({
                where: { id: userId },
                data: { idStatus: 'PENDING' },
                select: {
                    id: true,
                    role: true,
                    idStatus: true,
                    ownerProfile: true,
                },
            });

            // 3. Add to audit log
            await tx.verificationLog.create({
                data: {
                    userId,
                    previousStatus: 'UNVERIFIED',
                    newStatus: 'PENDING',
                    reason: 'Owner documents submitted',
                }
            });

            console.info(`📄 [KYC] Owner documents submitted transactionally for user ${userId}`);
            return user;
        });
    }

    /**
     * Submit Driver verification documents (Sprint 1.2)
     */
    static async submitDriverDocuments(userId: string, data: DriverDocumentsInput) {
        return await prisma.$transaction(async (tx) => {
            // 0. Pre-check: Profile Completeness
            const userCheck = await tx.user.findUnique({
                where: { id: userId },
                select: { firstName: true, lastName: true, address: true }
            });

            if (!userCheck?.firstName || !userCheck?.lastName || !userCheck?.address) {
                throw new Error('Profile incomplete. Please update your profile (First Name, Last Name, Address) before submitting documents.');
            }

            // 1. Create or Update Driver Profile using Upsert
            await tx.driverProfile.upsert({
                where: { userId },
                create: {
                    userId,
                    idCardUrl: data.idCardUrl,
                    licenseImageUrl: data.licenseImageUrl,
                    licenseNumber: data.licenseNumber,
                },
                update: {
                    idCardUrl: data.idCardUrl,
                    licenseImageUrl: data.licenseImageUrl,
                    licenseNumber: data.licenseNumber,
                },
            });

            const user = await tx.user.update({
                where: { id: userId },
                data: { idStatus: 'PENDING' },
                select: {
                    id: true,
                    role: true,
                    idStatus: true,
                    driverProfile: true,
                },
            });

            await tx.verificationLog.create({
                data: {
                    userId,
                    previousStatus: 'UNVERIFIED',
                    newStatus: 'PENDING',
                    reason: 'Driver documents submitted',
                }
            });

            console.info(`📄 [KYC] Driver documents submitted transactionally for user ${userId}`);
            return user;
        });
    }
}
