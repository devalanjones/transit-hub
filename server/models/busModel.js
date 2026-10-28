const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
  {
    busName: {
      type: String,
      required: true,
      trim: true,
    },
    busRegNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    busType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "busFare", 
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bus", busSchema);