import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

export const initSocket = (server: HTTPServer): Server => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on('connection', (socket: Socket) => {
        // Room joining for service pages, provider dashboards, and admin panels
        socket.on('join_service', (serviceId: string) => {
            if (serviceId) {
                socket.join(`service_${serviceId}`);
            }
        });

        socket.on('leave_service', (serviceId: string) => {
            if (serviceId) {
                socket.leave(`service_${serviceId}`);
            }
        });

        socket.on('join_provider', (providerId: string) => {
            if (providerId) {
                socket.join(`provider_${providerId}`);
            }
        });

        socket.on('join_admin', () => {
            socket.join('admin_channel');
        });

        socket.on('disconnect', () => {
            // Clean disconnect handled automatically by Socket.io
        });
    });

    return io;
};

export const getIO = (): Server => {
    if (!io) {
        throw new Error('Socket.io is not initialized.');
    }
    return io;
};

export const broadcastReviewUpdate = (serviceId: string, providerId: string, payload: any) => {
    if (!io) return;

    // Broadcast to service subscribers (Customers & Guests)
    io.to(`service_${serviceId}`).emit('review:updated', payload);

    // Broadcast to provider room (Provider Dashboard)
    io.to(`provider_${providerId}`).emit('review:updated', payload);

    // Broadcast to admin room (Admin Dashboard)
    io.to('admin_channel').emit('review:updated', payload);
};
