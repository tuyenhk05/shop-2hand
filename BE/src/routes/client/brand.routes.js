const express = require('express');
const brandsController = require('../../controllers/client/brands.controller');
const router = express.Router();

// Client read-only routes
router.get('/', brandsController.getAllBrands);
router.get('/:id', brandsController.getBrandById);
router.get('/:id/products', brandsController.getProductsByBrandId);

module.exports = router;