const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/consignment.controller');

router.get('/:userId', controller.getConsignments);
router.post('/create', controller.createConsignment);
router.post('/analyze-image', controller.analyzeImage);

module.exports = router;
