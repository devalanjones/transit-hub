const mongoose = require("mongoose");

const riderLocationSchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
      index: true,
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    speed: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Geospatial index for radius and distance operations
riderLocationSchema.index({ location: "2dsphere" });

// Fast lookup for current active pings for a specific bus run
riderLocationSchema.index({ busId: 1, scheduleId: 1, updatedAt: -1 });

// Automatic cleanup: delete pings older than 30 minutes (1800 seconds)
riderLocationSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 1800 });

module.exports = mongoose.model("RiderLocation", riderLocationSchema);
