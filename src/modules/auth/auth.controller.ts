import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterSchema, LoginSchema, OtpSchema, ResendOtpSchema } from './auth.schema.js';
import { z } from 'zod';

export class AuthController {

    /**
     * Handle User Registration
     */
    static async register(req: Request, res: Response): Promise<void> {
        try {
            // 1. Validate Input
            // Although we might have middleware for this, explicit validation here is safe
            const validatedData = RegisterSchema.parse(req.body);

            // 2. Call Service
            const user = await AuthService.register(validatedData);

            // 3. Send Response
            res.status(201).json({
                success: true,
                message: "User registered successfully. check your email/phone for OTP.",
                data: user
            });
        } catch (error: any) {
            // Handle Zod Errors
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, errors: error.issues });
                return; // Ensure we return void
            }

            // Handle Business Errors (e.g., User exists)
            res.status(400).json({ success: false, message: error.message });
        }
    }

    /**
     * Handle OTP Verification
     */
    static async verify(req: Request, res: Response): Promise<void> {
        try {
            const { userId, otp } = OtpSchema.parse(req.body);

            // We need userId. If not provided in body (maybe user is logged in but unverified?), 
            // we might get it from token. But for now assuming public verify endpoint with userId/email.
            // But OtpSchema allows userId OR email.
            // We need to resolve userId if email is passed.
            // For simplicity, let's assume the frontend passes userId returned from register.

            if (!userId) {
                throw new Error("UserID is required for verification");
            }

            const user = await AuthService.verifyUser(userId, otp);

            res.status(200).json({
                success: true,
                message: "Account verified successfully",
                data: user
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, errors: error.issues });
                return;
            }
            res.status(400).json({ success: false, message: error.message });
        }
    }

    /**
     * Handle User Login
     */
    static async login(req: Request, res: Response): Promise<void> {
        try {
            // 1. Validate Input
            const validatedData = LoginSchema.parse(req.body);

            // 2. Call Service
            const result = await AuthService.login(validatedData);

            // 3. Set Cookie (HttpOnly)
            // Note: Secure in production, Lax for local dev
            res.cookie('mobistay_token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            // 4. Send Response
            res.status(200).json({
                success: true,
                message: "Login successful",
                data: result.user
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, errors: error.issues });
                return;
            }
            res.status(401).json({ success: false, message: error.message });
        }
    }


    /**
     * Handle Resend OTP
     */
    static async resendOtp(req: Request, res: Response): Promise<void> {
        try {
            const { email } = ResendOtpSchema.parse(req.body);

            const result = await AuthService.resendOtp(email);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, errors: error.issues });
                return;
            }
            res.status(400).json({ success: false, message: error.message });
        }
    }
}