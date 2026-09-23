const express = require('express');
const productsController = require('../../controllers/client/products.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

// ==========================================
// 1. PUBLIC & CLIENT READ-ONLY ROUTES
// ==========================================
router.get('/', productsController.getAllProducts);
router.get('/recommendations', authMiddleware, productsController.getRecommendations);
router.get('/:productId/images', productsController.getImagesByProductId);
router.get('/:id', productsController.getProductById);

module.exports = router;