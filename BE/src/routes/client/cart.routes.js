const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/cart.controller');

router.get('/:userId', controller.getCart);
router.post('/:userId/add', controller.addToCart);
router.post('/:userId/remove', controller.removeFromCart);
router.post('/:userId/clear', controller.clearCart);

module.exports = router;
