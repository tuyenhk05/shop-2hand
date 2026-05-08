const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/admin/settings.controller');
const { requireAdmin } = require('../../middlewares/adminAuth.middleware');

router.use(requireAdmin);

router.get('/', settingsController.getSettings);
router.post('/', settingsController.updateSettings);

module.exports = router;
