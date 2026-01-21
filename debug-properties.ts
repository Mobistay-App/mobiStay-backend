
import { prisma } from './src/shared/prisma';

async function main() {
    console.log('🔍 Listing all properties and their images...');
    const properties = await prisma.property.findMany({
        take: 5
    });

    if (properties.length === 0) {
        console.log('❌ No properties found.');
    } else {
        console.table(properties.map(p => ({
            id: p.id.substring(0, 8),
            title: p.title,
            type: p.type,
            images: p.images,
            count: p.images.length
        })));

        properties.forEach(p => {
            if (p.images.length > 0) {
                console.log(`Property [${p.title}] images:`, p.images);
            }
        });
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
