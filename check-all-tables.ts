
import { prisma } from './src/shared/prisma.js';

async function main() {
    console.log('--- GLOBAL DB DATA CHECK ---');
    const tables = ['User', 'Property', 'Booking', 'Ride', 'OwnerProfile', 'DriverProfile'];

    for (const table of tables) {
        try {
            // @ts-ignore
            const count = await prisma[table.toLowerCase()].count();
            console.log(`${table}: ${count} rows`);
        } catch (e) {
            console.log(`${table}: Error or table missing`);
        }
    }
}

main().finally(() => prisma.$disconnect());
