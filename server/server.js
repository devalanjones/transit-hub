let dns = require("dns")
dns.setServers(['1.1.1.1','1.0.0.1'])
let express = require("express")
let cors = require("cors")


let app = express()
app.use(express.json())
app.use(cors())

let mongodbConnect =require("./config/dbconfig")
mongodbConnect()

let busRouter = require("./routes/busRoutes")
let routeRouter = require("./routes/routeRoutes")
let stopRouter = require("./routes/stopRoutes")
let scheduleRouter = require("./routes/scheduleRoutes")
let busFareRouter = require("./routes/busFareRoutes")
let liveLocationRouter = require("./routes/liveLocationRoutes")

app.use("/buses", busRouter)
app.use("/routes", routeRouter)
app.use("/stops", stopRouter)
app.use("/schedules", scheduleRouter)
app.use("/busFare", busFareRouter) 
app.use("/liveLocation", liveLocationRouter) 

const port = process.env.PORT

app.listen(port, () => {
console.log("Server connected");

})