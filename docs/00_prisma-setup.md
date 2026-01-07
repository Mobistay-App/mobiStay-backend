# Prisma 7 Migration and Setup Guide

This document explains the steps taken to resolve the Prisma schema validation error (P1012) and how to manage the database connection using Prisma 7 and the Neon Driver Adapter.

## 1. The Problem: Prisma 7 Changes
Starting with **Prisma 7**, the way database connections are handled has changed significantly:
- **`schema.prisma` restriction**: You can no longer put the `url` (connection string) inside the `datasource` block of your schema file.
- **Prisma Config**: Connection details must now be moved to a `prisma.config.ts` file for the Prisma CLI (migrations, etc.).
- **Driver Adapters**: Prisma Client no longer includes a built-in database engine by default. You must now use a "Driver Adapter" (e.g., `@prisma/adapter-neon`) to talk to the database.

## 2. Steps Taken to Fix

### Step A: Update the Schema
We modified `prisma/schema.prisma` to remove the `url` property.
**Before:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
**After:**
```prisma
datasource db {
  provider = "postgresql"
}
```

### Step B: Create Prisma Configuration
We created a `prisma.config.ts` file in the root directory. This tells the Prisma CLI where to find the database URL for tasks like creating migrations.
```typescript
import 'dotenv/config'
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

### Step C: Install Required Adapters
To connect to the database from the code, we installed the following packages:
- `@prisma/adapter-neon`: The bridge between Prisma and Neon.
- `@neondatabase/serverless`: The driver that actually communicates with Neon.
- `ws`: Required for WebSocket connections in Node.js environments.

### Step D: Initialize Prisma Client
We created `src/shared/prisma.ts` to centralize the Prisma connection. This is the **only** place where the database connection is established.

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { env } from '../config/env.js';

// Required for Neon serverless in Node.js
neonConfig.webSocketConstructor = ws;

// Initialize the adapter with the connection string
const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL });

// Create the global Prisma instance using the adapter
export const prisma = new PrismaClient({ adapter });
```

---

## 3. How to use Prisma in this project

### Working with the Database in Code
**Never** create a new `new PrismaClient()`. Instead, always import the existing instance:

```typescript
import { prisma } from '../shared/prisma.js';

async function getUsers() {
  const users = await prisma.user.findMany();
  return users;
}
```

### Running Commands
If you change the `schema.prisma` file, you need to sync it:

1.  **Generate the Client**: Update the Typescript types for your models.
    ```bash
    npx prisma generate
    ```
2.  **Create a Migration**: Save your schema changes to the database.
    ```bash
    npx prisma migrate dev --name init_database
    ```
3.  **Open Database Studio**: View your data in a browser.
    ```bash
    npx prisma studio
    ```

## 4. Troubleshooting
- **Missing Env Vars**: If the app fails to start, ensure your `.env` file has a valid `DATABASE_URL`.
- **Import Errors**: Ensure you use the `.js` extension when importing local files (e.g., `import { env } from './env.js'`) if the project is using ES Modules.
