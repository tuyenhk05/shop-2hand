const express = require('express');
const router = express.Router();
const productsController = require('../../controllers/admin/products.controller');
const { requireAdmin, requirePermission } = require('../../middlewares/adminAuth.middleware');
const upload = require('../../middlewares/upload.middleware');

router.use(requireAdmin);

router.get('/', requirePermission('products_view'), productsController.getAllProducts);
router.get('/:id', requirePermission('products_view'), productsController.getProductById);

// Upload tối đa 10 ảnh cùng lúc (field name: 'images')
router.post('/', requirePermission('products_edit'), upload.array('images', 10), productsController.createProduct);
router.put('/:id', requirePermission('products_edit'), upload.array('images', 10), productsController.updateProduct);
router.patch('/:id/status', requirePermission('products_edit'), productsController.updateProductStatus);
router.delete('/:id', requirePermission('products_delete'), productsController.deleteProduct);
router.delete('/images/:imageId', requirePermission('products_edit'), productsController.deleteProductImage);

module.exports = router;
