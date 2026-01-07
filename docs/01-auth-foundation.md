# Auth Chunk 1: Foundation, Database & Utilities

## Overview
This builds the bedrock of the authentication system:
1.  **Database**: `User` and `VerificationToken` models pushed to Neon (PostgreSQL).
2.  **Validation**: Zod schemas for strict type safety (`auth.schema.ts`).
3.  **Security Utilities**: 
    - `password.ts`: Bcryptjs wrappers for hashing.
    - `token.ts`: Jose (JWT) wrappers for Edge-compatible token signing.

## 1. Database Schema
Verified `prisma/schema.prisma` aligns with requirements:
- `User` model includes `isVerified`, `role`, `idStatus`.
- `role` is an Enum (`TRAVELER`, `DRIVER`, `OWNER`, `ADMIN`).
- Schema was pushed to Neon using `npx prisma db push`.

## 2. Utilities Implemented
Location: `src/shared/utils/`

### Password (`password.ts`)
- `hashPassword(text)`: Returns bcrypt hash (salt 12).
- `verifyPassword(text, hash)`: Returns boolean.

### Token (`token.ts`)
- `signJWT(payload)`: Returns a signed HS256 JWT, valid for 7 days.
- `verifyJWT(token)`: Returns payload or `null` if invalid.
- **Key**: Uses `JWT_SECRET` from `.env`.

### Validation (`auth.schema.ts`)
Location: `src/modules/auth/`
- `RegisterSchema`: Enforces email, password min length, optional phone/names.
- `LoginSchema`: Simple email/password check.
- `OtpSchema`: Enforces 6-digit OTP code.

## 3. Verification
A test script `test-auth-utils.ts` was run to verify all utilities:
- Hashing works correctly.
- Tokens can be signed and verified.
- Zod correctly rejects invalid inputs (bad email, short password).

## Usage
Import utilities from shared folder:
```typescript
import { hashPassword } from '../../shared/utils/password.js';
import { RegisterSchema } from '../auth/auth.schema.js';
```

## Next Steps
- Implement **Registration Logic** (Service & Controller).
- Integrate **OTP System** (Redis + Email/SMS).
