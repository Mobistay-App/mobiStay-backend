import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plain text password securely.
 * @param password The plain text password.
 * @returns The hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verify a password against a hash.
 * @param password The plain text password.
 * @param hash The stored hash.
 * @returns True if they match, false otherwise.
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};
