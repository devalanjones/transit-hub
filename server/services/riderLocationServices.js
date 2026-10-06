const RiderLocation = require("../models/riderLocationModel");

class RiderLocationService {
  /**
   * Upsert rider's latest location heartbeat (every 30-60s)
   */
  async recordPing({ busId, scheduleId, userId, coordinates, speed }) {
    return await RiderLocation.findOneAndUpdate(
      { busId, scheduleId, userId },
      {
        $set: {
          location: { type: "Point", coordinates },
          speed,
          isActive: true,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * Stop tracking when a rider disembarks or taps "I got off"
   */
  async stopRiderSession(userId, scheduleId) {
    return await RiderLocation.deleteOne({ userId, scheduleId });
  }

  /**
   * Compute aggregated consensus bus position from all riders active in the last 2 minutes
   */
  async getConsensusBusLocation(busId, scheduleId) {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const result = await RiderLocation.aggregate([
      {
        $match: {
          busId: new (require("mongoose").Types.ObjectId)(busId),
          scheduleId: new (require("mongoose").Types.ObjectId)(scheduleId),
          updatedAt: { $gte: twoMinutesAgo },
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$busId",
          activeRiders: { $sum: 1 },
          avgLng: { $avg: { $arrayElemAt: ["$location.coordinates", 0] } },
          avgLat: { $avg: { $arrayElemAt: ["$location.coordinates", 1] } },
          avgSpeed: { $avg: "$speed" },
          lastReportedAt: { $max: "$updatedAt" },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return null; // Bus has no live crowdsourced pings
    }

    const data = result[0];
    const riderCount = data.activeRiders;

    // Confidence heuristic based on rider quorum
    let confidence = "LOW";
    if (riderCount >= 3) confidence = "HIGH";
    else if (riderCount === 2) confidence = "MEDIUM";

    return {
      busId: data._id,
      scheduleId,
      coordinates: [data.avgLng, data.avgLat],
      speed: Math.round(data.avgSpeed),
      activeRiderCount: riderCount,
      confidence, // LOW (1 rider), MEDIUM (2 riders), HIGH (3+ riders)
      lastUpdated: data.lastReportedAt,
    };
  }
}

module.exports = new RiderLocationService();