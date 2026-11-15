import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],
});

const subscribedBusIds = new Set();

export const connectedSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
};

socket.on("connect", () => {
    console.log("Socket connected:", socket.id);

    subscribedBusIds.forEach((busId) => {
        socket.emit("join_bus", busId);
    });
});

export const disconnectSocket = () => {
    subscribedBusIds.clear();

    if (socket.connected) {
        socket.disconnect();
    }
};

export const joinBusTracking = (busId) => {
    if (!busId) return;

    subscribedBusIds.add(busId);

    if (socket.connected) {
        socket.emit("join_bus", busId);
    } else {
        socket.connect();
    }
};

export const leaveBusTracking = (busId) => {
    if (!busId) return;

    subscribedBusIds.delete(busId);

    if (socket.connected) {
        socket.emit("leave_bus", busId);
    }
};

export const onBusLocationUpdate = (callback) => {
    socket.on("bus_location_update", callback);

    return () => {
        socket.off("bus_location_update", callback);
    };
};

export const onTrackingError = (callback) => {
    socket.on("tracking_error", callback);

    return () => {
        socket.off("tracking_error", callback);
    };
};