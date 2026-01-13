# Sprint 3: Driver Module (Move Assets & Presence)

## Objective
Enable Drivers to register their vehicles and broadcast their live location for ride-hailing.

## Implemented Features

### 1. Vehicle Registration
- **Endpoint:** `POST /api/driver/vehicle`
- **Guards:** `DRIVER` role.
- **Fields:** Model, Plate, Color, Type (Standard/Comfort/Large), License Number.
- **Logic:** Updates the `DriverProfile` with asset details.

### 2. Live Status (The "Go Online" Switch)
- **Endpoint:** `PATCH /api/driver/status`
- **Guards:** `DRIVER` role + `Verified` status.
- **Inputs:** `isOnline` (Boolean), `location` (Lat/Lng).
- **Backend Logic:**
  1.  **Postgres:** Updates `DriverProfile.isOnline`.
  2.  **Redis (Geospatial):** If online, adds user to `drivers:locations` using `GEOADD`.
  3.  **Ghost Driver Prevention:** Sets a parallel Redis key `driver:{id}:active` with a 5-minute TTL.
  4.  If offline, removes from Redis.

## Technologies
- **PostgreSQL:** Permanent profile & status record.
- **Upstash Redis:** Real-time geospatial indexing for "Find Drivers Nearby".
