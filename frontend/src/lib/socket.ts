import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8080";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(BACKEND_URL, {
            autoConnect: true,
            withCredentials: true,
            transports: ['websocket', 'polling']
        });
    }
    return socket;
};
