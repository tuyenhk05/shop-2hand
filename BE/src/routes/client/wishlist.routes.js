const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/wishlist.controller');

router.get('/:userId', controller.getWishlist);
router.post('/:userId/add', controller.addToWishlist);
router.post('/:userId/remove', controller.removeFromWishlist);

module.exports = router;
