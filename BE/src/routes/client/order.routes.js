const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/order.controller');

router.get('/detail/:orderId', controller.getOrderById);
router.get('/:buyerId', controller.getOrders);
router.post('/create', controller.createOrder);

module.exports = router;
