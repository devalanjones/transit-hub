const BusFare = require("../models/busFareModel");

const createBusTypeService = async (data) => {
  const { busType, baseFare, farePerKm } = data;

  const existingBusType = await BusFare.findOne({
    busType: { $regex: new RegExp(`^${busType.trim()}$`, "i") },
  });

  if (existingBusType) {
    const error = new Error(`Bus type '${busType}' already exists`);
    error.statusCode = 409; // Conflict
    throw error;
  }

  const newFareRate = await BusFare.create({
    busType: busType.trim(),
    baseFare,
    farePerKm,
  });

  return newFareRate;
};

const calculateFareService = async (
  busTypeId,
  distanceInKm,
  passengers = 1,
) => {
  const bus = await BusFare.findById(busTypeId);
  if (!bus) {
    const err = new Error("Bus type not found");
    err.statusCode = 404;
    throw err;
  }

  const farePerPassenger = bus.baseFare + distanceInKm * bus.farePerKm;
  const totalFare = farePerPassenger * passengers;

  return {
    busType: bus.busType,
    baseFare: bus.baseFare,
    farePerKm: bus.farePerKm,
    distanceInKm,
    passengers,
    farePerPassenger: Number(farePerPassenger.toFixed(2)),
    totalFare: Number(totalFare.toFixed(2)),
  };
};

const getAllFaresService = async () => {
  return await BusFare.find().select(
    "busType baseFare farePerKm createdAt updatedAt",
  );
};

const getFareByIdService = async (id) => {
  const fare = await BusFare.findById(id);
  if (!fare) {
    const err = new Error("Fare rate configuration not found");
    err.statusCode = 404;
    throw err;
  }
  return fare;
};

const updateFareService = async (id, updateData) => {
  const updatedFare = await BusFare.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedFare) {
    const err = new Error("Fare rate configuration not found to update");
    err.statusCode = 404;
    throw err;
  }

  return updatedFare;
};

module.exports = {
  createBusTypeService,
  calculateFareService,
  getAllFaresService,
  getFareByIdService,
  updateFareService,
};
