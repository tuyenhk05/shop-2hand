const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/notification.controller');
const { requireAdmin } = require('../../middlewares/adminAuth.middleware');

router.use(requireAdmin);

router.get('/', controller.getAdminNotifications);
router.patch('/read-all', controller.markAllAsRead);
router.patch('/:id/read', controller.markAsRead);

module.exports = router;
