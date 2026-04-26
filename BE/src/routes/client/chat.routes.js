const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/client/chat.controller');
const rateLimit = require('express-rate-limit');

// Rate limit for AI chat to prevent spam
const aiChatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per minute
    message: {
        success: false,
        message: "Bạn nhắn tin nhanh quá, nghỉ tay 1 phút rồi quay lại nhé! ✨"
    },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/', aiChatLimiter, chatController.chatWithAI);
router.get('/history/:sessionId', chatController.getChatHistory);

module.exports = router;
