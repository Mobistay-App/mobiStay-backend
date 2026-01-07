# Auth Chunk 3: OTP Verification & Notifications

## Overview
This chunk implements the verification loop:
1.  **OTP Generation**: A 6-digit code is generated upon registration.
2.  **Storage**: The code is stored in Upstash Redis (`auth:otp:{userId}`) with a 5-minute expiry.
3.  **Delivery**: 
    - **Email**: Via `Resend` (or console log in dev).
    - **SMS**: Via `Africa's Talking` (or console log in dev).
4.  **Verification**: A new API endpoint `/verify` validates the code and updates the user's status.

## 1. Components Created

### Services
- **`src/shared/redis.ts`**: Connects to Upstash Redis.
- **`src/services/email.service.ts`**: Handles email sending (with safe fallback if keys missing).
- **`src/services/sms.service.ts`**: Handles SMS sending.
- **`src/modules/auth/otp.service.ts`**: Orchestrates generating, saving, sending, and verifying OTPs.

### API Updates
- **`AuthService.register`**: Now calls `OtpService.sendOtp` automatically.
- **`AuthService.verifyUser`**: New method to validate OTP and set `isVerified = true`.
- **`AuthController.verify`**: Endpoint to handle the verification request.
- **`routes`**: Added `POST /api/auth/verify`.

## 2. Configuration
Added optional keys to `src/config/env.ts`:
- `RESEND_API_KEY`
- `AT_API_KEY`
- `AT_USERNAME`

## 3. How to Test
1.  **Start Server**: `npx tsx src/server.ts`
2.  **Run Test Script**: `npx tsx test-otp-flow.ts`
    - It registers a new user.
    - It automatically fetches the OTP from Redis (simulating you checking your phone).
    - It validates the OTP against the API.

## Checklist for Production
- [ ] Add real API keys to `.env`.
- [ ] Verify Email Domain in Resend Dashboard.
- [ ] Enable Rate Limiting (Upstash) to prevent SMS spam.
