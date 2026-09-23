const express = require('express');
const categoriesController = require('../../controllers/client/category.controller');
const router = express.Router();

// Client read-only routes
router.get('/', categoriesController.getAllCategories);
router.get('/:id', categoriesController.getCategoryById);
router.get('/:id/products', categoriesController.getProductsByCategoryId);

module.exports = router;