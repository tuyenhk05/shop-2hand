const express = require('express');
const router = express.Router();
const ordersController = require('../../controllers/admin/orders.controller');
const { requireAdmin, requirePermission } = require('../../middlewares/adminAuth.middleware');

router.use(requireAdmin);

router.get('/', requirePermission('orders_view'), ordersController.getAllOrders);
router.get('/:id', requirePermission('orders_view'), ordersController.getOrderById);
router.put('/:id', requirePermission('orders_edit'), ordersController.updateOrderStatus);
router.delete('/:id', requirePermission('orders_delete'), ordersController.deleteOrder);

module.exports = router;
