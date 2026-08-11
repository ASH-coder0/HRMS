const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');

// Optional: plug in your auth middleware
// const { authenticate } = require('../middleware/auth');

// Create
router.post('/', notificationController.create);
router.post('/bulk', notificationController.createBulk);

// Read
router.get('/', notificationController.getAll);
router.get('/user/:user_id', notificationController.getUserNotifications);
router.get('/user/:user_id/unread-count', notificationController.getUnreadCount);
router.get('/:id', notificationController.getById);

// Update
router.put('/:id', notificationController.update);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/user/:user_id/read-all', notificationController.markAllAsRead);

// Delete
router.delete('/user/:user_id/read', notificationController.deleteReadNotifications);
router.delete('/:id', notificationController.delete);

module.exports = router;