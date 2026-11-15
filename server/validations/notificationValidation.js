const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const createNotificationSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title cannot exceed 100 characters",
  }),
  message: Joi.string().trim().min(5).max(1000).required().messages({
    "string.empty": "Message is required",
    "string.min": "Message must be atleast 5 characters",
    "string.max": "Message cannot exceed 1000 characters",
  }),
  busId: objectId.required().messages({
    "string.lenght": "Invalid bus ID format",
    "string.hex": "busId must be a valid ObjectId",
    "any.required": "busId is required",
  }),
  userId: objectId.allow(null).optional().messages({
    "string.lenght": "Invalid bus ID format",
    "string.hex": "busId must be a valid ObjectId",
  }),
  isRead: Joi.boolean().default(false),
});

const getNotificationsQuerySchema = Joi.object({
  userId: objectId.optional(),
  busId: objectId.optional(),
  isRead: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const idParamSchema = Joi.object({
  id: objectId.required().messages({
    "string.length": "Notification ID must be a 24-character hex string",
    "string.hex": "Invalid Notification ID format",
    "any.required": "Notification ID is required",
  }),
});

module.exports = {
  createNotificationSchema,
  getNotificationsQuerySchema,
  idParamSchema,
};
