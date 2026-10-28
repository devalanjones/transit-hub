let dns = require("node:dns");
dns.setServers(["1.1.1.1", "1.0.0.1"]);

require("dotenv").config(); // Ensure env variables are loaded
const http = require("http");
const express = require("express");
const cors = require("cors");
const { initSocket } = require("./socket");
const mongodbConnect = require("./config/dbconfig");

const app = express();

// Database Connection
mongodbConnect();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Routes
const busRouter = require("./routes/busRoutes");
const routeRouter = require("./routes/routeRoutes");
const stopRouter = require("./routes/stopRoutes");
const scheduleRouter = require("./routes/scheduleRoutes");
const busFareRouter = require("./routes/busFareRoutes");
const liveLocationRouter = require("./routes/liveLocationRoutes");
const riderLocationRouter = require("./routes/riderLocationRoutes");
const trackingRouter = require("./routes/trackingRoutes");
const notificationRouter = require("./routes/notificationRoutes");

app.use("/buses", busRouter);
app.use("/routes", routeRouter);
app.use("/stops", stopRouter);
app.use("/schedules", scheduleRouter);
app.use("/busFare", busFareRouter);
app.use("/liveLocation", liveLocationRouter);
app.use("/riderLocation", riderLocationRouter);
app.use("/tracking", trackingRouter);
app.use("/notification", notificationRouter);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler 
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Create HTTP Server & Bind Socket.io
const httpServer = http.createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});