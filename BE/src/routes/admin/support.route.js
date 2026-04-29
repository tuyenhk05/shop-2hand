const express = require('express');
const router = express.Router();
const { requireAdmin, requirePermission } = require('../../middlewares/adminAuth.middleware');
const {
    getAllConversations,
    getConversationDetail,
    closeConversation,
    markAsReadByAdmin,
    getUnreadCount
} = require('../../controllers/admin/support.controller');

// Tất cả routes admin đều cần xác thực + populate role từ DB
router.use(requireAdmin);

// Số tin chưa đọc (badge sidebar)
router.get('/unread-count', requirePermission('support_view'), getUnreadCount);

// Danh sách tất cả hội thoại
router.get('/conversations', requirePermission('support_view'), getAllConversations);

// Chi tiết hội thoại
router.get('/conversations/:id', requirePermission('support_view'), getConversationDetail);

// Đóng hội thoại
router.post('/conversations/:id/close', requirePermission('support_reply'), closeConversation);

// Đánh dấu đã đọc (admin)
router.post('/conversations/:id/read', requirePermission('support_view'), markAsReadByAdmin);

module.exports = router;
