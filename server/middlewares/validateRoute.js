const {
  routeValidationSchema,
  updateRouteValidationSchema,
} = require("../validations/routeValidation");

const validateRoute = (req, res, next) => {
  const { error, value } = routeValidationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details.map((e) => e.message),
    });
  }
  req.body = value;

  next();
};

const validateUpdateRoute = (req, res, next) => {
  const { error, value } = updateRouteValidationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details.map((e) => e.message),
    });
  }
  req.body = value;

  next();
};

module.exports = {
  validateRoute,
  validateUpdateRoute,
};
