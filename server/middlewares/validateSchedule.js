const {
  scheduleValidationSchema,
  updateScheduleValidationSchema,
  searchBusScheduleSchema,
} = require("../validations/scheduleValidation");

/**
 * Higher-order middleware factory for Joi validation
 * @param {Joi.Schema} schema - The Joi schema to validate against
 * @param {'body' | 'query' | 'params'} [source='body'] - Request property to validate
 */
const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((detail) => detail.message),
      });
    }

    req[source] = value;
    next();
  };

module.exports = {
  validateSchedule: validate(scheduleValidationSchema, "body"),
  validateUpdateSchedule: validate(updateScheduleValidationSchema, "body"),
  validateSearchSchedule: validate(searchBusScheduleSchema, "query"),
};
