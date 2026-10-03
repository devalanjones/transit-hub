const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/['"]/g, ""),
      }));

      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errorDetails,
      });
    }

    req[source] = value;
    next();
  };
};

module.exports = validate;