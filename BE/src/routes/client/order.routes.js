const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/order.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/detail/:orderId', controller.getOrderById);
router.get('/:buyerId', controller.getOrders);
router.post('/create', controller.createOrder);

module.exports = router;
