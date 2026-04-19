const express = require('express');
const router = express.Router();
const categoriesController = require('../../controllers/admin/categories.controller');
const { requireAdmin, requirePermission } = require('../../middlewares/adminAuth.middleware');

router.use(requireAdmin);

router.get('/', requirePermission('categories_view'), categoriesController.getAllCategories);
router.post('/', requirePermission('categories_create'), categoriesController.createCategory);
router.put('/:id', requirePermission('categories_edit'), categoriesController.updateCategory);
router.delete('/:id', requirePermission('categories_delete'), categoriesController.deleteCategory);

module.exports = router;
