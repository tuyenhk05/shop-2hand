const express = require('express');
const brandsController = require('../../controllers/client/brands.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const router = express.Router();

router.get('/', brandsController.getAllBrands);
router.get('/:id', brandsController.getBrandById);
router.get('/:id/products', brandsController.getProductsByBrandId);
router.post('/', authMiddleware, brandsController.createBrand);
router.put('/:id', authMiddleware, brandsController.updateBrand);
router.delete('/:id', authMiddleware, brandsController.deleteBrand);

module.exports = router;