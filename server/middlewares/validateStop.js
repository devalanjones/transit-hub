const stopValidationSchema = require("../validations/stopValidation");

const validateStop = (req, res, next) => {
  const { error, value } = stopValidationSchema.validate(req.body, {
    abortEarly: false,
    convert: true,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      errors: error.details.map((e) => e.message),
    });
  }

  req.body = value;

  next();
};

module.exports = validateStop;
