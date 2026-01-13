import { z } from 'zod';

export const CreatePropertySchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string(),
    pricePerNight: z.number().positive("Price must be positive"),
    amenities: z.array(z.string()).min(0),
    images: z.array(z.string()).min(1, "At least 1 image is required").max(10, "Maximum 10 images allowed")
});

export const UpdateAvailabilitySchema = z.object({
    blockedDates: z.array(z.string().datetime()).optional(), // Assuming ISO date strings
    isActive: z.boolean().optional()
});

export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;
export type UpdateAvailabilityInput = z.infer<typeof UpdateAvailabilitySchema>;
