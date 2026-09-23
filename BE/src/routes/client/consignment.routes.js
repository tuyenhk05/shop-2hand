const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/consignment.controller');
const upload = require('../../middlewares/upload.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');

router.get('/:userId', authMiddleware, controller.getConsignments);
router.post('/create', authMiddleware, upload.array('images', 10), controller.createConsignment);
router.patch('/:id/status', authMiddleware, controller.updateConsignmentStatus);
router.post('/analyze-image', controller.analyzeImage);

module.exports = router;
