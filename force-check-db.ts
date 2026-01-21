
import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function main() {
    console.log('--- FORCED ENV CHECK ---');
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20));

    const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
    const prisma = new PrismaClient({ adapter });

    const props = await prisma.property.findMany();
    console.log('Properties list:', JSON.stringify(props, null, 2));

    await prisma.$disconnect();
}

main().catch(console.error);
