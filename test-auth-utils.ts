import { hashPassword, verifyPassword } from './src/shared/utils/password.js';
import { signJWT, verifyJWT } from './src/shared/utils/token.js';
import { RegisterSchema } from './src/modules/auth/auth.schema.js';

// Note: Imports using .js because of "type": "module" in package.json if applicable, 
// or for tsx execution. Adjusting to relative paths.

async function runTests() {
    console.log("--- Testing Password Utils ---");
    const pwd = "mySuperSecretPassword";
    const hash = await hashPassword(pwd);
    console.log("Hash generated:", hash.substring(0, 20) + "...");
    const isValid = await verifyPassword(pwd, hash);
    console.log("Password match (true expected):", isValid);
    const isInvalid = await verifyPassword("wrong", hash);
    console.log("Password mismatch (false expected):", isInvalid);

    console.log("\n--- Testing JWT Utils ---");
    const payload = { userId: "123", role: "ADMIN" };
    const token = await signJWT(payload);
    console.log("Token generated:", token.substring(0, 20) + "...");
    const decoded = await verifyJWT(token);
    console.log("Decoded payload:", decoded);

    console.log("\n--- Testing Zod Schema ---");
    const validUser = { email: "test@example.com", password: "password123", role: "DRIVER" };
    const parsed = RegisterSchema.safeParse(validUser);
    console.log("Valid User Parse Success (true expected):", parsed.success);

    const invalidUser = { email: "bad-email", password: "123" };
    const parsedInvalid = RegisterSchema.safeParse(invalidUser);
    console.log("Invalid User Parse Success (false expected):", parsedInvalid.success);
    if (!parsedInvalid.success) {
        console.log("Errors:", parsedInvalid.error.issues.map(e => e.message));
    }
}

runTests().catch(console.error);
