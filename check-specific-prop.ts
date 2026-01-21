
import { prisma } from './src/shared/prisma.js';

async function main() {
    console.log('--- TARGETED ID CHECK ---');
    const propertyId = 'cmkcmua380000fgv57wwf1aj2';
    const prop = await prisma.property.findUnique({
        where: { id: propertyId }
    });

    if (prop) {
        console.log('✅ Found property:', prop.title);
    } else {
        console.log('❌ Property NOT found by ID in THIS database.');
        const all = await prisma.property.findMany();
        console.log('Count:', all.length);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
