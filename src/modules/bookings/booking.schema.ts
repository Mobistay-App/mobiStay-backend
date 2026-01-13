import { z } from 'zod';

/**
 * Validation for Creating a Booking
 */
export const CreateBookingSchema = z.object({
    propertyId: z.string().cuid('Invalid Property ID'),
    checkIn: z.coerce.date().min(new Date(), 'Check-in date cannot be in the past'),
    checkOut: z.coerce.date(),
    guestCount: z.coerce.number().min(1, 'Must have at least 1 guest').default(1),
}).refine(data => data.checkOut > data.checkIn, {
    message: "Check-out date must be after check-in date",
    path: ["checkOut"]
});

/**
 * Validation for Updating Booking Status
 */
export const UpdateBookingStatusSchema = z.object({
    status: z.enum(['CONFIRMED', 'CANCELLED']),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof UpdateBookingStatusSchema>;
