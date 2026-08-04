import "dotenv/config";
import app from "./app.js"
import dbConnect from "./utils/db.js";

const PORT = process.env.PORT || 8080

const startServer = async () => {
    try {
        await dbConnect();

        app.listen(PORT, () => {
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