const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/consignment.controller');

const upload = require('../../middlewares/upload.middleware');

router.get('/:userId', controller.getConsignments);
router.post('/create', upload.array('images', 10), controller.createConsignment);
router.patch('/:id/status', controller.updateConsignmentStatus);
router.post('/analyze-image', controller.analyzeImage);

module.exports = router;
