import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { env } from './env.js';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Mobistay API Documentation',
            version: '1.0.0',
            description: `
## 🏠 Mobistay Backend API

Complete API documentation for Mobistay - a platform for stays (accommodation) and move (ride-sharing) services.

### 🔐 Authentication
All protected endpoints require authentication via JWT token stored in HTTP-only cookies.
- Login via \`/api/auth/login\` to receive the authentication cookie
- The cookie is automatically sent with subsequent requests

### 👥 User Roles
| Role | Description |
|------|-------------|
| \`TRAVELER\` | Standard user booking stays |
| \`OWNER\` | Property owner listing stays |
| \`DRIVER\` | Driver offering rides |
| \`ADMIN\` | Platform administrator |

### ✅ Verification Statuses
| Status | Description |
|--------|-------------|
| \`UNVERIFIED\` | Initial state, no documents submitted |
| \`PENDING\` | Documents submitted, awaiting admin review |
| \`APPROVED\` | Admin approved, full access granted |
| \`REJECTED\` | Admin rejected, user must resubmit |

### 📚 API Modules
- **Auth** - Registration, login, OTP verification
- **Users** - Profile management, KYC document submission
- **Properties** - Stay listings (CRUD for owners)
- **Bookings** - Reservation management
- **Rides** - Ride-sharing requests
- **Driver** - Driver-specific operations
- **Admin** - User verification, platform management
- **Search** - Property discovery
            `,
        },
        servers: [
            {
                url: env.NODE_ENV === 'production'
                    ? 'https://mobistay-backend.onrender.com'
                    : `http://localhost:${env.PORT || 5000}`,
                description: env.NODE_ENV === 'production' ? 'Production server' : 'Local development server',
            },
        ],
        tags: [
            { name: 'Auth', description: 'Authentication and registration endpoints' },
            { name: 'Users', description: 'User profile and KYC verification management' },
            { name: 'Admin', description: 'Administrative actions (requires ADMIN role)' },
            { name: 'Properties', description: 'Stay/property management for owners' },
            { name: 'Bookings', description: 'Booking/reservation management' },
            { name: 'Rides', description: 'Ride-sharing requests and management' },
            { name: 'Driver', description: 'Driver-specific operations' },
            { name: 'Search', description: 'Property discovery and search' },
            { name: 'Upload', description: 'File upload endpoints' },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token',
                    description: 'JWT token stored in HTTP-only cookie after login',
                },
            },
            schemas: {
                // Enums
                UserRole: {
                    type: 'string',
                    enum: ['TRAVELER', 'OWNER', 'DRIVER', 'ADMIN'],
                    description: 'User role in the system',
                    example: 'OWNER',
                },
                VerificationStatus: {
                    type: 'string',
                    enum: ['UNVERIFIED', 'PENDING', 'APPROVED', 'REJECTED'],
                    description: 'KYC verification status',
                    example: 'PENDING',
                },
                BookingStatus: {
                    type: 'string',
                    enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
                    description: 'Booking/reservation status',
                    example: 'CONFIRMED',
                },
                RideStatus: {
                    type: 'string',
                    enum: ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
                    description: 'Ride request status',
                    example: 'ACCEPTED',
                },
                PropertyType: {
                    type: 'string',
                    enum: ['APARTMENT', 'STUDIO', 'HOTEL', 'VILLA', 'OTHER'],
                    description: 'Type of property',
                    example: 'APARTMENT',
                },

                // Models
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'CUID primary key', example: 'clx1abc123def456' },
                        email: { type: 'string', nullable: true, format: 'email', example: 'user@example.com' },
                        phone: { type: 'string', nullable: true, example: '+237691234567' },
                        firstName: { type: 'string', nullable: true, example: 'John' },
                        lastName: { type: 'string', nullable: true, example: 'Doe' },
                        avatarUrl: { type: 'string', nullable: true, example: '/uploads/avatar_123.jpg' },
                        bio: { type: 'string', nullable: true, maxLength: 240, example: 'Property owner in Douala' },
                        address: { type: 'string', nullable: true, example: '123 Main Street, Douala' },
                        role: { $ref: '#/components/schemas/UserRole' },
                        isVerified: { type: 'boolean', description: 'Phone/email verified via OTP', example: true },
                        idStatus: { $ref: '#/components/schemas/VerificationStatus' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                UserWithProfiles: {
                    allOf: [
                        { $ref: '#/components/schemas/User' },
                        {
                            type: 'object',
                            properties: {
                                ownerProfile: { $ref: '#/components/schemas/OwnerProfile' },
                                driverProfile: { $ref: '#/components/schemas/DriverProfile' },
                            },
                        },
                    ],
                },
                OwnerProfile: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'clx2owner789' },
                        userId: { type: 'string', example: 'clx1abc123def456' },
                        idCardUrl: { type: 'string', nullable: true, description: 'Front of ID card', example: '/uploads/id_front_123.jpg' },
                        idBackUrl: { type: 'string', nullable: true, description: 'Back of ID card', example: '/uploads/id_back_123.jpg' },
                        selfieWithIdUrl: { type: 'string', nullable: true, description: 'Selfie holding ID', example: '/uploads/selfie_123.jpg' },
                        ownershipDocUrl: { type: 'string', nullable: true, description: 'Property ownership document', example: '/uploads/ownership_123.pdf' },
                        verificationNote: { type: 'string', nullable: true },
                    },
                },
                DriverProfile: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'clx3driver456' },
                        userId: { type: 'string', example: 'clx1abc123def456' },
                        licenseNumber: { type: 'string', description: 'Driver license number (unique)', example: 'DL-2026-123456' },
                        licenseImageUrl: { type: 'string', nullable: true, example: '/uploads/license_456.jpg' },
                        vehicleModel: { type: 'string', nullable: true, example: 'Toyota Camry' },
                        vehiclePlate: { type: 'string', nullable: true, example: 'CE-1234-AB' },
                        vehicleColor: { type: 'string', nullable: true, example: 'Silver' },
                        vehicleType: { type: 'string', nullable: true, example: 'Sedan' },
                        idCardUrl: { type: 'string', nullable: true, example: '/uploads/id_front_456.jpg' },
                        idBackUrl: { type: 'string', nullable: true, example: '/uploads/id_back_456.jpg' },
                        selfieWithIdUrl: { type: 'string', nullable: true, example: '/uploads/selfie_456.jpg' },
                        insuranceDocUrl: { type: 'string', nullable: true, example: '/uploads/insurance_456.pdf' },
                        isOnline: { type: 'boolean', description: 'Driver availability status', example: false },
                    },
                },
                VerificationLog: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'clx5log789xyz' },
                        userId: { type: 'string', description: 'Target user ID' },
                        adminId: { type: 'string', nullable: true, description: 'Admin who performed action (null if user-initiated)' },
                        previousStatus: { $ref: '#/components/schemas/VerificationStatus' },
                        newStatus: { $ref: '#/components/schemas/VerificationStatus' },
                        reason: { type: 'string', nullable: true, description: 'Reason for rejection' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },

                // Request/Response schemas
                UpdateProfileRequest: {
                    type: 'object',
                    description: 'All fields are optional. Only include fields you want to update.',
                    properties: {
                        firstName: { type: 'string', minLength: 2, example: 'John' },
                        lastName: { type: 'string', minLength: 2, example: 'Doe' },
                        bio: { type: 'string', maxLength: 240, example: 'Experienced property owner' },
                        avatarUrl: { type: 'string', format: 'uri', example: '/uploads/avatar_123.jpg' },
                        address: { type: 'string', minLength: 5, example: '456 New Street, Yaoundé' },
                    },
                },
                OwnerDocumentsRequest: {
                    type: 'object',
                    required: ['idCardUrl', 'idBackUrl', 'selfieWithIdUrl', 'ownershipDocUrl'],
                    properties: {
                        idCardUrl: { type: 'string', format: 'uri', description: 'URL to front of ID card image', example: '/uploads/id_front.jpg' },
                        idBackUrl: { type: 'string', format: 'uri', description: 'URL to back of ID card image', example: '/uploads/id_back.jpg' },
                        selfieWithIdUrl: { type: 'string', format: 'uri', description: 'URL to selfie holding ID', example: '/uploads/selfie.jpg' },
                        ownershipDocUrl: { type: 'string', format: 'uri', description: 'URL to property ownership document', example: '/uploads/ownership.pdf' },
                    },
                },
                DriverDocumentsRequest: {
                    type: 'object',
                    required: ['idCardUrl', 'idBackUrl', 'selfieWithIdUrl', 'licenseImageUrl', 'licenseNumber', 'insuranceDocUrl'],
                    properties: {
                        idCardUrl: { type: 'string', format: 'uri', description: 'URL to front of ID card image', example: '/uploads/id_front.jpg' },
                        idBackUrl: { type: 'string', format: 'uri', description: 'URL to back of ID card image', example: '/uploads/id_back.jpg' },
                        selfieWithIdUrl: { type: 'string', format: 'uri', description: 'URL to selfie holding ID', example: '/uploads/selfie.jpg' },
                        licenseImageUrl: { type: 'string', format: 'uri', description: 'URL to driver license image', example: '/uploads/license.jpg' },
                        licenseNumber: { type: 'string', minLength: 5, description: 'Driver license number', example: 'DL-2026-123456' },
                        insuranceDocUrl: { type: 'string', format: 'uri', description: 'URL to vehicle insurance document', example: '/uploads/insurance.pdf' },
                    },
                },
                VerifyUserRequest: {
                    type: 'object',
                    required: ['status'],
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['APPROVED', 'REJECTED'],
                            description: 'New verification status',
                            example: 'APPROVED'
                        },
                        reason: {
                            type: 'string',
                            description: 'Reason for rejection (recommended when rejecting)',
                            example: 'ID card image is blurry. Please resubmit.'
                        },
                    },
                },

                // Standard Response wrappers
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Operation completed successfully' },
                        data: { type: 'object' },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Error message' },
                    },
                },
                ValidationErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    code: { type: 'string', example: 'too_small' },
                                    message: { type: 'string', example: 'First name too short' },
                                    path: { type: 'array', items: { type: 'string' }, example: ['firstName'] },
                                    minimum: { type: 'integer', example: 2 },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.schema.ts'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'list',
            filter: true,
            showRequestDuration: true,
        },
        customSiteTitle: 'Mobistay API Docs',
        customCss: `
            .swagger-ui .topbar { display: none }
            .swagger-ui .info .title { color: #3b82f6 }
            .swagger-ui .info .description { max-width: 100% }
            .swagger-ui table tbody tr td:first-of-type { font-weight: bold }
        `,
    }));

    console.log(`📝 Swagger docs available at /docs`);
};
