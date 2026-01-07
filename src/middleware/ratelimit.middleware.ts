import { Request, Response, NextFunction } from 'express';
import { Ratelimit } from '@upstash/ratelimit';

/**
 * Creates an Express Middleware for Upstash Rate Limiting
 */
export const rateLimit = (limiter: Ratelimit) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Use IP as identifier. In production, ensure trust proxy is set if behind load balancer.
        const identifier = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

        try {
            const { success, limit, remaining, reset } = await limiter.limit(identifier);

            res.setHeader('X-RateLimit-Limit', limit);
            res.setHeader('X-RateLimit-Remaining', remaining);
            res.setHeader('X-RateLimit-Reset', reset);

            if (!success) {
                res.status(429).json({
                    success: false,
                    message: "Too many requests, please try again later."
                });
                return; // Ensure we stop execution
            }

            next();
        } catch (error) {
            console.error("Rate Limiter Error:", error);
            // Fail open (allow request) or closed (block) depending on policy. 
            // Failing open is safer for user experience during Redis outages.
            next();
        }
    };
};
