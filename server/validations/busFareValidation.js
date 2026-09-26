const Joi = require("joi");

const createbusTypeSchema = Joi.object({
  busType: Joi.string().trim().min(2).max(50).required().messages({
    "string.base": "busType must be a string",
    "string.empty": "busType cannot be empty",
    "string.min": "busType must be at least 2 characters long",
    "any.required": "busType is required",
  }),
  baseFare: Joi.number().min(0).required().messages({
    "number.base": "baseFare must be a number",
    "number.min": "baseFare cannot be negative",
    "any.required": "baseFare is required",
  }),
  farePerKm: Joi.number().positive().required().messages({
    "number.base": "farePerKm must be a number",
    "number.positive": "farePerKm must be greater than 0",
    "any.required": "farePerKm is required",
  }),
});

const fareCalculationScheme = Joi.object({
  busTypeId: Joi.string().hex().length(24).required().messages({
    "string.hex": "busTypeId must be a valid MongoDB ObjectId",
    "string.length": "busTypeId must be 24 characters long",
    "any.required": "busTypeId is required",
  }),
  distanceInKm: Joi.number().positive().required().messages({
    "number.positive": "distanceInKm must be greater than 0",
    "any.required": "distanceInKm is required",
  }),
  passengers: Joi.number().integer().min(1).default(1),
});

const fareQuerySchema = Joi.object({
  busTypeId: Joi.string().hex().length(24).required(),
  distanceInKm: Joi.number().positive().required(),
  passengers: Joi.number().integer().min(1).default(1),
});

const idParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.hex": "ID must be a valid MongoDB ObjectId",
    "string.length": "ID must be 24 characters long",
  }),
});

const updateFareSchema = Joi.object({
  bustype: Joi.string().trim().optional(),
  baseFare: Joi.number().min(0).optional(),
  farePerKm: Joi.number().positive().optional(),
}).min(1);

module.exports = {
  createbusTypeSchema,
  fareCalculationScheme,
  fareQuerySchema,
  idParamSchema,
  updateFareSchema,
};
