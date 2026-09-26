const busFareService = require("../services/busFareServices");

const createBusType = async (req, res) => {
  try {
    const newFare = await busFareService.createBusTypeService(req.body);

    return res.status(201).json({
      success: true,
      message: "Bus type fare created successfully",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const calculateFare = async (req, res) => {
  try {
    const { busTypeId, distanceInKm, passengers } = req.body;
    const result = await busFareService.calculateFareService(
      busTypeId,
      distanceInKm,
      passengers,
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

const estimateFare = async (req, res) => {
  try {
    const { busTypeId, distanceInKm, passengers } = req.query;
    const result = await busFareService.calculateFareService(
      busTypeId,
      distanceInKm,
      passengers,
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

const getAllFares = async (req, res) => {
  try {
    const fareRates = await busFareService.getAllFaresService();
    return res.status(200).json({ success: true, data: fareRates });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getFareById = async (req, res) => {
  try {
    const fareRate = await busFareService.getFareByIdService(req.params.id);
    return res.status(200).json({ success: true, data: fareRate });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

const updateFare = async (req, res) => {
  try {
    const updatedFare = await busFareService.updateFareService(
      req.params.id,
      req.body,
    );
    return res.status(200).json({
      success: true,
      message: "Fare rates updated successfully",
      data: updatedFare,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

module.exports = {
  createBusType,
  calculateFare,
  estimateFare,
  getAllFares,
  getFareById,
  updateFare,
};
