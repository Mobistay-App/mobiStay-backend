import { SignJWT, jwtVerify } from 'jose';
import { env } from '../../config/env.js';

const SECRET = new TextEncoder().encode(env.JWT_SECRET);
const ALGORITHM = 'HS256';

/**
 * Generate a JWT for a user.
 * @param payload The data to include in the token (e.g., userId, role).
 * @returns The signed JWT string.
 */
export const signJWT = async (payload: any): Promise<string> => {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: ALGORITHM })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(SECRET);
};

/**
 * Verify a JWT and return its payload.
 * @param token The JWT string.
 * @returns The payload if valid, or null if invalid/expired.
 */
export const verifyJWT = async (token: string): Promise<any> => {
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload;
    } catch (error) {
        // In production, you might want to log this or throw specific errors
        return null;
    }
};
