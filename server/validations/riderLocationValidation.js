const Joi = require("joi");

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid Mongo ObjectId');
  }
  return value;
};

const pingLocationSchema = Joi.object({
  busId: Joi.string().custom(objectId).required(),
  scheduleId: Joi.string().custom(objectId).required(),
  coordinates: Joi.array()
    .items(
      Joi.number().min(-180).max(180).required(), // Longitude
      Joi.number().min(-90).max(90).required(), // Latitude
    )
    .length(2)
    .required(),
  speed: Joi.number().min(0).max(160).default(0),
});

module.exports = { pingLocationSchema };
