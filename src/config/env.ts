import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
    PORT: z.string().default('5000'),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
    UPSTASH_REDIS_URL: z.string().url(),
    UPSTASH_REDIS_TOKEN: z.string(),
    RESEND_API_KEY: z.string().optional(),
    SMTP_HOST: z.string().default('smtp.gmail.com'),
    SMTP_PORT: z.string().default('587'),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    AT_API_KEY: z.string().optional(),
    AT_USERNAME: z.string().optional(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);