const express = require('express');
const productsController = require('../../controllers/client/products.controller');
const authMiddleware = require('../../middleware/auth.middleware');

const router = express.Router();

// ==========================================
// 1. PUBLIC ROUTES
// ==========================================
router.get('/', productsController.getAllProducts);
router.get('/recommendations', authMiddleware, productsController.getRecommendations);

// 🟢 IMAGE ROUTES (Phải đặt TRÊN các route /:id)
router.get('/:productId/images', productsController.getImagesByProductId);
// Lưu ý: Đưa thằng này lên vì nó có đường dẫn cụ thể /images/...
router.put('/images/:id', authMiddleware, productsController.updateProductImage);
router.delete('/images/:id', authMiddleware, productsController.deleteProductImage);

// ==========================================
// 2. CÁC ROUTE CÓ CHỨA /:id (PHẢI ĐẶT DƯỚI CÙNG)
// ==========================================
router.get('/:id', productsController.getProductById);

// ==========================================
// 3. PROTECTED ROUTES
// ==========================================
router.post('/', authMiddleware, productsController.createProduct);
router.post('/:productId/images', authMiddleware, productsController.addProductImage);
router.put('/:id', authMiddleware, productsController.updateProduct);
router.delete('/:id', authMiddleware, productsController.deleteProduct);

module.exports = router;