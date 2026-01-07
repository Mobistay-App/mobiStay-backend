# Mobistay Backend 🚀

The backend API for Mobistay, built with Node.js, Express, Prisma, and PostgreSQL.

## 🛠 Tech Stack
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon.tech)
- **ORM**: Prisma
- **Auth**: JWT, BcryptJS
- **Verification**: OTP (Email via Nodemailer/Gmail, SMS via Africa's Talking)
- **Cache/Rate Limiting**: Upstash Redis

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd mobistay-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Fill in your credentials for Database, Redis, SMTP, and Africa's Talking.

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 5. Start the server
```bash
# Development mode
npx tsx src/server.ts
```

## 🧪 Testing
- `npx tsx test-otp-flow.ts`: Test standard registration and OTP verification.
- `npx tsx test-resend-flow.ts`: Test resend OTP and auth hardening (rate limiting, login protection).

## 🔒 Security Features
- **Rate Limiting**: IP-based limits on Register, Login, and OTP requests.
- **Login Gate**: Only verified users can authenticate.
- **Secure Cookies**: HttpOnly cookies for JWT storage.
- **Data Validation**: Strict input validation using Zod.

## 📄 License
ISC
