const SupportConversation = require('../../models/support_conversations.model');

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

// Lấy danh sách tất cả hội thoại (cho admin)
const getAllConversations = async (req, res) => {
    try {
        await cleanupClosedConversations();
        const { status, page = 1, limit = 20 } = req.query;
        const filter = {
            'messages.0': { $exists: true } // Chỉ lấy những hội thoại có ít nhất 1 tin nhắn
        };
        if (status) filter.status = status;

        const conversations = await SupportConversation.find(filter)
            .sort({ lastMessageAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .select('-messages')
            .populate('customerId', 'fullName email');

        const total = await SupportConversation.countDocuments(filter);

        return res.status(200).json({ success: true, data: conversations, total });
    } catch (error) {
        console.error('getAllConversations error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Lấy chi tiết hội thoại (admin)
const getConversationDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const conversation = await SupportConversation.findById(id)
            .populate('customerId', 'fullName email phone');

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy hội thoại' });
        }

        return res.status(200).json({ success: true, data: conversation });
    } catch (error) {
        console.error('getConversationDetail error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Đóng hội thoại
const closeConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const conversation = await SupportConversation.findByIdAndUpdate(
            id,
            { status: 'closed' },
            { new: true }
        );

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy hội thoại' });
        }

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.of('/support').to(id).emit('conversation_closed', { conversationId: id });
        }

        return res.status(200).json({ success: true, message: 'Đã đóng hội thoại', data: conversation });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Đánh dấu đã đọc (admin side)
const markAsReadByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        await SupportConversation.findByIdAndUpdate(id, { unreadByAdmin: 0 });
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Số tin chưa đọc của admin (cho badge)
const getUnreadCount = async (req, res) => {
    try {
        const result = await SupportConversation.aggregate([
            { $match: { 
                status: { $ne: 'closed' },
                'messages.0': { $exists: true }
            } },
            { $group: { _id: null, total: { $sum: '$unreadByAdmin' } } }
        ]);
        const count = result[0]?.total || 0;
        return res.status(200).json({ success: true, count });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    getAllConversations,
    getConversationDetail,
    closeConversation,
    markAsReadByAdmin,
    getUnreadCount
};
