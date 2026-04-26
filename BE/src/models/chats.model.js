const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Can be null for guest chats
    },
    sessionId: {
        type: String,
        required: true
    },
    messages: [
        {
            role: {
                type: String,
                enum: ['user', 'model'],
                required: true
            },
            content: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ],
    metadata: {
        ip: String,
        userAgent: String
    }
}, {
    timestamps: true
});

const Chat = mongoose.model('Chat', chatSchema, 'chats');

module.exports = Chat;
