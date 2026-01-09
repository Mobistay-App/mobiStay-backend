# 🔐 Testing Authentication Flow

This guide provides step-by-step instructions for testing the Mobistay authentication flow using the API documentation or a tool like Postman.

## 🚀 API Documentation
All endpoints are documented and can be tested directly at:
`https://mobistay-backend.onrender.com/docs` (Production)
`http://localhost:5000/docs` (Local)

---

## 🛠 Flow 1: Registration

1.  **Endpoint**: `POST /api/auth/register`
2.  **Request Body**:
    ```json
    {
      "email": "testuser@gmail.com",
      "password": "Password123!",
      "phone": "+237600000000",
      "firstName": "John",
      "lastName": "Doe",
      "role": "TRAVELER"
    }
    ```
3.  **Expected Response**:
    - `201 Created`
    - `message`: "User registered successfully. Please check your email for the OTP."
    - Copy the `id` from the response `data`.

---

## 📧 Flow 2: OTP Verification

Currently, OTP is sent **ONLY via Email** (Gmail).

1.  **Endpoint**: `POST /api/auth/verify`
2.  **Request Body**:
    ```json
    {
      "email": "testuser@gmail.com", // You can use EMAIL instead of userId now!
      "otp": "123456" 
    }
    ```
    *(Note: You can find the actual 6-digit code in the backend terminal logs or your email)*.
3.  **Expected Response**:
    - `200 OK`
    - `message`: "Account verified successfully"
    - `idStatus`: "APPROVED" (Automatically set for developer ease!)

---

## 🔑 Flow 3: Login

1.  **Endpoint**: `POST /api/auth/login`
2.  **Request Body**:
    ```json
    {
      "email": "testuser@gmail.com",
      "password": "Password123!"
    }
    ```
2.  **Behavior**:
    - The server will set an `HttpOnly` cookie named `mobistay_token`.
    - Future requests to protected routes will automatically include this token.
3.  **Expected Response**:
    - `200 OK`
    - `message`: "Login successful"

---

## 🔄 Flow 4: Resend OTP

1.  **Endpoint**: `POST /api/auth/resend-otp`
2.  **Request Body**:
    ```json
    {
      "email": "testuser@gmail.com"
    }
    ```
2.  **Expected Response**:
    - `200 OK`
    - `message`: "OTP sent successfully"

---

## 🧹 Database Cleanup
To reset the database for fresh testing, you can run:
`npx prisma migrate reset --force`
*(Warning: This deletes all data!)*
