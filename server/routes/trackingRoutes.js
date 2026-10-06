const express = require("express");
const router = express.Router();
const trackingController = require("../controllers/trackingController");
const validate = require("../middlewares/validateLiveLocation");
const { pingLocationSchema } = require("../validations/riderLocationValidation");

// Ingest crowdsourced rider updates
router.post(
  "/rider-ping",
  validate(pingLocationSchema, "body"),
  (req, res, next) => trackingController.riderPing(req, res, next)
);

// Ingest official driver GPS updates
router.post(
  "/driver-ping",
  (req, res, next) => trackingController.driverPing(req, res, next)
);

module.exports = router;