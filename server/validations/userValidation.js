const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string().min(6).max(128).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
  }),
  role: Joi.string().valid("user", "admin", "driver").default("user"),
});

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  email: Joi.string().trim().lowercase().email(),
  password: Joi.string().min(6).max(128),
  role: Joi.string().valid("user", "admin", "driver"),
}).min(1);

module.exports = {
  registerSchema,
  updateUserSchema,
};