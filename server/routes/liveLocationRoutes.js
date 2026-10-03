const express = require("express");
const router = express.Router();
const locationController = require("../controllers/liveLocationController");
const validate = require("../middlewares/validateLiveLocation");
const {
  createLocationSchema,
  getHistoryQuerySchema,
} = require("../validations/liveLocationValidation");

// POST: Add new location ping (driver device / rider device)
router.post(
  "/",
  validate(createLocationSchema, "body"),
  locationController.recordLocation
);

// GET: Current position of a specific bus
router.get("/bus/:busId/latest", locationController.getLatestLocation);

// GET: Historical route trail for a specific schedule
router.get(
  "/schedule/:scheduleId/trail",
  validate(getHistoryQuerySchema, "query"),
  locationController.getScheduleTrail
);

// GET: Nearby buses based on user location
router.get("/nearby", locationController.getNearbyBuses);

module.exports = router;