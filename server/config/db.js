import mongoose from 'mongoose';

// Cache the connection
let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        isConnected = !!conn.connections[0].readyState;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // In serverless, we don't necessarily want to exit the process
        // during a connection attempt failure, but we should throw
        throw error;
    }
};
