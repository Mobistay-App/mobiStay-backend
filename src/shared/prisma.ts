import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { env } from '../config/env.js';

// Required for @neondatabase/serverless in Node.js environments
neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL });

/**
 * Prisma Client instance using the Neon adapter.
 * In Prisma 7, driver adapters are required for direct database connections.
 */
export const prisma = new PrismaClient({ adapter });

export default prisma;
