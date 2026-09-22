const express = require("express");
const { validateSchedule, validateUpdateSchedule } = require("../middleware/validateSchedule");
const { createSchedule, getAllSchedules, getScheduleById, updateSchedule, deleteSchedule, getAssignedSchedulesByBus, getSchedulesByRoute, getSchedulesByStop, getCandidateStopsByRoute, getRouteGeometryByStops } = require("../controllers/scheduleController");
const router = express.Router()

router.get("/:busId/assigned-schedules", getAssignedSchedulesByBus);
router.get("/route/:routeId/schedules", getSchedulesByRoute);
router.get("/route/:routeId/candidate-stops", getCandidateStopsByRoute);
router.get("/stop/:stopId/schedules", getSchedulesByStop);
router.post("/route-geometry", getRouteGeometryByStops);
router.post("/", validateSchedule, createSchedule);
router.get("/", getAllSchedules);
router.get("/:id", getScheduleById);
router.put("/:id", validateUpdateSchedule, updateSchedule);
router.delete("/:id", deleteSchedule);


module.exports = router;