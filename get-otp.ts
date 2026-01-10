import { prisma } from './src/shared/prisma.js';
import { redis } from './src/shared/redis.js';

const email = 'owner_test@gmail.com';
const user = await prisma.user.findFirst({ where: { email } });

if (user) {
    const otp = await redis.get(`auth:otp:${user.id}`);
    console.log(`User: ${user.email}, ID: ${user.id}, OTP: ${otp}`);
} else {
    console.log('User not found');
}
process.exit(0);
