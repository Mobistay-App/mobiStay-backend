
import { prisma } from './src/shared/prisma.js';

async function main() {
    const propertyCount = await prisma.property.count();
    const userCount = await prisma.user.count();

    console.log(`Total Properties in DB: ${propertyCount}`);
    console.log(`Total Users in DB: ${userCount}`);

    if (propertyCount > 0) {
        const properties = await prisma.property.findMany({
            include: { owner: true }
        });
        console.log('--- PROPERTIES ---');
        properties.forEach(p => {
            console.log(`- ${p.title} (${p.city}) - Active: ${p.isActive}`);
        });
    } else {
        console.log('⚠️ Property table is EMPTY.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
