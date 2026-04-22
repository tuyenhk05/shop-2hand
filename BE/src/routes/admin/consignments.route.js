const express = require('express');
const router = express.Router();
const consignmentsController = require('../../controllers/admin/consignments.controller');
const { requireAdmin, requirePermission } = require('../../middlewares/adminAuth.middleware');

router.use(requireAdmin);

router.get('/', requirePermission('consignments_view'), consignmentsController.getAllConsignments);
router.put('/:id', requirePermission('consignments_edit'), consignmentsController.updateConsignmentStatus);
router.post('/:id/convert', requirePermission('consignments_edit'), consignmentsController.convertToProduct);
router.delete('/:id', requirePermission('consignments_delete'), consignmentsController.deleteConsignment);

module.exports = router;
