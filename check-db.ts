import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkData() {
    try {
        const userCount = await prisma.user.count();
        const propertyCount = await prisma.property.count();
        const bookingCount = await prisma.booking.count();

        console.log('--- Database Stats ---');
        console.log(`Users: ${userCount}`);
        console.log(`Properties: ${propertyCount}`);
        console.log(`Bookings: ${bookingCount}`);

        const sampleProperty = await prisma.property.findFirst({
            include: { owner: true }
        });
        console.log('\n--- Sample Property ---');
        console.log(JSON.stringify(sampleProperty, null, 2));

    } catch (err) {
        console.error('Error checking data:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
