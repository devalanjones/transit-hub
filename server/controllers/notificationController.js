const notificationService = require("../services/notificationServices");

class NotificationController {
  async create(req, res, next) {
    try {
      const notification = await notificationService.createNotification(req.body);
      return res.status(201).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await notificationService.getNotifications(req.query);
      return res.status(200).json({
        success: true,
        data: result.notifications,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const notification = await notificationService.getNotificationById(req.params.id);
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }
      return res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id);
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }
      return res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllRead(req, res, next) {
    try {
      const userId = req.body.userId || req.user?._id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required to mark notifications as read",
        });
      }

      const result = await notificationService.markAllAsReadForUser(userId);
      return res.status(200).json({
        success: true,
        message: `${result.modifiedCount} notification(s) marked as read`,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const notification = await notificationService.deleteNotification(req.params.id);
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();