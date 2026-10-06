const riderLocationService = require("../services/riderLocationServices");

class RiderLocationController {
  async submitPing(req, res, next) {
    try {
      const { busId, scheduleId, coordinates, speed } = req.body;
      const userId = req.user._id; // Extracted from auth middleware

      const ping = await riderLocationService.recordPing({
        busId,
        scheduleId,
        userId,
        coordinates,
        speed,
      });

      return res.status(200).json({
        success: true,
        message: "Location ping recorded",
        data: ping,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLiveBusLocation(req, res, next) {
    try {
      const { busId, scheduleId } = req.params;

      const consensus = await riderLocationService.getConsensusBusLocation(
        busId,
        scheduleId
      );

      if (!consensus) {
        return res.status(200).json({
          success: true,
          live: false,
          message: "No live tracking data currently available for this bus trip",
        });
      }

      return res.status(200).json({
        success: true,
        live: true,
        data: consensus,
      });
    } catch (error) {
      next(error);
    }
  }

  async leaveBus(req, res, next) {
    try {
      const { scheduleId } = req.body;
      const userId = req.user._id;

      await riderLocationService.stopRiderSession(userId, scheduleId);

      return res.status(200).json({
        success: true,
        message: "Successfully ended tracking session for this trip",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RiderLocationController();