# 📚 Users API Documentation

> **Module:** Users  
> **Base Path:** `/api/users`  
> **Description:** User profile and KYC verification management  
> **Last Updated:** January 17, 2026

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication Requirements](#authentication-requirements)
3. [Data Models](#data-models)
4. [Endpoints](#endpoints)
   - [GET /api/users/profile](#get-apiusersprofile)
   - [PATCH /api/users/profile](#patch-apiusersprofile)
   - [POST /api/users/verify/documents](#post-apiusersverifydocuments)
5. [Error Handling](#error-handling)
6. [Admin Section Integration Guide](#admin-section-integration-guide)
7. [Testing Examples](#testing-examples)

---

## 🎯 Overview

The Users module handles:
- **Profile Management:** Retrieving and updating user profile information
- **KYC (Know Your Customer) Verification:** Submitting verification documents for Owners and Drivers
- **Identity Status Tracking:** Managing user verification statuses (`UNVERIFIED`, `PENDING`, `APPROVED`, `REJECTED`)

### User Roles in the System
| Role | Description | Can Submit Documents |
|------|-------------|---------------------|
| `TRAVELER` | Standard user booking stays | ❌ No |
| `OWNER` | Property owner listing stays | ✅ Yes |
| `DRIVER` | Driver offering rides | ✅ Yes |
| `ADMIN` | Platform administrator | ❌ No (manages others) |

---

## 🔐 Authentication Requirements

All endpoints in this module require authentication via **JWT token in HTTP-only cookies**.

### Cookie Name
```
token
```

### How Authentication Works
1. User logs in via `/api/auth/login`
2. Server sets `token` cookie with JWT
3. All subsequent requests automatically include the cookie
4. Server middleware validates the token and attaches `req.user`

### Token Payload Structure
```typescript
interface JWTPayload {
  userId: string;     // CUID format (e.g., "clx1abc123def")
  role: UserRole;     // "TRAVELER" | "OWNER" | "DRIVER" | "ADMIN"
  iat: number;        // Issued at timestamp
  exp: number;        // Expiration timestamp
}
```

---

## 📊 Data Models

### User Model
```typescript
interface User {
  id: string;                    // CUID primary key
  email: string | null;          // Unique, nullable
  phone: string | null;          // Unique, nullable
  firstName: string | null;      // User's first name
  lastName: string | null;       // User's last name
  avatarUrl: string | null;      // Profile picture URL
  bio: string | null;            // Max 240 characters
  address: string | null;        // User's address
  role: UserRole;                // TRAVELER | OWNER | DRIVER | ADMIN
  isVerified: boolean;           // Phone/email verified via OTP
  idStatus: VerificationStatus;  // KYC verification status
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  
  // Relations (populated when requested)
  ownerProfile?: OwnerProfile;
  driverProfile?: DriverProfile;
}
```

### Owner Profile Model
```typescript
interface OwnerProfile {
  id: string;
  userId: string;
  idCardUrl: string | null;       // Front of ID card
  idBackUrl: string | null;       // Back of ID card
  selfieWithIdUrl: string | null; // Selfie holding ID
  ownershipDocUrl: string | null; // Property ownership document
  verificationNote: string | null;
}
```

### Driver Profile Model
```typescript
interface DriverProfile {
  id: string;
  userId: string;
  licenseNumber: string;          // Driver's license number (unique)
  licenseImageUrl: string | null; // Photo of license
  vehicleModel: string | null;
  vehiclePlate: string | null;    // License plate (unique)
  vehicleColor: string | null;
  vehicleType: string | null;
  idCardUrl: string | null;       // Front of ID card
  idBackUrl: string | null;       // Back of ID card
  selfieWithIdUrl: string | null; // Selfie holding ID
  insuranceDocUrl: string | null; // Vehicle insurance document
  isOnline: boolean;              // Driver availability status
}
```

### Enums

```typescript
enum UserRole {
  TRAVELER = "TRAVELER",
  OWNER = "OWNER",
  DRIVER = "DRIVER",
  ADMIN = "ADMIN"
}

enum VerificationStatus {
  UNVERIFIED = "UNVERIFIED", // Initial state
  PENDING = "PENDING",       // Documents submitted, awaiting review
  APPROVED = "APPROVED",     // Admin approved
  REJECTED = "REJECTED"      // Admin rejected
}
```

---

## 🛠️ Endpoints

---

### GET /api/users/profile

**Summary:** Get the authenticated user's full profile including related Owner/Driver profile if exists.

#### Request

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/api/users/profile` |
| **Authentication** | ✅ Required |
| **Content-Type** | - |

#### Headers
```http
Cookie: token=<JWT_TOKEN>
```

#### Request Body
```
None
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "clx1abc123def456",
    "email": "user@example.com",
    "phone": "+237691234567",
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "bio": "Property owner in Douala",
    "address": "123 Main Street, Douala",
    "role": "OWNER",
    "isVerified": true,
    "idStatus": "APPROVED",
    "createdAt": "2026-01-15T10:30:00.000Z",
    "ownerProfile": {
      "id": "clx2owner789",
      "userId": "clx1abc123def456",
      "idCardUrl": "/uploads/id_front_123.jpg",
      "idBackUrl": "/uploads/id_back_123.jpg",
      "selfieWithIdUrl": "/uploads/selfie_123.jpg",
      "ownershipDocUrl": "/uploads/ownership_123.pdf",
      "verificationNote": null
    },
    "driverProfile": null
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 401 | "Authentication required" | No token or invalid token |
| 401 | "User not found" | Token valid but user deleted |

```json
{
  "success": false,
  "message": "Authentication required"
}
```

#### Frontend Integration Notes

For the **Admin Dashboard**, when displaying a user's profile:

```typescript
// React/Next.js example
const fetchUserProfile = async () => {
  const response = await fetch('/api/users/profile', {
    method: 'GET',
    credentials: 'include', // Important: sends cookies
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  
  return response.json();
};

// Display verification status badge
const getStatusBadge = (idStatus: VerificationStatus) => {
  const statusConfig = {
    UNVERIFIED: { color: 'gray', label: 'Not Verified' },
    PENDING: { color: 'yellow', label: 'Pending Review' },
    APPROVED: { color: 'green', label: 'Verified' },
    REJECTED: { color: 'red', label: 'Rejected' },
  };
  return statusConfig[idStatus];
};
```

---

### PATCH /api/users/profile

**Summary:** Update the authenticated user's profile information.

#### Request

| Property | Value |
|----------|-------|
| **Method** | `PATCH` |
| **URL** | `/api/users/profile` |
| **Authentication** | ✅ Required |
| **Content-Type** | `application/json` |

#### Headers
```http
Cookie: token=<JWT_TOKEN>
Content-Type: application/json
```

#### Request Body Schema

All fields are **optional**. Only provide the fields you want to update.

```typescript
interface UpdateProfileRequest {
  firstName?: string;  // Min 2 characters
  lastName?: string;   // Min 2 characters
  bio?: string;        // Max 240 characters
  avatarUrl?: string;  // Valid URL or file path
  address?: string;    // Min 5 characters
}
```

#### Example Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Experienced property owner with 5 properties in Douala",
  "avatarUrl": "/uploads/avatar_123.jpg",
  "address": "456 New Street, Yaoundé, Cameroon"
}
```

#### Validation Rules

| Field | Type | Validation | Error Message |
|-------|------|------------|---------------|
| firstName | string | min length: 2 | "First name too short" |
| lastName | string | min length: 2 | "Last name too short" |
| bio | string | max length: 240 | "Bio must be 240 characters or less" |
| avatarUrl | string | valid URL format | - |
| address | string | min length: 5 | "Address too short" |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "clx1abc123def456",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": "/uploads/avatar_123.jpg",
    "bio": "Experienced property owner with 5 properties in Douala",
    "address": "456 New Street, Yaoundé, Cameroon",
    "role": "OWNER",
    "isVerified": true,
    "idStatus": "APPROVED"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Validation errors array | Invalid input data |
| 401 | "Authentication required" | No token or invalid token |

**Validation Error Example:**
```json
{
  "success": false,
  "errors": [
    {
      "code": "too_small",
      "minimum": 2,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "First name too short",
      "path": ["firstName"]
    }
  ]
}
```

#### Frontend Integration Notes

```typescript
// React form submission example
const updateProfile = async (profileData: UpdateProfileRequest) => {
  const response = await fetch('/api/users/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(profileData),
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    // Handle validation errors
    if (result.errors) {
      result.errors.forEach((error) => {
        console.error(`${error.path.join('.')}: ${error.message}`);
      });
    }
    throw new Error(result.message || 'Update failed');
  }
  
  return result.data;
};
```

---

### POST /api/users/verify/documents

**Summary:** Submit KYC verification documents. The endpoint automatically routes to the appropriate document schema based on the user's role.

#### Access Control

| Role | Access | Notes |
|------|--------|-------|
| `TRAVELER` | ❌ Forbidden | Travelers don't need KYC |
| `OWNER` | ✅ Allowed | Must submit Owner documents |
| `DRIVER` | ✅ Allowed | Must submit Driver documents |
| `ADMIN` | ❌ Forbidden | Admins verify others |

#### Request

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | `/api/users/verify/documents` |
| **Authentication** | ✅ Required |
| **Roles** | `OWNER`, `DRIVER` only |
| **Content-Type** | `application/json` |

#### Headers
```http
Cookie: token=<JWT_TOKEN>
Content-Type: application/json
```

#### Pre-Requisites (IMPORTANT!)

⚠️ **Before submitting documents, the user's profile MUST have:**
- `firstName` (not null)
- `lastName` (not null)
- `address` (not null)

If any of these are missing, the API will return:
```json
{
  "success": false,
  "message": "Profile incomplete. Please update your profile (First Name, Last Name, Address) before submitting documents."
}
```

---

#### Request Body Schema - OWNER

```typescript
interface OwnerDocumentsRequest {
  idCardUrl: string;       // Required - Front of ID card
  idBackUrl: string;       // Required - Back of ID card
  selfieWithIdUrl: string; // Required - Selfie holding ID
  ownershipDocUrl: string; // Required - Property ownership doc
}
```

**Example for OWNER:**
```json
{
  "idCardUrl": "/uploads/owner_id_front_123.jpg",
  "idBackUrl": "/uploads/owner_id_back_123.jpg",
  "selfieWithIdUrl": "/uploads/owner_selfie_123.jpg",
  "ownershipDocUrl": "/uploads/ownership_doc_123.pdf"
}
```

#### Request Body Schema - DRIVER

```typescript
interface DriverDocumentsRequest {
  idCardUrl: string;        // Required - Front of ID card
  idBackUrl: string;        // Required - Back of ID card
  selfieWithIdUrl: string;  // Required - Selfie holding ID
  licenseImageUrl: string;  // Required - Driver's license photo
  licenseNumber: string;    // Required - License number (min 5 chars)
  insuranceDocUrl: string;  // Required - Vehicle insurance
}
```

**Example for DRIVER:**
```json
{
  "idCardUrl": "/uploads/driver_id_front_456.jpg",
  "idBackUrl": "/uploads/driver_id_back_456.jpg",
  "selfieWithIdUrl": "/uploads/driver_selfie_456.jpg",
  "licenseImageUrl": "/uploads/license_456.jpg",
  "licenseNumber": "DL-2026-123456",
  "insuranceDocUrl": "/uploads/insurance_456.pdf"
}
```

#### Validation Rules

**Owner Documents:**
| Field | Type | Validation | Error Message |
|-------|------|------------|---------------|
| idCardUrl | string | Must be valid URL | "ID Card front must be a valid URL" |
| idBackUrl | string | Must be valid URL | "ID Card back must be a valid URL" |
| selfieWithIdUrl | string | Must be valid URL | "Selfie with ID must be a valid URL" |
| ownershipDocUrl | string | Must be valid URL | "Ownership document must be a valid URL" |

**Driver Documents:**
| Field | Type | Validation | Error Message |
|-------|------|------------|---------------|
| idCardUrl | string | Must be valid URL | "ID Card front must be a valid URL" |
| idBackUrl | string | Must be valid URL | "ID Card back must be a valid URL" |
| selfieWithIdUrl | string | Must be valid URL | "Selfie with ID must be a valid URL" |
| licenseImageUrl | string | Must be valid URL | "License image must be a valid URL" |
| licenseNumber | string | min length: 5 | "License number too short" |
| insuranceDocUrl | string | Must be valid URL | "Insurance document must be a valid URL" |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Documents submitted successfully. Your verification is now PENDING.",
  "data": {
    "id": "clx1abc123def456",
    "role": "OWNER",
    "idStatus": "PENDING",
    "ownerProfile": {
      "id": "clx2owner789",
      "userId": "clx1abc123def456",
      "idCardUrl": "/uploads/owner_id_front_123.jpg",
      "idBackUrl": "/uploads/owner_id_back_123.jpg",
      "selfieWithIdUrl": "/uploads/owner_selfie_123.jpg",
      "ownershipDocUrl": "/uploads/ownership_doc_123.pdf"
    }
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 400 | "Profile incomplete..." | Missing firstName, lastName, or address |
| 400 | Validation errors array | Invalid document URLs |
| 401 | "Authentication required" | No token or invalid token |
| 403 | "Only OWNERs and DRIVERs can submit verification documents" | Wrong role |

#### What Happens Behind the Scenes

1. **Profile Completeness Check:** Validates `firstName`, `lastName`, `address` exist
2. **Document Storage:** Creates/updates `OwnerProfile` or `DriverProfile`
3. **Status Update:** Sets `user.idStatus` to `PENDING`
4. **Audit Log:** Creates a `VerificationLog` entry for compliance tracking

```sql
-- Audit log entry created:
INSERT INTO VerificationLog (userId, previousStatus, newStatus, reason)
VALUES ('user_id', 'UNVERIFIED', 'PENDING', 'Owner documents submitted');
```

---

## ⚠️ Error Handling

### Standard Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  message?: string;
  errors?: ZodError[]; // For validation errors
}

interface ZodError {
  code: string;
  message: string;
  path: string[];
  minimum?: number;
  maximum?: number;
}
```

### HTTP Status Codes

| Status | Meaning | When to Expect |
|--------|---------|----------------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Validation error or business logic error |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | User lacks required role/permissions |
| 500 | Internal Error | Server-side error (rare) |

---

## 🖥️ Admin Section Integration Guide

This section provides specific guidance for frontend developers building the **Admin Dashboard**.

### Viewing Users for Moderation

Although the `/api/users/profile` endpoint only returns the **current user's** profile, the Admin section needs endpoints to list and manage **all users**.

#### Recommended Admin Flow

```
┌──────────────────┐     ┌───────────────────────┐     ┌────────────────────┐
│  Admin Dashboard │────▶│ GET /api/admin/users  │────▶│  User List Display │
│                  │     │ (needs implementation)│     │                    │
└──────────────────┘     └───────────────────────┘     └────────────────────┘
         │                                                      │
         │                                                      ▼
         │                                          ┌────────────────────┐
         │                                          │  Click on User     │
         │                                          └────────────────────┘
         │                                                      │
         ▼                                                      ▼
┌──────────────────┐                                ┌────────────────────┐
│ Admin Actions:   │                                │  User Detail View  │
│ • Approve User   │◀───────────────────────────────│  • Profile Info    │
│ • Reject User    │                                │  • Documents       │
│ • View Documents │                                │  • Status History  │
└──────────────────┘                                └────────────────────┘
```

### User Verification Status Display

For the Admin Dashboard, display user verification status with clear visual indicators:

```tsx
// StatusBadge.tsx
type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED';

const StatusBadge = ({ status }: { status: VerificationStatus }) => {
  const config = {
    UNVERIFIED: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      icon: '○',
      label: 'Not Verified'
    },
    PENDING: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      icon: '⏳',
      label: 'Pending Review'
    },
    APPROVED: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: '✓',
      label: 'Verified'
    },
    REJECTED: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: '✕',
      label: 'Rejected'
    }
  };

  const { bg, text, icon, label } = config[status];

  return (
    <span className={`${bg} ${text} px-3 py-1 rounded-full text-sm font-medium`}>
      {icon} {label}
    </span>
  );
};
```

### Document Review Modal

When an Admin clicks to review a user's documents:

```tsx
// DocumentReviewModal.tsx
interface UserDocuments {
  ownerProfile?: {
    idCardUrl: string;
    idBackUrl: string;
    selfieWithIdUrl: string;
    ownershipDocUrl: string;
  };
  driverProfile?: {
    idCardUrl: string;
    idBackUrl: string;
    selfieWithIdUrl: string;
    licenseImageUrl: string;
    licenseNumber: string;
    insuranceDocUrl: string;
  };
}

const DocumentReviewModal = ({ 
  user, 
  onApprove, 
  onReject 
}: { 
  user: User & UserDocuments;
  onApprove: () => void;
  onReject: (reason: string) => void;
}) => {
  const docs = user.role === 'OWNER' ? user.ownerProfile : user.driverProfile;
  
  if (!docs) return <p>No documents submitted</p>;

  return (
    <div className="document-grid">
      <h3>ID Card (Front)</h3>
      <img src={docs.idCardUrl} alt="ID Front" />
      
      <h3>ID Card (Back)</h3>
      <img src={docs.idBackUrl} alt="ID Back" />
      
      <h3>Selfie with ID</h3>
      <img src={docs.selfieWithIdUrl} alt="Selfie" />
      
      {user.role === 'OWNER' && (
        <>
          <h3>Ownership Document</h3>
          <a href={user.ownerProfile.ownershipDocUrl} target="_blank">
            View Document
          </a>
        </>
      )}
      
      {user.role === 'DRIVER' && (
        <>
          <h3>Driver's License</h3>
          <img src={user.driverProfile.licenseImageUrl} alt="License" />
          <p>License #: {user.driverProfile.licenseNumber}</p>
          
          <h3>Insurance Document</h3>
          <a href={user.driverProfile.insuranceDocUrl} target="_blank">
            View Insurance
          </a>
        </>
      )}
      
      <div className="actions">
        <button onClick={onApprove} className="btn-success">
          ✓ Approve
        </button>
        <button onClick={() => onReject('Documents unclear')} className="btn-danger">
          ✕ Reject
        </button>
      </div>
    </div>
  );
};
```

### Admin Verify User Endpoint

See **[Admin API Documentation](./API_ADMIN.md)** for the endpoint to approve/reject users:

```
PATCH /api/admin/users/:id/verify
```

---

## 🧪 Testing Examples

### cURL Examples

#### Get Profile
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

#### Update Profile
```bash
curl -X PATCH http://localhost:3000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Property owner in Douala"
  }'
```

#### Submit Owner Documents
```bash
curl -X POST http://localhost:3000/api/users/verify/documents \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_OWNER_JWT_TOKEN" \
  -d '{
    "idCardUrl": "/uploads/id_front.jpg",
    "idBackUrl": "/uploads/id_back.jpg",
    "selfieWithIdUrl": "/uploads/selfie.jpg",
    "ownershipDocUrl": "/uploads/ownership.pdf"
  }'
```

#### Submit Driver Documents
```bash
curl -X POST http://localhost:3000/api/users/verify/documents \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_DRIVER_JWT_TOKEN" \
  -d '{
    "idCardUrl": "/uploads/id_front.jpg",
    "idBackUrl": "/uploads/id_back.jpg",
    "selfieWithIdUrl": "/uploads/selfie.jpg",
    "licenseImageUrl": "/uploads/license.jpg",
    "licenseNumber": "DL-2026-123456",
    "insuranceDocUrl": "/uploads/insurance.pdf"
  }'
```

### JavaScript/TypeScript Examples

```typescript
// API Client for Users Module
class UsersAPI {
  private baseUrl = '/api/users';

  async getProfile(): Promise<User> {
    const res = await fetch(`${this.baseUrl}/profile`, {
      credentials: 'include',
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  async updateProfile(updates: Partial<UpdateProfileRequest>): Promise<User> {
    const res = await fetch(`${this.baseUrl}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!data.success) {
      if (data.errors) {
        throw new ValidationError(data.errors);
      }
      throw new Error(data.message);
    }
    return data.data;
  }

  async submitDocuments(documents: OwnerDocuments | DriverDocuments): Promise<User> {
    const res = await fetch(`${this.baseUrl}/verify/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(documents),
    });
    const data = await res.json();
    if (!data.success) {
      if (data.errors) {
        throw new ValidationError(data.errors);
      }
      throw new Error(data.message);
    }
    return data.data;
  }
}
```

---

## 📎 Related Documentation

- **[Admin API Documentation](./API_ADMIN.md)** - Admin verification endpoints
- **[Auth API Documentation](./02-auth-api.md)** - Login/registration endpoints
- **[Upload API Documentation](./API_UPLOAD.md)** - File upload endpoints

---

*Documentation generated for Mobistay Backend v1.0*
