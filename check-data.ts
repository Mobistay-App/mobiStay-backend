
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const properties = await prisma.property.findMany({
        take: 5,
        select: {
            id: true,
            title: true,
            images: true,
            ownerId: true
        }
    });
    console.log(JSON.stringify(properties, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
