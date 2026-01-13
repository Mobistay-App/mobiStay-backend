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
     * Returns full user data + JWT for immediate session.
     */
    static async verifyUser(userId: string, otp: string) {
        const isValid = await OtpService.verifyOtp(userId, otp);
        if (!isValid) {
            throw new Error("Invalid or expired OTP");
        }

        // Get user to check role
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!existingUser) {
            throw new Error("User not found");
        }

        // Business Logic:
        // - TRAVELER: Automatically approved (no KYC needed for basic usage)
        // - DRIVER/OWNER: Stays PENDING until KYC documents are verified by admin
        const idStatus = existingUser.role === 'TRAVELER' ? 'APPROVED' : 'PENDING';

        // Update User
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                isVerified: true,
                idStatus
            },
        });

        // Generate JWT for immediate session
        const token = await signJWT({
            userId: user.id,
            role: user.role,
            isVerified: user.isVerified
        });

        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
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
