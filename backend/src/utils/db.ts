import mongoose from "mongoose";

// Cache connection for serverless environments (Vercel)
let isConnected = false; 

const dbConnect = async () => {
    // If already connected, return early
    if (isConnected) {
        console.log("Using existing MongoDB connection");
        return;
    }

    try {
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL is not defined in the environment variables.");
        }

        console.log("Attempting MongoDB connection...");

        const connectionInstance = await mongoose.connect(process.env.MONGODB_URL, {
            // bufferCommands: false prevents Mongoose from hanging indefinitely
            bufferCommands: false, 
        });

        isConnected = connectionInstance.connections[0].readyState === 1;
        console.log(`MongoDB connected successfully! DB Host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        // Do NOT use process.exit(1) on Vercel. Just throw the error.
        throw error; 
    }
}

export default dbConnect;