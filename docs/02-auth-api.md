# Auth Chunk 2: API Endpoints (Service & Controller)

## Overview
This chunk moves logic from simulation scripts into the actual API architecture:
1.  **Auth Service**: Encapsulates business logic (hashing, DB calls, token generation).
2.  **Auth Controller**: Handles HTTP input/output (Request -> Service -> Response).
3.  **Auth Routes**: Defines API paths (`/register`, `/login`).
4.  **Server Setup**: Configures Express with Middleware (CORS, Helmet, CookieParser).

## 1. Components Created

### Auth Service (`src/modules/auth/auth.service.ts`)
- `register(data)`:
    - Checks for existing user.
    - Hashes password.
    - Creates user in DB.
    - Returns user (without sensitive data).
- `login(data)`:
    - Verifies email & password.
    - Generates JWT.
    - Returns `{ user, token }`.

### Auth Controller (`src/modules/auth/auth.controller.ts`)
- `register`: Validates Zod input, calls Service, sends 201 Created.
- `login`: Validates input, calls Service, sets **HttpOnly Cookie**, sends 200 OK.

### Server Config (`src/app.ts`, `src/server.ts`)
- Initialized Express.
- Added crucial middleware: `cors` (frontend access), `helmet` (security headers), `cookie-parser`.
- Mounted routes at `/api/auth`.

## 2. Verification
We started the server and ran `test-api.ts`.
- **Register**: Created a user ➝ 201 Created.
- **Duplicate**: Rejected duplicate email ➝ 400 Bad Request.
- **Login**: Successful login ➝ 200 OK.
- **Cookies**: Confirmed `mobistay_token` cookie is set with `HttpOnly` and `SameSite=Lax`.

## Usage for Frontend
- **Register**: POST `/api/auth/register`
    - Body: `{ email, password, role, phone? }`
- **Login**: POST `/api/auth/login`
    - Body: `{ email, password }`
    - **Note:** The token is stored in a Cookie, not just the JSON response.

## Next Steps
- **Chunk 3**: SMS/Email OTP (Verification Flow).
