import { prisma } from './src/shared/prisma.js';
import { hashPassword } from './src/shared/utils/password.js';
import { signJWT } from './src/shared/utils/token.js';
import { RegisterSchema } from './src/modules/auth/auth.schema.js';

// --- SIMULATION SCRIPT ---
// This script simulates exactly what the API will do when a user registers.
// It uses all the pieces we just built: Zod, Bcrypt, Prisma, and Jose.

async function simulateRegistration() {
    console.log("🚀 Starting Registration Simulation...\n");

    // 1. Simulate Input Data (What the frontend sends)
    const rawInput = {
        email: `test_user_${Date.now()}@example.com`, // Unique email every time
        password: "SecurePassword123!",
        role: "TRAVELER",
        phone: `+237${Math.floor(100000000 + Math.random() * 900000000)}` // Unique phone
    };
    console.log("1. Received Input:", rawInput);

    // 2. Validate Data (Zod)
    console.log("2. Validating input with Zod...");
    const validation = RegisterSchema.safeParse(rawInput);

    if (!validation.success) {
        console.error("❌ Validation Failed:", validation.error.format());
        return;
    }
    console.log("✅ Validation passed!");

    // 3. Hash Password (Bcrypt)
    console.log("3. Hashing password...");
    const hashedPassword = await hashPassword(validation.data.password);
    console.log("✅ Password hashed:", hashedPassword.substring(0, 15) + "...");

    // 4. Create User in Database (Prisma)
    console.log("4. Saving to Database (Neon)...");
    try {
        const newUser = await prisma.user.create({
            data: {
                email: validation.data.email,
                password: hashedPassword, // Store the hash, not plain text!
                role: validation.data.role as any,
                phone: validation.data.phone,
                isVerified: false, // Default
            },
            select: {
                id: true,
                email: true,
                role: true,
                isVerified: true,
                createdAt: true
            }
        });
        console.log("✅ User successfully created in DB!");
        console.table(newUser);

        // 5. Generate Token (JWT)
        console.log("5. Generating Session Token...");
        const token = await signJWT({
            userId: newUser.id,
            role: newUser.role,
            isVerified: newUser.isVerified
        });
        console.log("✅ Token generated:", token.substring(0, 20) + "...");

        console.log("\n🎉 SIMULATION COMPLETE: The 'Foundation' is solid.");
        console.log("You can verify this user exists in your Neon DB via Prisma Studio.");

    } catch (error) {
        console.error("❌ Database Error:", error);
    }
}

simulateRegistration();
