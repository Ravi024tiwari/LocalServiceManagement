import "dotenv/config";
import http from "http";
import app from "./app.js";
import dbConnect from "./utils/db.js";
import { initSocket } from "./utils/socket.js";

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

// Initialize Socket.io server
initSocket(server);

const startServer = async () => {
    try {
        await dbConnect();

        server.listen(PORT, () => {
            console.log(`=================================`);
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`=================================`);
        });
    } catch (error) {
        console.error('Failed to start the server:', error);
        process.exit(1);
    }
};

startServer();