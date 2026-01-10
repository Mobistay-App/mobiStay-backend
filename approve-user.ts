
import { prisma } from './src/shared/prisma';

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email address');
        process.exit(1);
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: {
                isVerified: true,
                idStatus: 'APPROVED',
            },
        });
        console.log(`✅ User ${user.email} Verified and Approved!`);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
