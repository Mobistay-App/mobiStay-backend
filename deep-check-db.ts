
import { prisma } from './src/shared/prisma.js';

async function main() {
    console.log('--- DB CONNECTION CHECK ---');
    try {
        const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log('Tables found:', result);

        const count = await prisma.property.count();
        console.log('Property count:', count);

        if (count > 0) {
            const sample = await prisma.property.findFirst();
            console.log('Sample property:', sample);
        }
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
