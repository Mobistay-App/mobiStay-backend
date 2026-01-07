import { z } from 'zod';

// Schema for User Registration
export const RegisterSchema = z.object({
    email: z.string().email("Invalid email format"),
    // Allowing phone to be optional or string. Add regex for Cameroon numbers if needed (+237...)
    phone: z.string().min(9, "Phone number is too short").optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["TRAVELER", "DRIVER", "OWNER"]).default("TRAVELER"),
    firstName: z.string().min(2, "First name too short").optional(),
    lastName: z.string().min(2, "Last name too short").optional(),
});

// Schema for User Login
export const LoginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

// Schema for OTP Verification
export const OtpSchema = z.object({
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
    // We might receive userId or email to identify *who* is verifying
    userId: z.string().cuid().optional(),
    email: z.string().email().optional(),
}).refine(data => data.userId || data.email, {
    message: "Either userId or email must be provided",
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type OtpInput = z.infer<typeof OtpSchema>;

export const ResendOtpSchema = z.object({
    email: z.string().email("Invalid email format"),
});
export type ResendOtpInput = z.infer<typeof ResendOtpSchema>;
