const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null // null if it's for all admins or system-wide
  },
  role: { 
    type: String, 
    enum: ['admin', 'client'], 
    default: 'client' 
  },
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['order_status', 'consignment_status', 'new_order', 'new_consignment'],
    required: true
  },
  link: { 
    type: String 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema, 'notifications');

module.exports = Notification;
