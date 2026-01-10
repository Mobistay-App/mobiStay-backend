import 'dotenv/config'
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: {
        // Fallback to a dummy URL if DATABASE_URL is missing (e.g. during CI build)
        url: process.env.DATABASE_URL ?? "postgresql://placeholder:5432/placeholder",
    },
});
