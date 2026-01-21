
import { prisma } from './src/shared/prisma';

async function main() {
    const ownerEmail = 'demo_owner@mobistay.com';
    const user = await prisma.user.findUnique({ where: { email: ownerEmail } });

    if (!user) {
        console.error('Owner not found');
        process.exit(1);
    }

    const properties = await prisma.property.findMany();
    console.log(`Found ${properties.length} properties. Assigning to ${ownerEmail}...`);

    for (const p of properties) {
        await prisma.property.update({
            where: { id: p.id },
            data: { ownerId: user.id }
        });
    }

    console.log('✅ All properties assigned to demo owner!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
