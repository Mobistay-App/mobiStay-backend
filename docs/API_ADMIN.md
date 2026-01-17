# 🔐 Admin API Documentation

> **Module:** Admin  
> **Base Path:** `/api/admin`  
> **Description:** Administrative actions for user verification and platform management  
> **Last Updated:** January 17, 2026

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Models](#data-models)
4. [Endpoints](#endpoints)
   - [PATCH /api/admin/users/:id/verify](#patch-apiadminusersidverify)
5. [Verification Workflow](#verification-workflow)
6. [Admin Dashboard Implementation Guide](#admin-dashboard-implementation-guide)
7. [Notifications System](#notifications-system)
8. [Audit Logging](#audit-logging)
9. [Testing Examples](#testing-examples)

---

## 🎯 Overview

The Admin module provides endpoints for platform administrators to:

- **Verify/Reject Users:** Approve or reject KYC document submissions from Owners and Drivers
- **Audit Trail:** All verification actions are logged for compliance
- **Automated Notifications:** Users are notified via email/SMS when their status changes

### Admin Responsibilities

| Action | Description | Notification |
|--------|-------------|--------------|
| Approve User | Mark user as verified, grant full platform access | ✅ Email + SMS |
| Reject User | Reject documents with reason, user must resubmit | ✅ Email + SMS |
| Review Documents | View submitted KYC documents | - |

---

## 🔐 Authentication & Authorization

### Requirements

1. **Authentication:** Valid JWT token in `token` cookie
2. **Authorization:** User must have `role: "ADMIN"`

### Middleware Chain

```
Request → authenticate → requireRole('ADMIN') → AdminController
```

### Access Denied Response (Non-Admin)

```json
{
  "success": false,
  "message": "Access denied. ADMIN role required."
}
```

---

## 📊 Data Models

### VerificationLog Model

Every verification action creates an audit log entry:

```typescript
interface VerificationLog {
  id: string;                    // CUID primary key
  userId: string;                // Target user's ID
  adminId: string | null;        // Admin who performed action (null if user-initiated)
  previousStatus: VerificationStatus;
  newStatus: VerificationStatus;
  reason: string | null;         // Reason for rejection
  createdAt: Date;
}
```

### Verification Status Flow

```
┌─────────────┐      User Submits      ┌─────────┐
│ UNVERIFIED  │─────────────────────▶  │ PENDING │
└─────────────┘                        └─────────┘
                                            │
                          ┌─────────────────┴─────────────────┐
                          │                                   │
                    Admin Approves                      Admin Rejects
                          │                                   │
                          ▼                                   ▼
                    ┌──────────┐                        ┌──────────┐
                    │ APPROVED │                        │ REJECTED │
                    └──────────┘                        └──────────┘
                                                              │
                                                    User Resubmits
                                                              │
                                                              ▼
                                                        ┌─────────┐
                                                        │ PENDING │
                                                        └─────────┘
```

---

## 🛠️ Endpoints

---

### PATCH /api/admin/users/:id/verify

**Summary:** Approve or reject a user's KYC verification request. This is the primary endpoint for Admin moderation.

#### Request

| Property | Value |
|----------|-------|
| **Method** | `PATCH` |
| **URL** | `/api/admin/users/:id/verify` |
| **Authentication** | ✅ Required |
| **Authorization** | `ADMIN` role only |
| **Content-Type** | `application/json` |

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | The target user's ID (CUID format) |

#### Headers

```http
Cookie: token=<ADMIN_JWT_TOKEN>
Content-Type: application/json
```

#### Request Body Schema

```typescript
interface VerifyUserRequest {
  status: 'APPROVED' | 'REJECTED';  // Required
  reason?: string;                   // Optional (recommended for REJECTED)
}
```

#### Validation Rules

| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| status | enum | Must be `APPROVED` or `REJECTED` | Case-sensitive |
| reason | string | Optional | Highly recommended when rejecting |

#### Example Request - Approve User

```json
{
  "status": "APPROVED"
}
```

#### Example Request - Reject User

```json
{
  "status": "REJECTED",
  "reason": "ID card image is blurry and unreadable. Please upload a clearer photo."
}
```

#### Success Response (200 OK)

**When Approving:**
```json
{
  "success": true,
  "message": "User approved successfully",
  "data": {
    "id": "clx1abc123def456",
    "email": "owner@example.com",
    "phone": "+237691234567",
    "firstName": "John",
    "lastName": "Doe",
    "role": "OWNER",
    "isVerified": true,
    "idStatus": "APPROVED",
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-17T14:45:00.000Z"
  }
}
```

**When Rejecting:**
```json
{
  "success": true,
  "message": "User rejected successfully",
  "data": {
    "id": "clx1abc123def456",
    "email": "owner@example.com",
    "phone": "+237691234567",
    "firstName": "John",
    "lastName": "Doe",
    "role": "OWNER",
    "isVerified": false,
    "idStatus": "REJECTED",
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-17T14:45:00.000Z"
  }
}
```

#### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Validation errors array | Invalid status value |
| 400 | "User not found" | Invalid user ID |
| 401 | "Authentication required" | No token or invalid token |
| 403 | "Access denied. ADMIN role required." | User is not an admin |

**Validation Error Example:**
```json
{
  "success": false,
  "errors": [
    {
      "code": "invalid_enum_value",
      "message": "Invalid enum value. Expected 'APPROVED' | 'REJECTED', received 'approved'",
      "path": ["status"],
      "options": ["APPROVED", "REJECTED"]
    }
  ]
}
```

#### What Happens Behind the Scenes

1. **Fetch User:** Retrieves user's current status, email, and phone
2. **Update User:**
   - If `APPROVED`: Sets `idStatus = 'APPROVED'` and `isVerified = true`
   - If `REJECTED`: Sets `idStatus = 'REJECTED'` and `isVerified = false`
3. **Create Audit Log:** Records the action in `VerificationLog`
4. **Send Notification:**
   - Sends email if user has email
   - Sends SMS if user has phone (and no email)

---

## 🔄 Verification Workflow

### Complete Admin Verification Flow

```
1. User Submits Documents
   └── POST /api/users/verify/documents
   └── idStatus changes: UNVERIFIED → PENDING
   └── VerificationLog entry created

2. Admin Reviews Documents
   └── Admin Dashboard displays users with idStatus: PENDING
   └── Admin views user profile and documents
   └── Admin reviews: ID card, selfie, ownership/license docs

3. Admin Makes Decision
   ├── APPROVE:
   │   └── PATCH /api/admin/users/:id/verify { status: "APPROVED" }
   │   └── idStatus changes: PENDING → APPROVED
   │   └── isVerified set to true
   │   └── User can now list properties / accept rides
   │
   └── REJECT:
       └── PATCH /api/admin/users/:id/verify { status: "REJECTED", reason: "..." }
       └── idStatus changes: PENDING → REJECTED
       └── isVerified set to false
       └── User notified to resubmit documents

4. User Notified
   └── Email: "Congratulations! Your account has been verified."
   OR
   └── Email/SMS: "Your verification was rejected. Reason: ..."
```

---

## 🖥️ Admin Dashboard Implementation Guide

### Required Views for Admin Section

#### 1. Users List View

Display all users pending verification:

```tsx
// UsersListView.tsx
interface UserListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: 'OWNER' | 'DRIVER';
  idStatus: VerificationStatus;
  createdAt: string;
}

const UsersListView = () => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [filter, setFilter] = useState<VerificationStatus | 'ALL'>('PENDING');

  // Filter users for admin review
  const filteredUsers = filter === 'ALL' 
    ? users 
    : users.filter(u => u.idStatus === filter);

  return (
    <div className="admin-users-list">
      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={filter === 'PENDING' ? 'active' : ''} 
          onClick={() => setFilter('PENDING')}
        >
          ⏳ Pending Review
        </button>
        <button 
          className={filter === 'APPROVED' ? 'active' : ''} 
          onClick={() => setFilter('APPROVED')}
        >
          ✓ Approved
        </button>
        <button 
          className={filter === 'REJECTED' ? 'active' : ''} 
          onClick={() => setFilter('REJECTED')}
        >
          ✕ Rejected
        </button>
        <button 
          className={filter === 'ALL' ? 'active' : ''} 
          onClick={() => setFilter('ALL')}
        >
          All Users
        </button>
      </div>

      {/* Users Table */}
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td>{user.firstName} {user.lastName}</td>
              <td><RoleBadge role={user.role} /></td>
              <td>{user.email || user.phone}</td>
              <td><StatusBadge status={user.idStatus} /></td>
              <td>{formatDate(user.createdAt)}</td>
              <td>
                <button onClick={() => openReviewModal(user.id)}>
                  Review Documents
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

#### 2. Document Review Modal

```tsx
// DocumentReviewModal.tsx
interface ReviewModalProps {
  userId: string;
  user: User;
  onClose: () => void;
  onStatusChange: () => void;
}

const DocumentReviewModal = ({ userId, user, onClose, onStatusChange }: ReviewModalProps) => {
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      toast.success('User approved successfully');
      onStatusChange();
      onClose();
    } catch (error) {
      toast.error('Failed to approve user');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setLoading(true);
    try {
      await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          status: 'REJECTED',
          reason: rejectionReason 
        }),
      });
      toast.success('User rejected');
      onStatusChange();
      onClose();
    } catch (error) {
      toast.error('Failed to reject user');
    } finally {
      setLoading(false);
    }
  };

  // Document display based on role
  const renderDocuments = () => {
    if (user.role === 'OWNER' && user.ownerProfile) {
      return (
        <div className="document-grid">
          <DocumentCard 
            label="ID Card (Front)" 
            url={user.ownerProfile.idCardUrl} 
          />
          <DocumentCard 
            label="ID Card (Back)" 
            url={user.ownerProfile.idBackUrl} 
          />
          <DocumentCard 
            label="Selfie with ID" 
            url={user.ownerProfile.selfieWithIdUrl} 
          />
          <DocumentCard 
            label="Ownership Document" 
            url={user.ownerProfile.ownershipDocUrl}
            isPdf 
          />
        </div>
      );
    }

    if (user.role === 'DRIVER' && user.driverProfile) {
      return (
        <div className="document-grid">
          <DocumentCard 
            label="ID Card (Front)" 
            url={user.driverProfile.idCardUrl} 
          />
          <DocumentCard 
            label="ID Card (Back)" 
            url={user.driverProfile.idBackUrl} 
          />
          <DocumentCard 
            label="Selfie with ID" 
            url={user.driverProfile.selfieWithIdUrl} 
          />
          <DocumentCard 
            label="Driver's License" 
            url={user.driverProfile.licenseImageUrl} 
          />
          <div className="license-info">
            <strong>License Number:</strong> {user.driverProfile.licenseNumber}
          </div>
          <DocumentCard 
            label="Insurance Document" 
            url={user.driverProfile.insuranceDocUrl}
            isPdf 
          />
        </div>
      );
    }

    return <p>No documents found</p>;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header>
          <h2>Review: {user.firstName} {user.lastName}</h2>
          <span className="role-tag">{user.role}</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </header>

        <section className="user-info">
          <p><strong>Email:</strong> {user.email || 'N/A'}</p>
          <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
          <p><strong>Current Status:</strong> <StatusBadge status={user.idStatus} /></p>
        </section>

        <section className="documents">
          <h3>Submitted Documents</h3>
          {renderDocuments()}
        </section>

        {showRejectForm ? (
          <section className="reject-form">
            <h3>Rejection Reason</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why the documents are being rejected..."
              rows={4}
            />
            <div className="actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowRejectForm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-danger" 
                onClick={handleReject}
                disabled={loading}
              >
                {loading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </section>
        ) : (
          <section className="actions">
            <button 
              className="btn-success" 
              onClick={handleApprove}
              disabled={loading || user.idStatus === 'APPROVED'}
            >
              {loading ? 'Processing...' : '✓ Approve User'}
            </button>
            <button 
              className="btn-danger" 
              onClick={() => setShowRejectForm(true)}
              disabled={loading || user.idStatus === 'REJECTED'}
            >
              ✕ Reject User
            </button>
          </section>
        )}
      </div>
    </div>
  );
};
```

#### 3. Document Card Component

```tsx
// DocumentCard.tsx
interface DocumentCardProps {
  label: string;
  url: string | null;
  isPdf?: boolean;
}

const DocumentCard = ({ label, url, isPdf }: DocumentCardProps) => {
  if (!url) {
    return (
      <div className="document-card empty">
        <span className="label">{label}</span>
        <p>Not uploaded</p>
      </div>
    );
  }

  // Construct full URL for the image/document
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  return (
    <div className="document-card">
      <span className="label">{label}</span>
      {isPdf ? (
        <a href={fullUrl} target="_blank" rel="noopener noreferrer">
          📄 View Document
        </a>
      ) : (
        <img 
          src={fullUrl} 
          alt={label} 
          onClick={() => window.open(fullUrl, '_blank')}
          style={{ cursor: 'pointer' }}
        />
      )}
    </div>
  );
};
```

#### 4. Common Rejection Reasons (Quick Select)

```tsx
const REJECTION_REASONS = [
  'ID card image is blurry or unreadable',
  'Selfie does not match the ID card',
  'Documents appear to be edited or tampered with',
  'Ownership document is not valid or expired',
  'License number does not match the document',
  'Insurance document is expired',
  'Missing required documents',
];

const RejectionReasonSelector = ({ 
  onSelect 
}: { 
  onSelect: (reason: string) => void 
}) => {
  return (
    <div className="quick-reasons">
      <p>Quick select a reason:</p>
      {REJECTION_REASONS.map((reason, idx) => (
        <button 
          key={idx}
          className="reason-chip"
          onClick={() => onSelect(reason)}
        >
          {reason}
        </button>
      ))}
    </div>
  );
};
```

---

## 📧 Notifications System

When an admin approves or rejects a user, notifications are automatically sent:

### Approval Notification

**Email Subject:** `Account Verified`

**Email Body:**
```html
<p>Congratulations John! Your Mobistay account has been verified. You can now access all features.</p>
```

**SMS:**
```
Congratulations John! Your Mobistay account has been verified. You can now access all features.
```

### Rejection Notification

**Email Subject:** `Verification Update`

**Email Body:**
```html
<p>Hello John. Your verification request was rejected. Reason: ID card image is blurry and unreadable.</p>
```

**SMS:**
```
Hello John. Your verification request was rejected. Reason: ID card image is blurry and unreadable.
```

---

## 📋 Audit Logging

All verification actions are logged in the `VerificationLog` table:

### Log Entry Example

```json
{
  "id": "clx5log789xyz",
  "userId": "clx1abc123def456",
  "adminId": "clx0adminABC",
  "previousStatus": "PENDING",
  "newStatus": "APPROVED",
  "reason": null,
  "createdAt": "2026-01-17T14:45:00.000Z"
}
```

### Querying Verification History

```sql
-- Get all verification actions for a user
SELECT 
  vl.*,
  admin.firstName as adminFirstName,
  admin.lastName as adminLastName
FROM "VerificationLog" vl
LEFT JOIN "User" admin ON vl."adminId" = admin.id
WHERE vl."userId" = 'target_user_id'
ORDER BY vl."createdAt" DESC;
```

### Admin Dashboard - Verification History Component

```tsx
interface VerificationHistoryProps {
  userId: string;
  logs: VerificationLog[];
}

const VerificationHistory = ({ userId, logs }: VerificationHistoryProps) => {
  return (
    <div className="verification-history">
      <h3>Verification History</h3>
      <ul className="timeline">
        {logs.map((log) => (
          <li key={log.id} className="timeline-item">
            <span className="timestamp">{formatDateTime(log.createdAt)}</span>
            <div className="status-change">
              <StatusBadge status={log.previousStatus} />
              <span className="arrow">→</span>
              <StatusBadge status={log.newStatus} />
            </div>
            {log.adminId && (
              <span className="admin">By Admin: {log.adminId}</span>
            )}
            {log.reason && (
              <p className="reason">Reason: {log.reason}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

---

## 🧪 Testing Examples

### cURL Examples

#### Approve a User
```bash
curl -X PATCH http://localhost:3000/api/admin/users/clx1abc123def456/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "status": "APPROVED"
  }'
```

#### Reject a User
```bash
curl -X PATCH http://localhost:3000/api/admin/users/clx1abc123def456/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "status": "REJECTED",
    "reason": "ID card image is blurry. Please resubmit with a clearer photo."
  }'
```

### JavaScript/TypeScript API Client

```typescript
// Admin API Client
class AdminAPI {
  private baseUrl = '/api/admin';

  async verifyUser(
    userId: string, 
    action: 'APPROVED' | 'REJECTED',
    reason?: string
  ): Promise<User> {
    const res = await fetch(`${this.baseUrl}/users/${userId}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: action, reason }),
    });

    const data = await res.json();
    
    if (!res.ok) {
      if (data.errors) {
        throw new ValidationError(data.errors);
      }
      throw new Error(data.message);
    }

    return data.data;
  }

  async approveUser(userId: string): Promise<User> {
    return this.verifyUser(userId, 'APPROVED');
  }

  async rejectUser(userId: string, reason: string): Promise<User> {
    return this.verifyUser(userId, 'REJECTED', reason);
  }
}

// Usage
const adminAPI = new AdminAPI();

// Approve
await adminAPI.approveUser('clx1abc123def456');

// Reject
await adminAPI.rejectUser(
  'clx1abc123def456', 
  'Documents are not clear enough'
);
```

---

## 📎 Related Documentation

- **[Users API Documentation](./API_USERS.md)** - User profile and document submission
- **[Auth API Documentation](./02-auth-api.md)** - Admin login
- **[Sprint 4: Admin Moderation](./04_sprint4_admin_moderation.md)** - Sprint roadmap

---

## ⚠️ Important Notes for Admin Implementation

1. **Security:** Only users with `role: ADMIN` can access these endpoints
2. **Audit Trail:** Every action is logged - never bypass the API
3. **Notifications:** Users are automatically notified - no need to implement separately
4. **Image URLs:** Document URLs are relative paths. Prefix with `API_BASE_URL` to display
5. **Rejection Reasons:** Always provide a clear reason when rejecting to help users fix issues

---

*Documentation generated for Mobistay Backend v1.0*
