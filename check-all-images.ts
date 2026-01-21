
import { prisma } from './src/shared/prisma';

async function main() {
    console.log('🔍 Checking user avatars...');
    const users = await prisma.user.findMany();

    users.forEach(u => {
        if (u.avatarUrl) {
            console.log(`User [${u.email}] avatar:`, u.avatarUrl);
        } else {
            console.log(`User [${u.email}] has no avatar.`);
        }
    });

    // Check properties too
    console.log('\n🔍 Checking property images again...');
    const properties = await prisma.property.findMany();
    properties.forEach(p => {
        console.log(`Property [${p.title}] images:`, p.images);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
