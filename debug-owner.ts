
import { prisma } from './src/shared/prisma';

async function main() {
    console.log('🔍 Listing all users in database...');
    const users = await prisma.user.findMany();

    if (users.length === 0) {
        console.log('❌ No users found in database.');
    } else {
        console.table(users.map(u => ({
            id: u.id.substring(0, 8) + '...',
            email: u.email,
            role: u.role,
            isVerified: u.isVerified,
            idStatus: u.idStatus,
            avatar: u.avatarUrl
        })));
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
