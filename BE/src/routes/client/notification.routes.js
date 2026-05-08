const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/notification.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.get('/', authMiddleware, controller.getNotifications);
router.patch('/read-all', authMiddleware, controller.markAllAsRead);
router.patch('/:id/read', authMiddleware, controller.markAsRead);

module.exports = router;
