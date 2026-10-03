const locationService = require("../services/liveLocationServices");

class LocationController {
  async recordLocation(req, res, next) {
    try {
      const locationData = await locationService.recordLocation(req.body);
      return res.status(201).json({
        success: true,
        data: locationData,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLatestLocation(req, res, next) {
    try {
      const { busId } = req.params;
      const latest = await locationService.getLatestBusLocation(busId);

      if (!latest) {
        return res.status(404).json({
          success: false,
          message: "No tracking history found for this bus",
        });
      }

      return res.status(200).json({
        success: true,
        data: latest,
      });
    } catch (error) {
      next(error);
    }
  }

  async getScheduleTrail(req, res, next) {
    try {
      const { scheduleId } = req.params;
      const { page, limit } = req.query;

      const trailData = await locationService.getLocationTrailBySchedule(
        scheduleId,
        Number(page),
        Number(limit)
      );

      return res.status(200).json({
        success: true,
        ...trailData,
      });
    } catch (error) {
      next(error);
    }
  }

  async getNearbyBuses(req, res, next) {
    try {
      const { lng, lat, radius } = req.query;

      if (!lng || !lat) {
        return res.status(400).json({
          success: false,
          message: "Coordinates 'lng' and 'lat' query parameters are required",
        });
      }

      const buses = await locationService.getNearbyBuses(
        lng,
        lat,
        radius ? Number(radius) : 5000
      );

      return res.status(200).json({
        success: true,
        count: buses.length,
        data: buses,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LocationController();