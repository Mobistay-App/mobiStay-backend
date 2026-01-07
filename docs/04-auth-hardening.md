# Auth Chunk 4: Auth Hardening (Resend, Rate Limiting, Login Checks)

## Overview
This chunk closes the loop on the authentication flows by handling edge cases and security measures:
1.  **Resend OTP**: Users need a way to request a new code if the previous one expired or was lost.
2.  **Login Verification Gate**: Prevent unverified users from logging in (or force them to a verification screen).
3.  **Rate Limiting**: Protect SMS/Email quotas and prevent spam attacks using Upstash Ratelimit.

## 1. New Endpoints
- **POST `/api/auth/resend-otp`**
    - Input: `{ email }` OR `{ userId }`
    - Logic: Check limit -> Generate New OTP -> Send -> Return success.

## 2. Security Updates
- **Login Flow**:
    - Update `AuthService.login` to check `user.isVerified`.
    - If `false`, throw strict error (or specific code) so frontend knows to redirect to `/verify`.

## 3. Rate Limiting Implementation
- **Library**: `@upstash/ratelimit` (already installed).
- **Scope**:
    - `register`: max 3 per hour per IP?
    - `resend-otp`: max 1 per minute, 5 per hour per user.
    - `verify`: max 5 attempts per 10 mins.

## 4. Testing
- Create `test-resend-flow.ts` to verify resend limits and login blocking.
