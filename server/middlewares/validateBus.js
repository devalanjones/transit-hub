const {
  busValidationSchema,
  updateBusValidationSchema,
} = require("../validations/busValidation");

const validateBus = (req, res, next) => {
  const { error, value } = busValidationSchema.validate(req.body, {
    abortEarly: false,
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

const validateUpdateBus = (req, res, next) => {
  const { error, value } = updateBusValidationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      errors: error.details.map((err) => err.message),
    });
  }

  req.body = value;
  next();
};

module.exports = {
  validateBus,
  validateUpdateBus,
};
