# Sprint 6: Booking System (Stays)

## Objective
Enable Travelers to reserve verified Properties for specific dates.

## Implemented Features

### 1. Create Booking
- **Endpoint:** `POST /api/bookings`
- **Guards:** Authenticated User (Role `TRAVELER` preferred, but any user can book).
- **Inputs:** `propertyId`, `checkIn` (Date), `checkOut` (Date), `guestCount` (Int).
- **Logic:**
  1.  **Availability Check:** Query `Property.blockedDates` and existing `Booking`s (status CONFIRMED) to ensure no overlap.
  2.  **Price Calculation:** `(checkOut - checkIn).days * pricePerNight`.
  3.  **Creation:** Create `Booking` with status `PENDING` (or `CONFIRMED` if no payment gateway yet).

### 2. List Bookings
- **Endpoint:** `GET /api/bookings`
- **Logic:**
  - If Traveler: List bookings made by them.
  - If Owner: List bookings for their properties.

### 3. Update Booking Status
- **Endpoint:** `PATCH /api/bookings/:id/status`
- **Guards:** Owner (for Confirm/Reject) or Traveler (Cancel).
- **Inputs:** `status` (CONFIRMED, CANCELLED).

## Models Involved
- `Booking`
- `Property`
