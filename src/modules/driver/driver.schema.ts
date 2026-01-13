import { z } from 'zod';

export const VehicleRegistrationSchema = z.object({
    vehicleModel: z.string().min(2, 'Vehicle model is required'),
    vehiclePlate: z.string().min(4, 'Vehicle plate is required'),
    vehicleColor: z.string().min(2, 'Vehicle color is required'), // Added as per Sprint 3 reqs
    vehicleType: z.enum(['STANDARD', 'COMFORT', 'LARGE_GROUP']),
    licenseNumber: z.string().min(5, 'License number is required'),
});

export const DriverStatusSchema = z.object({
    isOnline: z.boolean(),
    location: z.object({
        lat: z.number(),
        lng: z.number()
    }).optional(), // Optional initial location when going online
});

export type VehicleRegistrationInput = z.infer<typeof VehicleRegistrationSchema>;
export type DriverStatusInput = z.infer<typeof DriverStatusSchema>;
