const Notification = require("../models/notificationModel");

class NotificationService {
  async createNotification(payload) {
    return await Notification.create(payload);
  }


   // Fetch paginated notifications with dynamic filters
  async getNotifications(filters) {
    const { userId, busId, isRead, page = 1, limit = 20 } = filters;
    const query = {};

    if (userId) query.userId = userId;
    if (busId) query.busId = busId;
    if (typeof isRead === "boolean") query.isRead = isRead;

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .populate("busId", "busNumber routeName status")
        .populate("userId", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    return {
      notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

   // Get single notification by ID
  async getNotificationById(id) {
    return await Notification.findById(id)
      .populate("busId", "busNumber routeName")
      .populate("userId", "name email");
  }

   // Mark a notification as read
  async markAsRead(id) {
    return await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true, runValidators: true }
    );
  }

   // Mark all unread notifications for a user as read
  async markAllAsReadForUser(userId) {
    return await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );
  }


  async deleteNotification(id) {
    return await Notification.findByIdAndDelete(id);
  }
}

module.exports = new NotificationService();