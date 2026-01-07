import axios from 'axios';

async function testResendAndHardening() {
    const API_URL = 'http://localhost:5006/api/auth';
    const TEST_EMAIL = `fonyuyjudegita+${Date.now()}@gmail.com`;
    const TEST_PASSWORD = 'password123';

    try {
        console.log("🚀 Starting Auth Hardening Test\n");

        // 1. Register a new user
        console.log("1. Registering User...");
        await axios.post(`${API_URL}/register`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            phone: `+2376${Math.floor(10000000 + Math.random() * 90000000)}`,
            role: "TRAVELER"
        });
        console.log("✅ User registered (unverified)");

        // 2. Try to Login before verification
        console.log("2. Attempting Login (should fail)...");
        try {
            await axios.post(`${API_URL}/login`, {
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            });
            console.log("❌ Error: Login succeeded for unverified user!");
        } catch (error: any) {
            console.log(`✅ Login blocked: ${error.response?.data.message}`);
        }

        // 3. Test Resend OTP
        console.log("3. Testing Resend OTP...");
        const resendRes = await axios.post(`${API_URL}/resend-otp`, {
            email: TEST_EMAIL
        });
        if (resendRes.data.success) {
            console.log("✅ Resend OTP success message:", resendRes.data.message);
        }

        // 4. Test Rate Limiting Trigger (OTP)
        console.log("4. Testing Rate Limiting (OTP Resend)...");
        console.log("   (Firing 5 requests rapidly, limit is 3 per 10m)");

        for (let i = 0; i < 5; i++) {
            try {
                const res = await axios.post(`${API_URL}/resend-otp`, { email: TEST_EMAIL });
                console.log(`   Attempt ${i + 1}: ${res.status} OK`);
            } catch (error: any) {
                if (error.response?.status === 429) {
                    console.log(`   Attempt ${i + 1}: ✅ Rate Limited (429)`);
                } else {
                    console.log(`   Attempt ${i + 1}: ❌ Unexpected Error: ${error.message}`);
                }
            }
        }

    } catch (error: any) {
        console.error("❌ Test Script Failed:", error.response?.data || error.message);
    } finally {
        process.exit();
    }
}

testResendAndHardening();
