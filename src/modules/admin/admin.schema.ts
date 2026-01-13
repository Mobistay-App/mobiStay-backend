import { z } from 'zod';

export const VerifyUserSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    reason: z.string().optional(),
});

export type VerifyUserInput = z.infer<typeof VerifyUserSchema>;
