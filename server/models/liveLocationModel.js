const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
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
    // Standard GeoJSON Point for geospatial queries ($near, geoNear)
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
    },
    distanceCovered: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      enum: ["rider", "driver"],
      default: "rider",
    },
    activeRiderCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Enable 2dsphere index for location queries and compound index for time-series lookup
locationSchema.index({ location: "2dsphere" });
locationSchema.index({ busId: 1, createdAt: -1 });

module.exports = mongoose.model("Location", locationSchema);