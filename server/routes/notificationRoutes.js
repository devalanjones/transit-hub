const express = require("express");
const validate = require("../middlewares/validate");
const {
  createNotificationSchema,
  getNotificationsQuerySchema,
  idParamSchema,
} = require("../validations/notificationValidation");
const notificationController = require("../controllers/notificationController");
const router = express.Router();

router.post(
  "/",
  validate(createNotificationSchema, "body"),
  notificationController.create,
);
router.get(
  "/",
  validate(getNotificationsQuerySchema, "query"),
  notificationController.getAll,
);
router.patch(
  "/mark-all-read",
  notificationController.markAllRead,
);
router.get(
  "/:id",
  validate(idParamSchema, "params"),
  notificationController.getById,
);
router.patch(
  "/:id/read",
  validate(idParamSchema, "params"),
  notificationController.markAsRead,
);
router.delete(
  "/:id",
  validate(idParamSchema, "params"),
  notificationController.delete,
);

module.exports = router