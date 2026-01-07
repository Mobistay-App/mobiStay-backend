# 🛠️ Database & Prisma Workflow Guide

This guide ensures you can always connect to your database, keep your schema in sync, and troubleshoot issues.

## 1. The Core Commands

### A. Syncing Schema with Database
Whenever you edit `prisma/schema.prisma`, you must run this to update your Neon database:
```bash
npx prisma db push
```
*   **What it does:** It compares your local schema with the database schema and applies changes (Simpler than migrations for development).
*   **When to use:** After adding a new model or field.

### B. Updating TypeScript Types
After updating your schema, you need to tell TypeScript about the changes:
```bash
npx prisma generate
```
*   **What it does:** Updates `node_modules/@prisma/client` so your code knows about `prisma.user`, `prisma.booking`, etc.
*   **When to use:** Often runs automatically after `db push`, but run this manually if you see TypeScript errors like "Property 'xyz' does not exist on type 'User'".

### C. Viewing Your Data
To see what is actually inside your database without writing SQL:
```bash
npx prisma studio
```
*   **What it does:** Opens a web dashboard at `http://localhost:5555`.
*   **When to use:** To manually check if users are created, delete test data, or verify relationships.

---

## 2. Daily Workflow Routine

1.  **Start your day:**
    *   Ensure your internet is active (Neon is serverless/cloud-based).
    *   No need to "start" a local database server like MySQL/PostgreSQL.

2.  **Making Changes:**
    *   Edit `prisma/schema.prisma`.
    *   Run `npx prisma db push`.
    *   Run `npx prisma generate`.

3.  **Verifying Connection:**
    *   Run `npx prisma studio`. If it loads, your database is working perfectly.

---

## 3. Troubleshooting Connection Issues

If you see errors like `Can't reach database server` or `Unique constraint failed`:

1.  **Check `.env`:**
    Ensure `DATABASE_URL` is correct and starts with `postgresql://`.

2.  **Check Internet:**
    Since we use Neon (cloud), you must be online.

3.  **Reset Data (Destructive):**
    If your local data is messed up and you want to start fresh:
    ```bash
    npx prisma migrate reset
    ```
    *Warning: This deletes all data!*

4.  **Test Script:**
    Run our simulation script to verification the connection via code:
    ```bash
    npx tsx simulate-register.ts
    ```
