import 'dotenv/config'; // Force load env vars before anything else
import axios from 'axios';
import { redis } from './src/shared/redis.js';

async function testOtpFlow() {
    const API_URL = 'http://localhost:5000/api/auth';
    const TEST_EMAIL = 'fonyuyjudegita@gmail.com';
    const TEST_PHONE = '+237672792563';
    const TEST_PASSWORD = 'password123';

    try {
        console.log("🚀 Starting OTP Flow Test\n");

        // 1. Register
        console.log("1. Registering User...");
        const regRes = await axios.post(`${API_URL}/register`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            phone: TEST_PHONE,
            role: "DRIVER"
        });

        if (regRes.status !== 201) {
            throw new Error("Registration Failed");
        }
        const userId = regRes.data.data.id;
        console.log(`✅ Registered User ID: ${userId}`);

        // 2. Fetch OTP from Redis (Simulating checking phone/email)
        console.log("2. Fetching OTP from Redis...");
        // Give a small delay for Redis write
        await new Promise(r => setTimeout(r, 2000));
        const otp = await redis.get(`auth:otp:${userId}`);

        if (!otp) {
            throw new Error("OTP not found in Redis! Check .env credentials.");
        }
        console.log(`✅ Found OTP: ${otp}`);

        // 3. Verify OTP
        console.log("3. Verifying OTP...");
        const verifyRes = await axios.post(`${API_URL}/verify`, {
            userId: userId,
            otp: String(otp) // Force string conversion
        });

        if (verifyRes.data.success) {
            console.log("✅ Verification Successful!");
            console.log("   User Verified Status:", verifyRes.data.data.isVerified);
        } else {
            throw new Error("Verification Failed");
        }

        // 4. Cleanup (Optional)
        await redis.del(`auth:otp:${userId}`);

    } catch (error: any) {
        console.error("❌ Test Failed:", error.response?.data || error.message);
    } finally {
        process.exit();
    }
}

testOtpFlow();
