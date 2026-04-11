const express = require('express');
const categoriesController = require('../../controllers/client/category.controller');
const authMiddleware = require('../../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', categoriesController.getAllCategories);
router.get('/:id', categoriesController.getCategoryById);
router.get('/:id/products', categoriesController.getProductsByCategoryId);

// Protected routes (Admin hoặc nhân viên)
router.post('/', authMiddleware, categoriesController.createCategory);
router.put('/:id', authMiddleware, categoriesController.updateCategory);
router.delete('/:id', authMiddleware, categoriesController.deleteCategory);

module.exports = router;