const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/admin/users.controller');
const { requireAdmin, requirePermission } = require('../../middlewares/adminAuth.middleware');

router.use(requireAdmin);

router.get('/', requirePermission('users_view'), usersController.getAllUsers);
router.put('/:id', requirePermission('users_edit'), usersController.updateUser);
router.delete('/:id', requirePermission('users_delete'), usersController.deleteUser);

module.exports = router;
