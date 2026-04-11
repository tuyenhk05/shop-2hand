const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/order.controller');

router.get('/:buyerId', controller.getOrders);
router.post('/create', controller.createOrder);

module.exports = router;
