const mongoose = require('mongoose');
const SupportConversation = require('../../models/support_conversations.model');

// Tạo hội thoại mới (hoặc trả về hội thoại hiện có nếu đã tồn tại cho orderId)
const createConversation = async (req, res) => {
    try {
        const { orderId, orderCode, subject } = req.body;
        const customerId = req.user.id;
        const customerName = req.user.fullName || req.user.email || 'Khách hàng';

        // Nếu có orderId, kiểm tra đã có hội thoại chưa
        if (orderId) {
            const existing = await SupportConversation.findOne({
                customerId: new mongoose.Types.ObjectId(customerId),
                orderId: new mongoose.Types.ObjectId(orderId),
                status: { $ne: 'closed' }
            });
            if (existing) {
                return res.status(200).json({
                    success: true,
                    message: 'Hội thoại đã tồn tại',
                    data: existing,
                    isExisting: true
                });
            }
        }

        const conversation = new SupportConversation({
            customerId,
            customerName,
            orderId: orderId || null,
            orderCode: orderCode || null,
            subject: subject || (orderId ? `Hỗ trợ đơn hàng ${orderCode || ''}` : 'Hỗ trợ chung')
        });

        await conversation.save();

        return res.status(201).json({
            success: true,
            message: 'Tạo hội thoại thành công',
            data: conversation
        });
    } catch (error) {
        console.error('createConversation error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Tự động xóa các hội thoại đã đóng quá 30 ngày
const cleanupClosedConversations = async () => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        await SupportConversation.deleteMany({
            status: 'closed',
            updatedAt: { $lt: thirtyDaysAgo }
        });
    } catch (error) {
        console.error('Error during cleanupClosedConversations:', error);
    }
};

// Lấy danh sách hội thoại của khách hàng
const getMyConversations = async (req, res) => {
    try {
        await cleanupClosedConversations();
        const customerId = req.user.id;
        const conversations = await SupportConversation.find({ customerId })
            .sort({ lastMessageAt: -1 })
            .select('-messages');

        return res.status(200).json({ success: true, data: conversations });
    } catch (error) {
        console.error('getMyConversations error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Lấy chi tiết hội thoại (gồm messages)
const getConversationById = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user.id;

        const conversation = await SupportConversation.findOne({ _id: id, customerId });
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy hội thoại' });
        }

        return res.status(200).json({ success: true, data: conversation });
    } catch (error) {
        console.error('getConversationById error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Đánh dấu đã đọc (customer side)
const markAsReadByCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user.id;

        await SupportConversation.findOneAndUpdate(
            { _id: id, customerId },
            { unreadByCustomer: 0 }
        );

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    createConversation,
    getMyConversations,
    getConversationById,
    markAsReadByCustomer
};
