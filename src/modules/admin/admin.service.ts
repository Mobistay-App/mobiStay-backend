import { prisma } from '../../shared/prisma.js';
import { VerifyUserInput } from './admin.schema.js';
import { EmailService } from '../../services/email.service.js';
import { SmsService } from '../../services/sms.service.js';

export class AdminService {
    /**
     * Verify a user (Sprint 4.1)
     */
    static async verifyUser(adminId: string, userId: string, data: VerifyUserInput) {
        // 1. Get current status to log "previousStatus"
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { idStatus: true, email: true, phone: true, firstName: true }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // 2. Update Status
        const updateData: any = {
            idStatus: data.status,
        };

        if (data.status === 'APPROVED') {
            updateData.isVerified = true;
        } else if (data.status === 'REJECTED') {
            updateData.isVerified = false; // Optional: revert to false if they were previously verified?
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        // 3. Log to VerificationLog
        await prisma.verificationLog.create({
            data: {
                userId,
                adminId,
                previousStatus: user.idStatus,
                newStatus: data.status as any, // Cast to VerificationStatus if strictly typed
                reason: data.reason,
            }
        });

        // 4. Send Notification (Email or SMS)
        const message = data.status === 'APPROVED'
            ? `Congratulations ${user.firstName || 'User'}! Your Mobistay account has been verified. You can now access all features.`
            : `Hello ${user.firstName || 'User'}. Your verification request was rejected. Reason: ${data.reason || 'Documents invalid'}.`;

        const subject = data.status === 'APPROVED' ? 'Account Verified' : 'Verification Update';

        if (user.email) {
            await EmailService.sendNotification(user.email, subject, `<p>${message}</p>`);
        } else if (user.phone) {
            await SmsService.sendNotification(user.phone, message);
        }

        return updatedUser;
    }
}
