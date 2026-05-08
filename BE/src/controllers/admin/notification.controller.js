const Notification = require('../../models/notifications.model');

// [GET] /api/admin/notifications
exports.getAdminNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ role: 'admin' })
            .sort({ createdAt: -1 })
            .limit(20);
        
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [PATCH] /api/admin/notifications/:id/read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [PATCH] /api/admin/notifications/read-all
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ role: 'admin', isRead: false }, { isRead: true });
        res.status(200).json({ success: true, message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
