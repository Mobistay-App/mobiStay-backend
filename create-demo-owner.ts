
import { prisma } from './src/shared/prisma';
import { hashPassword } from './src/shared/utils/password.js'; // Ensure .js extension for consistency or remove if tsx handles it

async function main() {
    const email = 'demo_owner@mobistay.com';
    const password = 'password123';

    // Check if exists
    const existing = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } }
    });

    if (existing) {
        console.log(`User ${email} already exists. Updating password...`);
        const hashedPassword = await hashPassword(password);
        await prisma.user.update({
            where: { id: existing.id },
            data: {
                password: hashedPassword,
                role: 'OWNER',
                isVerified: true,
                idStatus: 'APPROVED'
            }
        });
    } else {
        console.log(`Creating new user ${email}...`);
        const hashedPassword = await hashPassword(password);
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'OWNER',
                firstName: 'Demo',
                lastName: 'Owner',
                phone: '600000000',
                isVerified: true,
                idStatus: 'APPROVED'
            }
        });
    }

    console.log(`✅ Success! Login with:\nEmail: ${email}\nPassword: ${password}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
