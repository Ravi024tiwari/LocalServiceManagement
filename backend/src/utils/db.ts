import mongoose from "mongoose";
import dns from "dns";

const dbConnect = async (): Promise<void> => {
    // If already connected (1 = connected, 2 = connecting), reuse existing connection
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL is not defined in the environment variables.");
        }

        // Only set custom DNS in local development (not on Vercel or in production)
        if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
            try {
                dns.setServers([
                    '8.8.8.8', // Google Public DNS
                    '8.8.4.4',
                    '1.1.1.1'
                ]);
                console.log("Custom DNS configured for local development.");
            } catch (dnsErr) {
                console.warn("Failed to set custom DNS servers:", dnsErr);
            }
        }

        console.log("Attempting MongoDB connection...");

        const connectionInstance = await mongoose.connect(process.env.MONGODB_URL, {
            family: 4, // Force IPv4 to prevent IPv6 routing issues
            serverSelectionTimeoutMS: 5000,
        });

        console.log(`MongoDB connected successfully! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
};

export default dbConnect;