import { connectDB } from './server/config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

console.log('🧪 Testing MongoDB Connection...');
console.log('URI:', process.env.MONGO_URI ? 'Defined (Reference)' : 'Undefined');

const testConnection = async () => {
    try {
        await connectDB();
        console.log('✅ Connection Successful!');

        // Double check reuse
        console.log('🔄 Checking connection reuse...');
        await connectDB();

        process.exit(0);
    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
        process.exit(1);
    }
};

testConnection();
