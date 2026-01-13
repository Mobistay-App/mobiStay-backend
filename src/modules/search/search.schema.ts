import { z } from 'zod';

export const SearchQuerySchema = z.object({
    type: z.enum(['stay', 'move']),
    city: z.enum(['DOUALA', 'YAOUNDE', 'BAMENDA', 'BUEA', 'LIMBE']).optional(),
    priceMin: z.coerce.number().optional(),
    priceMax: z.coerce.number().optional(),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    radius: z.coerce.number().default(5), // km (for move)
});

export type SearchQueryInput = z.infer<typeof SearchQuerySchema>;
