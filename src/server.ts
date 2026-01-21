import app from './app.js';
import { env } from './config/env.js';

const PORT = Number(env.PORT) || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Backend optimized for local & remote access`);
    console.log(`📡 URL: http://0.0.0.0:${PORT}`);
    console.log(`🌍 Network: http://10.11.100.236:${PORT}`);
    console.log(`-------------------------------------------\n`);
});