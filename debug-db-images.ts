
import { prisma } from './src/shared/prisma.js';

async function main() {
    const properties = await prisma.property.findMany({
        take: 5,
        select: {
            id: true,
            title: true,
            images: true,
        }
    });
    console.log('--- PROPERTY IMAGES IN DB ---');
    console.log(JSON.stringify(properties, null, 2));

    const users = await prisma.user.findMany({
        take: 5,
        select: {
            id: true,
            firstName: true,
            avatarUrl: true
        }
    });
    console.log('--- USER AVATARS IN DB ---');
    console.log(JSON.stringify(users, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
