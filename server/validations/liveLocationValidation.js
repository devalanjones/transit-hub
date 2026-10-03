const Joi = require("joi");

// Helper to validate Mongo ObjectIDs
const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid Mongo ObjectId');
  }
  return value;
};

const createLocationSchema = Joi.object({
  bus: Joi.string().custom(objectId).required(),
  schedule: Joi.string().custom(objectId).required(),
  location: Joi.object({
    type: Joi.string().valid("Point").default("Point"),
    coordinates: Joi.array()
      .items(
        Joi.number().min(-180).max(180).required(), // Longitude
        Joi.number().min(-90).max(90).required()    // Latitude
      )
      .length(2)
      .required(),
  }).required(),
  speed: Joi.number().min(0).max(200).required(),
  distanceCovered: Joi.number().min(0).required(),
  source: Joi.string().valid("rider", "driver").default("rider"),
  activeRiderCount: Joi.number().integer().min(0).required(),
});

const getHistoryQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  page: Joi.number().integer().min(1).default(1),
});

module.exports = {
  createLocationSchema,
  getHistoryQuerySchema,
};