

# 🔐 Mobistay Authentication & Verification Specification (v1.0)

## 1. System Overview
Mobistay uses a **Stateless JWT-based Authentication** system delivered via **Secure HTTP-Only Cookies**. This ensures compatibility with the **Edge Runtime** (via Next.js Middleware) for lightning-fast role-based access control.

### Core Stack
- **Auth Engine:** NextAuth.js v5 (Auth.js)
- **Token Handling:** `jose` (Edge-compatible JWT)
- **Encryption:** `bcryptjs` (Password hashing)
- **Validation:** `Zod` (Schema enforcement)
- **Communication:** Resend (Email), Africa's Talking (SMS)
- **Verification Cache:** Upstash Redis (OTP storage)

---

## 2. The Authentication Flow

### A. Registration Flow (The "Onboarding")
1.  **Request:** User submits `email`, `phone`, `password`, and `role`.
2.  **Validation:** Zod validates the phone format (+237...) and password strength.
3.  **Security:** Password is hashed with `bcryptjs` (Salt rounds: 12).
4.  **Database:** Prisma creates a User record with `isVerified: false` and `idStatus: UNVERIFIED`.
5.  **OTP Trigger:**
    - Generate a 6-digit random code.
    - Store in Redis: `otp:user_id` with 5-minute expiry.
    - Send via SMS (Africa’s Talking) or Email (Resend) based on user's primary contact.

### B. Verification Flow (The "Handshake")
1.  **Input:** User provides the 6-digit OTP.
2.  **Check:** System compares input with the code in Redis.
3.  **Success:** 
    - Prisma updates `User.isVerified = true`.
    - User is redirected to their specific role onboarding (Driver/Owner docs upload).

### C. Login Flow (The "Credential Check")
1.  **Auth.js Provider:** User submits credentials.
2.  **Verification:** Password compared via `bcrypt.compare()`.
3.  **JWT Creation:**
    - A JWT is generated containing: `userId`, `role`, and `isVerified`.
4.  **Cookie Issuance:** 
    - Header: `Set-Cookie: mobistay-auth=...; HttpOnly; Secure; SameSite=Lax;`

---

## 3. Role-Based Authorization Strategy

Access is controlled at the **Edge** to prevent unauthorized users from even hitting the main server.

| Role | Access Level | Requirement |
| :--- | :--- | :--- |
| **TRAVELER** | Search, Book, Profile | `isVerified: true` |
| **DRIVER** | Receive Rides, Wallet | `isVerified: true` AND `idStatus: APPROVED` |
| **OWNER** | List Property, Manage Bookings | `isVerified: true` AND `idStatus: APPROVED` |
| **ADMIN** | System Management, Verification | `role: ADMIN` |

### Middleware Logic (Pseudocode)
```typescript
// middleware.ts
if (path.startsWith('/driver') && token.role !== 'DRIVER') {
  return Redirect('/unauthorized');
}
if (path.startsWith('/driver') && !token.isApproved) {
  return Redirect('/onboarding/pending');
}
```

---

## 4. Implementation Guidelines for Developers/AI

### 1. The "Zod" Standard
Every API route must have a schema. No raw `req.body` usage.
```typescript
const AuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["TRAVELER", "DRIVER", "OWNER"])
});
```

### 2. The Redis OTP Logic
Use a unique key prefix to avoid collisions.
- Key format: `auth:otp:{userId}`
- TTL: 300 seconds (5 minutes).

### 3. Verification Service
Separate the logic for sending SMS and Email into a standalone service (`src/services/notification.service.ts`) to allow for easy switching of providers later.

---
<!-- testing -->

## 5. Testing Strategy (The "No-Mistake" Guide)

We use **Vitest** for unit testing and **Supertest** for API testing.

### A. Unit Tests (Logic Only)
- **Hash Verification:** Test that `bcrypt` correctly identifies a correct vs incorrect password.
- **JWT Content:** Test that the `jose` library generates a token with the correct role inside.
- **Zod Validation:** Pass invalid phone numbers and emails to ensure they are blocked.

### B. Integration Tests (The Flow)
1.  **Test Case 1: The Unauthorized Driver**
    - Create a user with role `TRAVELER`.
    - Attempt to hit `/api/rides/accept`.
    - **Expected:** `403 Forbidden`.
2.  **Test Case 2: OTP Expiry**
    - Generate OTP.
    - Advance time by 6 minutes.
    - Attempt to verify.
    - **Expected:** `400 Bad Request (Expired)`.

### C. Manual Testing with Postman
1.  **Register:** Check that the database contains the hashed password, not the raw one.
2.  **Verify Cookie:** After Login, check the "Cookies" tab in Postman. The `HttpOnly` flag must be checked.
3.  **Test XSS:** Try to access the cookie via the browser console: `document.cookie`. It should return an empty string.

---

## 6. Common Pitfalls to Avoid (Self-Correction for AI)
- ❌ **Storing JWT in LocalStorage:** Never do this. It is vulnerable to XSS.
- ❌ **Generic Error Messages:** Do not say "User not found." Say "Invalid Credentials" to prevent hackers from identifying which emails are registered.
- ❌ **No Rate Limiting on OTP:** Without Upstash Rate Limiting, an attacker can spam SMS and cost you thousands of dollars in Africa's Talking credits.
- ❌ **Hardcoding API Keys:** Ensure all keys (Resend, Africa's Talking) are called via `process.env`.

---

## 7. Next Step: Implementation Order
1.  **Configure Prisma:** Push the `User` and `VerificationToken` models to Neon.
2.  **Setup Utilities:** Write the Bcrypt and JWT helper functions in `src/shared/utils`.
3.  **Build Notification Service:** Connect Africa's Talking and Resend.
4.  **Write Registration Action:** Create the user and trigger the OTP.
5.  **Write Middleware:** Implement the basic "Bouncer" logic to protect routes.

**This document is now ready to be handed to an AI or a Senior Dev to begin coding the `src/modules/auth` directory.**