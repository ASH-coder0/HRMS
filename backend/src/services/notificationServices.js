const { Op } = require('sequelize');
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const Role = require('../../models/Role');
const Employee = require('../../models/Employee');

class NotificationService {
  // Create a new notification
  async createNotification(data) {
    return await Notification.create(data);
  }

  // Bulk create (e.g. send to multiple users at once)
  async createBulkNotifications(notificationsArray) {
    return await Notification.bulkCreate(notificationsArray);
  }

  // Get all notifications with filters + pagination
  async getAllNotifications({ page = 1, limit = 20, user_id, type, is_read, publishStatus }) {
    const offset = (page - 1) * limit;
    const where = {};

    if (user_id) where.user_id = user_id;
    if (type) where.type = type;
    if (is_read !== undefined) where.is_read = is_read;
    if (publishStatus) where.publishStatus = publishStatus;

    const { rows, count } = await Notification.findAndCountAll({
      where,
      include: [{ model: User, as: 'users', attributes: ['id', 'email', 'employee_id'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  // Get single notification by id
  async getNotificationById(id) {
    return await Notification.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'employee_id'] }],
    });
  }

  // Get notifications for a specific user
  async getUserNotifications(user_id, { page = 1, limit = 20, is_read } = {}) {
    const offset = (page - 1) * limit;
    const where = { user_id, publishStatus: 'published' };
    if (is_read !== undefined) where.is_read = is_read;

    const { rows, count } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  // Count unread notifications for a user
  async getUnreadCount(user_id) {
    return await Notification.count({
      where: { user_id, is_read: false, publishStatus: 'published' },
    });
  }

  // Update notification
  async updateNotification(id, data) {
    const notification = await Notification.findByPk(id);
    if (!notification) return null;
    return await notification.update(data);
  }

  // only for hr and super admin
  async leaveNotification(employee_id) {
    const employee = await Employee.findByPk(employee_id, {
      attributes: ['first_name', 'last_name'],
    });

    const employeeName = employee
      ? `${employee.first_name || ''} ${employee.last_name || ''}`.trim()
      : `Employee #${employee_id}`;

    const users = await User.findAll({
      include: [
        {
          model: Role,
          where: {
            name: {
              [Op.in]: ['hr_manager', 'super_admin'],
            },
          },
          attributes: [],
        },
      ],
      attributes: ['id'],
    });

    const notifications = users.map((user) => ({
      user_id: user.id,
      type: 'Leave Application',
      title: 'New Leave Application',
      message: `${employeeName} has submitted a new leave application.`,
      publishStatus: 'published',
      author: 'Employee',
      status: 1,
      publishDate: new Date(),
      is_read: false,
      link: '/leave', 
    }));

    if (notifications.length === 0) {
      return [];
    }

    return await Notification.bulkCreate(notifications);
  }

  // Mark single notification as read
  async markAsRead(id) {
    const notification = await Notification.findByPk(id);
    if (!notification) return null;
    notification.is_read = true;
    await notification.save();
    return notification;
  }

  // Mark all of a user's notifications as read
  async markAllAsRead(user_id) {
    const [affectedCount] = await Notification.update(
      { is_read: true },
      { where: { user_id, is_read: false } }
    );
    return affectedCount;
  }

  // Delete notification
  async deleteNotification(id) {
    const notification = await Notification.findByPk(id);
    if (!notification) return null;
    await notification.destroy();
    return true;
  }

  // Delete all read notifications for a user (optional cleanup utility)
  async deleteReadNotifications(user_id) {
    return await Notification.destroy({
      where: { user_id, is_read: true },
    });
  }
}

module.exports = new NotificationService();