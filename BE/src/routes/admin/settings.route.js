const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/admin/settings.controller');
const { requireAdmin, requirePermission } = require('../../middlewares/adminAuth.middleware');

router.use(requireAdmin);

router.get('/', settingsController.getSettings);
router.post('/', requirePermission('settings_edit'), settingsController.updateSettings);

module.exports = router;
