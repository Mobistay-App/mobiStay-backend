import { prisma } from '../../shared/prisma.js';
import { hashPassword, verifyPassword } from '../../shared/utils/password.js';
import { signJWT } from '../../shared/utils/token.js';
import { RegisterInput, LoginInput } from './auth.schema.js';
import { OtpService } from './otp.service.js';

export class AuthService {

    /**
     * Registers a new user.
     * Checks for existing email/phone, hashes password, and creates the record.
     */
    static async register(data: RegisterInput) {
        const { email, password, role, phone, firstName, lastName } = data;

        // 1. Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { phone: phone || undefined } // Check phone only if provided
                ]
            }
        });

        if (existingUser) {
            throw new Error("User with this email or phone already exists");
        }

        // 2. Hash Password
        const hashedPassword = await hashPassword(password);

        // 3. Create User
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                phone,
                firstName,
                lastName,
                isVerified: false,
            },
        });

        // 4. Generate Initial Token (Optional: usually we wait for verification)
        // For now, we return the user without sensitive data
        const { password: _, ...userWithoutPassword } = newUser;

        // 5. Trigger OTP Generation
        await OtpService.sendOtp(newUser.id, newUser.email, newUser.phone);

        return userWithoutPassword;
    }

    /**
     * Verifies an OTP and updates user status.
     */
    static async verifyUser(userId: string, otp: string) {
        const isValid = await OtpService.verifyOtp(userId, otp);
        if (!isValid) {
            throw new Error("Invalid or expired OTP");
        }

        // Update User ID Status
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                isVerified: true,
                idStatus: 'PENDING' // Move to PENDING for admin approval if Driver/Owner, or APPROVED if Traveler?
                // Spec said: "Redirect to role onboarding".
                // Let's set verified=true. idStatus defaults to UNVERIFIED.
                // If Traveler, maybe auto-approve? Let's keep it simple: Verified=true.
            },
            select: { id: true, role: true, isVerified: true }
        });

        return user;
    }

    /**
     * Resends OTP to a user's email/phone.
     */
    static async resendOtp(email: string) {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw new Error("User not found");
        }

        if (user.isVerified) {
            throw new Error("User is already verified");
        }

        // Logic to throttle could be here, but we'll do it in Controller via Middleware/RateLimiter
        await OtpService.sendOtp(user.id, user.email, user.phone);

        return { message: "OTP sent successfully" };
    }

    /**
     * Authenticates a user.
     * Verifies credentials and issues a JWT.
     */
    static async login(data: LoginInput) {
        const { email, password } = data;

        // 1. Find User
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error("Invalid credentials");
        }

        // 2. Verify Password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            throw new Error("Invalid credentials");
        }

        // 3. Check Verification Status
        if (!user.isVerified) {
            // Option: We could trigger a fresh OTP here, but better to let the client request it via /resend
            throw new Error("Account not verified. Please verify your email/phone.");
        }

        // 4. Generate Token
        const token = await signJWT({
            userId: user.id,
            role: user.role,
            isVerified: user.isVerified
        });

        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
}
