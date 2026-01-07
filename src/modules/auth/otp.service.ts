import { redis } from '../../shared/redis.js';
import { EmailService } from '../../services/email.service.js';
import { SmsService } from '../../services/sms.service.js';

export class OtpService {
    private static readonly OTP_TTL = 300; // 5 minutes in seconds

    /**
     * Generate and send OTP to the user.
     */
    static async sendOtp(userId: string, email?: string | null, phone?: string | null) {
        // 1. Generate 6-digit code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. Store in Redis
        const key = `auth:otp:${userId}`;
        await redis.set(key, otp, { ex: this.OTP_TTL });

        // 3. Send via Notification Channels
        // Priority: Phone -> Email (or both? Requirements said "based on primary contact")
        // For now, if phone exists send SMS, else valid email.

        const promises = [];
        if (phone) {
            promises.push(SmsService.sendOtp(phone, otp));
        }
        if (email) {
            promises.push(EmailService.sendOtp(email, otp));
        }

        await Promise.all(promises);

        return otp; // Return for testing/logging (remove in strict prod if needed)
    }

    /**
     * Verify the provided OTP.
     */
    static async verifyOtp(userId: string, inputOtp: string): Promise<boolean> {
        const key = `auth:otp:${userId}`;
        const storedOtp = await redis.get<string>(key);

        if (!storedOtp) {
            return false; // Expired or not found
        }

        if (String(storedOtp) !== inputOtp) {
            return false; // Invalid code
        }

        // Burn the OTP after successful use to prevent replay
        await redis.del(key);
        return true;
    }
}
