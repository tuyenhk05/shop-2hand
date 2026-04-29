const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware');
const {
    createConversation,
    getMyConversations,
    getConversationById,
    markAsReadByCustomer
} = require('../../controllers/client/support.controller');

// Tất cả routes đều yêu cầu đăng nhập
router.use(authMiddleware);

// Lấy danh sách hội thoại của khách hàng
router.get('/my', getMyConversations);

// Tạo hội thoại mới
router.post('/', createConversation);

// Lấy chi tiết hội thoại
router.get('/:id', getConversationById);

// Đánh dấu đã đọc (customer)
router.post('/:id/read', markAsReadByCustomer);

module.exports = router;
