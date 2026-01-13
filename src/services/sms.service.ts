import africastalking from 'africastalking';
import { env } from '../config/env.js';

let smsClient: any = null;

if (env.AT_API_KEY && env.AT_USERNAME) {
    const at = africastalking({
        apiKey: env.AT_API_KEY,
        username: env.AT_USERNAME
    });
    smsClient = at.SMS;
}

export class SmsService {
    /**
     * Send an OTP via SMS.
     */
    static async sendOtp(to: string, otp: string) {
        if (!smsClient) {
            console.warn(`[dev] Mock SMS to ${to}: Your OTP is ${otp}`);
            return;
        }

        try {
            await smsClient.send({
                to: [to],
                message: `Your Mobistay code: ${otp}. Valid for 5 min.`
            });
            console.log(`📱 SMS sent to ${to}`);
        } catch (error) {
            console.error('Failed to send SMS:', error);
            console.warn(`[fallback] OTP for ${to}: ${otp}`);
        }
    }

    /**
     * Send a generic notification SMS.
     */
    static async sendNotification(to: string, message: string) {
        if (!smsClient) {
            console.warn(`[dev] Mock SMS to ${to}: ${message}`);
            return;
        }

        try {
            await smsClient.send({
                to: [to],
                message,
            });
            console.log(`📱 SMS sent to ${to}`);
        } catch (error) {
            console.error('Failed to send SMS:', error);
        }
    }
}
