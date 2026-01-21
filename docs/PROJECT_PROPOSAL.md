# Mobistay Project Proposal

## 1. Executive Summary
Mobistay is a comprehensive platform designed to revolutionize the hospitality and transportation sectors in Cameroon. By integrating short-term property rentals ("Stays") and ride-hailing services ("Move") into a single, seamless application, we aim to provide a safe, convenient, and modern experience for travelers and locals alike.

## 2. Technical Scope
- **Backend:** Node.js, Express, Prisma, PostgreSQL (Neon), Redis (Upstash) for geospatial tracking.
- **Frontend:** Next.js (Web Admin/Dashboard), React Native (Mobile App - Future Phase).
- **Key Modules:** User Auth (OTP), KYC/Verification, Property Management, Ride Dispatching, Admin Oversight.

## 3. Financial Proposal (Developpers Cost)
**Philosophy:** We believe in fair compensation that respects local economic realities while guaranteeing "Silicon Valley" code quality. The following costs cover the design, development, testing, and deployment of the MVP (Minimum Viable Product).

### Cost Breakdown (Estimates in FCFA)

| Phase | Description | Duration | Estimated Cost (FCFA) |
| :--- | :--- | :--- | :--- |
| **1. Foundation & Auth** | Setup, Database, Secure Login (SMS/Email OTP), KYC System. | 2 Weeks | **450,000 FCFA** |
| **2. Core Modules** | "Stay" (Apartment Listings) & "Move" (Ride-Hailing Logic). | 3 Weeks | **600,000 FCFA** |
| **3. Advanced Logic** | Real-time driver tracking (Redis), Booking Engine, Search & Discovery. | 3 Weeks | **750,000 FCFA** |
| **4. Admin & Security** | Admin Dashboard, Moderation Tools, Security Audit, Payments Integration. | 2 Weeks | **500,000 FCFA** |
| **5. Testing & Deploy** | QA Testing, Server Setup, Training, Handover. | 2 Weeks | **300,000 FCFA** |
| **TOTAL** | **Full Stack Development (Backend + Admin)** | **~3 Months** | **2,600,000 FCFA** |

*Note: Infrastructure costs (Hosting, Domain, SMS API credits) are billed separately based on actual usage.*

## 4. Challenges & Mitigation Strategies
Developing high-tech solutions in our environment comes with unique constraints. We have identified these challenges and prepared mitigation strategies.

### 🔴 1. Internet Connectivity (Slow/Unstable Speed)
- **Challenge:** Slow internet can disrupt the real-time "driver tracking" experience and delay API responses for users in remote areas.
- **Mitigation:** 
  - **Optimized Payloads:** We use GraphQL-style data selection (Prisma `select`) to send only the exact data needed, reducing packet size by up to 70%.
  - **Offline-First Architecture:** The mobile app will cache critical data (like active bookings) so it works even if the network drops momentarily.
  - **Image Compression:** All uploads are automatically compressed (WebP format) to ensure fast loading even on 3G networks.

### 🔴 2. Payment Gateway Reliability
- **Challenge:** Mobile Money (Momo/OM) APIs can occasionally be down or slow to confirm transactions.
- **Mitigation:** 
  - Implementation of a robust "Webhook Listener" that retries confirmation checks automatically.
  - Support for creating "Pending" interactions that resolve once the network recovers.

### 🔴 3. Map & Address Accuracy
- **Challenge:** Many locations in Cameroonian cities lack precise Google Maps addresses.
- **Mitigation:** 
  - **Landmark-Based Navigation:** Allowing users to select "Nearest Popular Landmark" in addition to GPS pins.
  - **Driver Call Integration:** One-tap calling to allow voice coordination between driver and passenger.

## 5. Conclusion
This investment represents a strategic opportunity to capture a growing market with a robust, scalable technology stack. We are committed to delivering a product that is not only functional but resilient to our local operating environment.
