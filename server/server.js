let dns = require("node:dns");
dns.setServers(["1.1.1.1", "1.0.0.1"]);
let http = require("http");
let express = require("express");
let cors = require("cors");
const { initSocket } = require("./socket");

let app = express();
app.use(express.json());
app.use(cors());

let mongodbConnect = require("./config/dbconfig");
mongodbConnect();

let busRouter = require("./routes/busRoutes");
let routeRouter = require("./routes/routeRoutes");
let stopRouter = require("./routes/stopRoutes");
let scheduleRouter = require("./routes/scheduleRoutes");
let busFareRouter = require("./routes/busFareRoutes");
let liveLocationRouter = require("./routes/liveLocationRoutes");
let riderLocationRouter = require("./routes/riderLocationRoutes");
let trackingRouter = require("./routes/trackingRoutes");

app.use("/buses", busRouter);
app.use("/routes", routeRouter);
app.use("/stops", stopRouter);
app.use("/schedules", scheduleRouter);
app.use("/busFare", busFareRouter);
app.use("/liveLocation", liveLocationRouter);
app.use("/riderLocation", riderLocationRouter);
app.use("/tracking", trackingRouter);

const httpServer = http.createServer(app);

// Initialize Socket.io
initSocket(httpServer);

const port = process.env.PORT;

app.listen(port, () => {
  console.log("Server connected");
});
