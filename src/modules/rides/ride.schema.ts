import { z } from 'zod';

/**
 * Sprint 7: Request a Ride
 */
export const RequestRideSchema = z.object({
    pickupAddress: z.string().min(3),
    pickupLat: z.number().min(-90).max(90),
    pickupLng: z.number().min(-180).max(180),
    dropoffAddress: z.string().min(3),
    dropoffLat: z.number().min(-90).max(90),
    dropoffLng: z.number().min(-180).max(180),
});

/**
 * Sprint 7: Update Ride Status
 */
export const UpdateRideStatusSchema = z.object({
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
});

export type RequestRideInput = z.infer<typeof RequestRideSchema>;
export type UpdateRideStatusInput = z.infer<typeof UpdateRideStatusSchema>;
