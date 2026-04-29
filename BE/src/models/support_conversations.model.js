const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ['customer', 'admin'],
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const supportConversationSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    },
    orderCode: {
        type: String,
        default: null
    },
    subject: {
        type: String,
        default: 'Hỗ trợ đơn hàng'
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'closed'],
        default: 'open'
    },
    messages: [messageSchema],
    unreadByAdmin: {
        type: Number,
        default: 0
    },
    unreadByCustomer: {
        type: Number,
        default: 0
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'support_conversations',
    timestamps: true
});

// Index để tìm kiếm nhanh
supportConversationSchema.index({ customerId: 1, status: 1 });
supportConversationSchema.index({ lastMessageAt: -1 });

const SupportConversation = mongoose.model('SupportConversation', supportConversationSchema);

module.exports = SupportConversation;
