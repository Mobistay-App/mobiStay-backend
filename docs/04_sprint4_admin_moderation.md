# Sprint 4: Admin Moderation & Oversight

## Objective
Provide Admins with tools to verify users and maintain platform quality.

## Implemented Features

### 1. Global Verification Handler
- **Endpoint:** `PATCH /api/admin/users/:id/verify`
- **Guards:** `ADMIN` role.
- **Inputs:** `status` (APPROVED/REJECTED), `reason`.
- **Logic:**
  1.  **Status Update:** Sets `idStatus` and `isVerified` (true/false).
  2.  **Audit Log:** Records the decision in `VerificationLog`.
  3.  **Notifications:**
      - **Email:** Uses Nodemailer (Mock/SMTP) to email the user.
      - **SMS:** Uses Africa's Talking (Mock/API) to text the user.

## Infrastructure
- **Services:** `EmailService`, `SmsService`, `AdminService`.
- **Security:** Strict RBAC middleware prevents unauthorized access.
