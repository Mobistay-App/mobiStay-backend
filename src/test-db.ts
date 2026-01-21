import { prisma } from './shared/prisma.js';

async function main() {
    console.log('--- DB Content Check ---');
    const properties = await prisma.property.findMany();
    console.log('Total Properties:', properties.length);
    properties.forEach(p => {
        console.log(`ID: ${p.id} | Title: ${p.title} | Images: ${JSON.stringify(p.images)}`);
    });

    const users = await prisma.user.findMany({ select: { id: true, email: true, firstName: true, avatarUrl: true } });
    console.log('\nTotal Users:', users.length);
    users.forEach(u => {
        console.log(`ID: ${u.id} | Name: ${u.firstName} | Email: ${u.email} | Avatar: ${u.avatarUrl}`);
    });
}

main().catch(console.error).finally(() => process.exit());
