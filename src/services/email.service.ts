import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// Transporter configuration based on SMTP settings
const transporter = (env.SMTP_USER && env.SMTP_PASS) ? nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT),
    secure: env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
}) : null;

export class EmailService {
    /**
     * Send an OTP email.
     */
    static async sendOtp(to: string, otp: string) {
        if (!transporter) {
            console.warn(`[dev] Mock Email to ${to}: Your OTP is ${otp}`);
            console.warn(`[dev] To enable real emails, add SMTP_USER and SMTP_PASS to .env`);
            return;
        }

        try {
            await transporter.sendMail({
                from: `"Mobistay" <${env.SMTP_USER}>`,
                to,
                subject: 'Your Verification Code',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2>Verify Your Account</h2>
                        <p>Your Mobistay verification code is:</p>
                        <h1 style="color: #4A90E2; letter-spacing: 5px;">${otp}</h1>
                        <p>This code expires in 5 minutes.</p>
                        <p>If you didn't request this, please ignore this email.</p>
                    </div>
                `,
            });
            console.log(`✉️ Real Email sent to ${to}`);
        } catch (error) {
            console.error('Failed to send email via Nodemailer:', error);
            // Fallback for dev:
            console.warn(`[fallback] OTP for ${to}: ${otp}`);
        }
    }
}
