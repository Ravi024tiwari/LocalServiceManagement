import mongoose from "mongoose";
import dns from "dns";

const dbConnect = async () => {
    try {
        // Fallback check to ensure the URL exists
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL is not defined in the environment variables.");
        }

        // 🚀 FORCE NODE.JS TO USE GOOGLE & CLOUDFLARE DNS
        // This bypasses ISP-level blocking for SRV records
        dns.setServers([
            '8.8.8.8', // Google Public DNS (Primary)
            '8.8.4.4', // Google Public DNS (Secondary)
            '1.1.1.1'  // Cloudflare DNS (Backup)
        ]);

        console.log("Custom DNS configured. Attempting MongoDB connection...");

        // Connect using the standard SRV string from your .env
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URL, {
            family: 4, // Force IPv4 to prevent IPv6 routing issues
            serverSelectionTimeoutMS: 5000,
        });

        console.log(`\nMongoDB connected successfully! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}

export default dbConnect;