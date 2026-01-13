# Sprint 7: Ride Sharing Logic (Move)

## Objective
Enable Travelers to request immediate rides from nearby Drivers.

## Implemented Features

### 1. Request Ride
- **Endpoint:** `POST /api/rides/request`
- **Inputs:** `pickupLat`, `pickupLng`, `dropoffLat`, `dropoffLng`, `pickupAddress`, `dropoffAddress`.
- **Logic:**
  1.  Create `Ride` record with Status `REQUESTED`.
  2.  (Future) Emit generic event to drivers near `pickupLat/Lng`.

### 2. Matching / Acceptance
- **Endpoint:** `PATCH /api/rides/:id/accept`
- **Guards:** Driver.
- **Logic:**
  1.  Check if Ride is still `REQUESTED`.
  2.  Assign `driverId` to `req.user.id`.
  3.  Update Status to `ACCEPTED`.

### 3. Ride Updates
- **Endpoint:** `PATCH /api/rides/:id/status`
- **Inputs:** `status` (IN_PROGRESS, COMPLETED).
- **Logic:** Updates status, potentially calculates final fare.

## Models Involved
- `Ride`
- `DriverProfile`
