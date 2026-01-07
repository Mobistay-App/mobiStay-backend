import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis.js';

/**
 * Rate Limiter Configuration
 * using User-agnostic (IP-based) or User-specific limits.
 */

// Limit OTP requests: 3 requests per 10 minutes
export const otpRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "10 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/otp",
});

// Limit Login attempts: 5 requests per 1 minute (to prevent brute force)
export const loginRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/login",
});

// Limit Registration: 5 per hour (prevent mass account creation spam)
export const registerRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, "1 h"),
    analytics: true,
    prefix: "@upstash/ratelimit/register",
});
