const mongoose = require("mongoose");
const RiderLocation = require("../models/riderLocationModel");
const Location = require("../models/liveLocationModel");
const { getIO } = require("../socket");

class TrackingService {
  /**
   * Broadcast consolidated location payload to room subscribers
   */
  broadcastBusLocation(busId, payload) {
    try {
      const io = getIO();
      io.to(`bus:${busId}`).emit("bus_location_update", payload);
    } catch (error) {
      console.error("Socket emission failed:", error.message);
    }
  }

  /**
   * Ingest driver GPS ping (high authority, immediate broadcast)
   */
  async processDriverPing({ busId, scheduleId, coordinates, speed = 0, distanceCovered = 0 }) {
    const record = await Location.create({
      busId,
      scheduleId,
      location: { type: "Point", coordinates },
      speed,
      distanceCovered,
      source: "driver",
      activeRiderCount: 0,
    });

    const payload = {
      busId,
      scheduleId,
      coordinates: record.location.coordinates,
      speed: record.speed,
      source: "driver",
      activeRiders: 0,
      confidence: "HIGH",
      updatedAt: record.createdAt,
    };

    this.broadcastBusLocation(busId, payload);
    return payload;
  }

  /**
   * Ingest crowdsourced rider ping, compute consensus, and broadcast
   */
  async processRiderPing({ busId, scheduleId, userId, coordinates, speed = 0 }) {
    const riderFilter = userId
      ? { busId, scheduleId, userId }
      : { busId, scheduleId, _id: new mongoose.Types.ObjectId() };

    // Upsert rider's most recent location
    await RiderLocation.findOneAndUpdate(
      riderFilter,
      {
        $set: {
          busId,
          scheduleId,
          userId: userId || null,
          location: { type: "Point", coordinates },
          speed,
          isActive: true,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Compute consensus using active pings from the last 90 seconds
    const ninetySecondsAgo = new Date(Date.now() - 90 * 1000);

    const consensus = await RiderLocation.aggregate([
      {
        $match: {
          busId: new mongoose.Types.ObjectId(busId),
          scheduleId: new mongoose.Types.ObjectId(scheduleId),
          isActive: true,
          updatedAt: { $gte: ninetySecondsAgo },
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

    if (!consensus || consensus.length === 0) return null;

    const data = consensus[0];
    const riderCount = data.activeRiders;

    let confidence = "LOW";
    if (riderCount >= 3) confidence = "HIGH";
    else if (riderCount === 2) confidence = "MEDIUM";

    const payload = {
      busId,
      scheduleId,
      coordinates: [data.avgLng, data.avgLat],
      speed: Math.round(data.avgSpeed),
      source: "rider",
      activeRiders: riderCount,
      confidence,
      updatedAt: data.lastReportedAt,
    };

    // Store consensus entry in main Location history
    await Location.create({
      busId,
      scheduleId,
      location: { type: "Point", coordinates: payload.coordinates },
      speed: payload.speed,
      distanceCovered: 0,
      source: "rider",
      activeRiderCount: riderCount,
    });

    // Push update to all riders tracking this bus
    this.broadcastBusLocation(busId, payload);
    return payload;
  }
}

module.exports = new TrackingService();