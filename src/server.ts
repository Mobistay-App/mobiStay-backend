import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
    console.log(`Database: Connected via Prisma + Neon Adapter\n`);
});