
import { prisma } from './src/shared/prisma.js';

async function main() {
    console.log('--- CHECKING ALL PROPERTIES (INCLUDING INACTIVE) ---');
    const allCount = await prisma.property.count();
    console.log(`Total count (any status): ${allCount}`);

    const activeCount = await prisma.property.count({ where: { isActive: true } });
    console.log(`Active count: ${activeCount}`);

    const properties = await prisma.property.findMany();
    console.log('All properties:', JSON.stringify(properties, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
