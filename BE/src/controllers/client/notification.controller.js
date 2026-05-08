const Notification = require('../../models/notifications.model');

// [GET] /api/notifications
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id; // Using req.user.id from auth middleware
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20);
        
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [PATCH] /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [PATCH] /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification.updateMany({ userId, isRead: false }, { isRead: true });
        res.status(200).json({ success: true, message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
