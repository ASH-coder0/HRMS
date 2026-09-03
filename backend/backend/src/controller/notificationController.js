const notificationService = require('../services/notificationServices');

class NotificationController {
  // POST /notifications
  async create(req, res) {
    try {
      const notification = await notificationService.createNotification(req.body);
      return res.status(201).json({ success: true, data: notification });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /notifications/bulk
  async createBulk(req, res) {
    try {
      const { notifications } = req.body;
      if (!Array.isArray(notifications) || notifications.length === 0) {
        return res.status(400).json({ success: false, message: 'notifications array is required' });
      }
      const result = await notificationService.createBulkNotifications(notifications);
      return res.status(201).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /notifications
  async getAll(req, res) {
    try {
      const { page, limit, user_id, type, is_read, publishStatus } = req.query;
      const result = await notificationService.getAllNotifications({
        page,
        limit,
        user_id,
        type,
        is_read: is_read !== undefined ? is_read === 'true' : undefined,
        publishStatus,
      });
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /notifications/:id
  async getById(req, res) {
    try {
      const notification = await notificationService.getNotificationById(req.params.id);
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }
      return res.status(200).json({ success: true, data: notification });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /notifications/user/:user_id
  async getUserNotifications(req, res) {
    try {
      const { user_id } = req.params;
      const { page, limit, is_read } = req.query;
      const result = await notificationService.getUserNotifications(user_id, {
        page,
        limit,
        is_read: is_read !== undefined ? is_read === 'true' : undefined,
      });
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /notifications/user/:user_id/unread-count
  async getUnreadCount(req, res) {
    try {
      const count = await notificationService.getUnreadCount(req.params.user_id);
      return res.status(200).json({ success: true, unreadCount: count });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // PUT /notifications/:id
  async update(req, res) {
    try {
      const notification = await notificationService.updateNotification(req.params.id, req.body);
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }
      return res.status(200).json({ success: true, data: notification });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // PATCH /notifications/:id/read
  async markAsRead(req, res) {
    try {
      const notification = await notificationService.markAsRead(req.params.id);
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }
      return res.status(200).json({ success: true, data: notification });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // PATCH /notifications/user/:user_id/read-all
  async markAllAsRead(req, res) {
    try {
      const affectedCount = await notificationService.markAllAsRead(req.params.user_id);
      return res.status(200).json({ success: true, updated: affectedCount });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE /notifications/:id
  async delete(req, res) {
    try {
      const result = await notificationService.deleteNotification(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }
      return res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE /notifications/user/:user_id/read
  async deleteReadNotifications(req, res) {
    try {
      const count = await notificationService.deleteReadNotifications(req.params.user_id);
      return res.status(200).json({ success: true, deleted: count });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new NotificationController();