# Sprint 2: Owner Module (Stay Listing CRUD)

## Objective
Enable verified Owners to list and manage their properties (guest houses, apartments).

## Implemented Features

### 1. Property Creation
- **Endpoint:** `POST /api/properties`
- **Guards:** `OWNER` role + `Verified` status.
- **Fields:** Title, Description, Address, City (Indexed), Price, Amenities, Images.
- **Validation:** Zod schema ensures valid data types and enums.

### 2. Availability Management
- **Endpoint:** `PATCH /api/properties/:id/availability`
- **Logic:**
  - Allows toggling `isActive`.
  - sets `blockedDates` for periods the property is unavailable.
- **Security:** Verifies that `req.user.userId` matches the `Property.ownerId`.

## Models Involved
- `Property`
- Indexes: `@@index([city])` for faster search in Sprint 5.
