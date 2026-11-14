const Location = require("../models/liveLocationModel");

class LocationService {
  /**
   * Log new telemetry data point
   */
  async recordLocation(payload) {
    return await Location.create(payload);
  }

  /**
   * Fetch the most recent recorded position of a bus
   */

  async getLatestBusLocation(busId) {
    return await Location.findOne({ busId })
      .sort({ createdAt: -1 })
      .populate("busId", "busNumber plateNumber capacity")
      .populate("scheduleId", "route departureTime arrivalTime")
      .lean();
  }

  /**
   * Get location history for a given schedule run (e.g. for map polylines)
   */

  async getLocationTrailBySchedule(scheduleId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [trail, total] = await Promise.all([
      Location.find({ scheduleId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Location.countDocuments({ scheduleId }),
    ]);

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      trail,
    };
  }


  /**
   * Find all active buses within a given radius in meters
   */
  async getNearbyBuses(longitude, latitude, maxDistanceInMeters = 5000) {
    return await Location.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: "distanceToUser",
          maxDistance: maxDistanceInMeters,
          spherical: true,
        },
      },
      // Group by bus to ensure we only get the closest/latest report per bus
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$busId",
          latestDocument: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$latestDocument" },
      },
    ]);
  }
}

module.exports = new LocationService();