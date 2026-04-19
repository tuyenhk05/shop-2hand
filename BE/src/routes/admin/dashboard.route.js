const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboard.controller');
const { requireAdmin } = require('../../middlewares/adminAuth.middleware');

router.use(requireAdmin);

// Dashboard stats doesn't necessarily need a specific permission, or we can add 'dashboard_view'
router.get('/stats', dashboardController.getStats);

module.exports = router;
