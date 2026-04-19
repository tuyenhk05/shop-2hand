const express = require('express');
const router = express.Router();
const rolesController = require('../../controllers/admin/roles.controller');
const { requireAdmin, requirePermission } = require('../../middlewares/adminAuth.middleware');

// Áp dụng middleware kiểm tra quyền quản trị chung cho toàn bộ route
router.use(requireAdmin);

router.get('/', requirePermission('roles_view'), rolesController.getAllRoles);
router.post('/', requirePermission('roles_create'), rolesController.createRole);
router.put('/:id', requirePermission('roles_edit'), rolesController.updateRole);
router.delete('/:id', requirePermission('roles_delete'), rolesController.deleteRole);

module.exports = router;
