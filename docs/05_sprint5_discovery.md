# Sprint 5: Discovery & Search

## Objective
Enable travelers to find:
1.  **Stays** (Apartments, Guest Houses) in specific cities.
2.  **Drivers** (Move) nearby for ride requests.

## Implemented Features

### 1. Unified Search API
- **Endpoint:** `GET /api/search`
- **Query Params:**
  - `type`: 'stay' | 'move' (Required)
  - `city`: For Stays (e.g., DOUALA, YAOUNDE)
  - `priceMin`, `priceMax`: Price filtering
  - `lat`, `lng`: Required for Move (Drivers)
  - `radius`: Search radius in km (Default: 5km)

## Search Logic

### Stays (PostgreSQL)
- Filters by `city`, `pricePerNight`, and `isActive` status.
- **Verification Check:** Implicitly filters properties owned by verified Verified Users (logic can be tightened).

### Drivers (Redis + PostgreSQL)
- **Geospatial Index:** Uses Upstash Redis `GEORADIUS` to find `userId`s within *N* km.
- **Hydration:** Fetches full profile details (Name, Avatar, Rating) from PostgreSQL for the found IDs.
- **Optimization:** Fast geospatial lookups via Redis, rich data via SQL.

## Infrastructure
- **Service:** `SearchService`
- **Controller:** `SearchController`
- **Routes:** `search.routes.ts` (Public access, no auth required to browse).
