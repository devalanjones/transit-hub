const { Server } = require("socket.io");

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Commuter or driver joins tracking channel for a specific bus
    socket.on("join_bus", (busId) => {
      if (!busId) return;
      socket.join(`bus:${busId}`);
      console.log(`Socket ${socket.id} subscribed to bus:${busId}`);
    });

    // Commuter leaves tracking channel (e.g., switches screens)
    socket.on("leave_bus", (busId) => {
      if (!busId) return;
      socket.leave(`bus:${busId}`);
      console.log(`Socket ${socket.id} unsubscribed from bus:${busId}`);
    });

    // Direct WebSocket ingestion for rider pings
    socket.on("rider_ping", async (payload) => {
      try {
        const trackingService = require("../services/tracking.service");
        await trackingService.processRiderPing(payload);
      } catch (err) {
        socket.emit("tracking_error", { message: err.message });
      }
    });

    // Direct WebSocket ingestion for driver pings
    socket.on("driver_ping", async (payload) => {
      try {
        const trackingService = require("../services/tracking.service");
        await trackingService.processDriverPing(payload);
      } catch (err) {
        socket.emit("tracking_error", { message: err.message });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };