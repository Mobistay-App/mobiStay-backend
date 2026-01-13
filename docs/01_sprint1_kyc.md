# Sprint 1: The Extended Profile & KYC Engine

## Objective
Capture identity documents and personal details required for user verification and platform safety.

## Implemented Features

### 1. User Profile Update
- **Endpoint:** `PATCH /api/users/profile`
- **Logic:** Allows authenticated users to update their bio, avatar, and address.
- **Validation:** Enforces completeness (First Name, Last Name, Address) before allowing document submission.

### 2. Document Submission (Transactional)
- **Endpoint:** `POST /api/users/verify/documents`
- **Role Guards:** Strictly for `OWNER` or `DRIVER` roles.
- **Logic:**
  - **Atomicity:** Uses `prisma.$transaction` to ensure data integrity.
  - **Pre-check:** Verifies user profile completeness.
  - **Upsert:** Creates or updates `OwnerProfile` / `DriverProfile`.
  - **Status Update:** Sets `User.idStatus` to `PENDING`.
  - **Audit:** Logs the submission to `VerificationLog`.

## Models Involved
- `User` (Shared profile data)
- `OwnerProfile` (Ownership docs)
- `DriverProfile` (License & ID)
- `VerificationLog` (Audit trail)
