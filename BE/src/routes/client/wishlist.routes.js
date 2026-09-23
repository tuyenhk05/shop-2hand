const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/wishlist.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/:userId', controller.getWishlist);
router.post('/:userId/add', controller.addToWishlist);
router.post('/:userId/remove', controller.removeFromWishlist);

module.exports = router;
