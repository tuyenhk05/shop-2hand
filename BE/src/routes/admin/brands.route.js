const express = require('express');
const router = express.Router();
const brandsController = require('../../controllers/admin/brands.controller');
const { requireAdmin, requirePermission } = require('../../middlewares/adminAuth.middleware');

router.use(requireAdmin);

router.get('/', requirePermission('brands_view'), brandsController.getAllBrands);
router.post('/', requirePermission('brands_create'), brandsController.createBrand);
router.put('/:id', requirePermission('brands_edit'), brandsController.updateBrand);
router.delete('/:id', requirePermission('brands_delete'), brandsController.deleteBrand);

module.exports = router;
