const trackingService = require("../services/trackingServices");

class TrackingController {
  async riderPing(req, res, next) {
    try {
      const { busId, scheduleId, coordinates, speed } = req.body;
      const userId = req.user ? req.user._id : req.body.userId;

      const result = await trackingService.processRiderPing({
        busId,
        scheduleId,
        userId,
        coordinates,
        speed,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async driverPing(req, res, next) {
    try {
      const { busId, scheduleId, coordinates, speed, distanceCovered } = req.body;

      const result = await trackingService.processDriverPing({
        busId,
        scheduleId,
        coordinates,
        speed,
        distanceCovered,
      });

      return res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TrackingController();