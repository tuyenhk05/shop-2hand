const Notification = require('../models/notifications.model');

/**
 * Create a notification and emit via socket
 * @param {Object} app - Express app instance
 * @param {Object} data - Notification data
 */
exports.createNotification = async (app, data) => {
    try {
        const notification = new Notification(data);
        await notification.save();

        const notificationNS = app.get('notificationNS');
        if (notificationNS) {
            if (data.userId) {
                // Emit to specific user
                notificationNS.to(data.userId.toString()).emit('new_notification', notification);
            }
            if (data.role === 'admin') {
                // Emit to admin room
                notificationNS.to('admin_room').emit('new_notification', notification);
            }
        }
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};
