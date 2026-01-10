import { z } from 'zod';

export const CreatePropertySchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.enum(['DOUALA', 'YAOUNDE', 'BAMENDA', 'BUEA', 'LIMBE'], {
        message: "City must be one of: DOUALA, YAOUNDE, BAMENDA, BUEA, LIMBE"
    }),
    pricePerNight: z.number().positive("Price must be positive"),
    amenities: z.array(z.string()).min(1, "At least one amenity is required"),
    images: z.array(z.string().url()).min(3, "At least 3 images are required").max(10, "Maximum 10 images allowed")
});

export const UpdateAvailabilitySchema = z.object({
    blockedDates: z.array(z.string().datetime()).optional(), // Assuming ISO date strings
    isActive: z.boolean().optional()
});

export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;
export type UpdateAvailabilityInput = z.infer<typeof UpdateAvailabilitySchema>;
