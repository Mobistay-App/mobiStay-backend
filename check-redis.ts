
import { redis } from './src/shared/redis.js';

async function main() {
    console.log('--- REDIS CONNECTION CHECK ---');
    try {
        await redis.set('test_otp_key', '123456');
        const value = await redis.get('test_otp_key');
        console.log(`✅ Redis Write/Read Successful. Value: ${value}`);

        await redis.del('test_otp_key');
        console.log('✅ Redis Delete Successful.');
    } catch (error) {
        console.error('❌ Redis Connection Failed:', error);
    }
}

main().catch(console.error);
