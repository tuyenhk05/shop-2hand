const express = require('express');
const productsController = require('../../controllers/client/products.controller');
const authMiddleware = require('../../middleware/auth.middleware');

const router = express.Router();
// Public routes
router.get('/', productsController.getAllProducts);
router.get('/:id', productsController.getProductById);

// Protected routes
router.post('/', authMiddleware, productsController.createProduct);
router.put('/:id', authMiddleware, productsController.updateProduct);
router.delete('/:id', authMiddleware, productsController.deleteProduct);

module.exports = router;