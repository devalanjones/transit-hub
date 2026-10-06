const express = require("express");
const router = express.Router();
const riderLocationController = require("../controllers/riderLocationController");
const validate = require("../middlewares/validateLiveLocation");
const { pingLocationSchema } = require("../validations/riderLocationValidation");
// const authMiddleware = require("../middlewares/auth.middleware"); // JWT auth

// All rider tracking actions require authenticated users
// router.use(authMiddleware);

// Periodic ping (sent every 30-60s while rider has "I'm on this bus" enabled)
router.post(
  "/ping",
  validate(pingLocationSchema, "body"),
  riderLocationController.submitPing
);

// Rider marks they arrived or got off
router.post("/leave", riderLocationController.leaveBus);

// Riders and waiting commuters fetch the calculated live position
router.get(
  "/bus/:busId/schedule/:scheduleId",
  riderLocationController.getLiveBusLocation
);

module.exports = router;