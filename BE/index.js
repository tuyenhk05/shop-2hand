const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const database = require('./src/configs/database.js');
const systemconfig = require('./src/configs/system');
const methodOverride = require('method-override');
const { cleanupExpiredOrders } = require('./src/controllers/client/order.controller');
const SupportConversation = require('./src/models/support_conversations.model');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3001';

// ✅ Security & CORS
app.use(helmet());
app.use(cors({
  origin: true, // Allow any origin to connect (fixes CORS for Expo Web)
  credentials: true
}));

// ✅ Middleware
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Setup locals
app.locals.prefixAdmin = systemconfig.prefixAdmin;

// ✅ Kết nối database
database.connect();

const router = require('./src/routes/client/index.routes');
const adminRoutes = require('./src/routes/admin/index.route');

// ✅ Routes
router(app);
adminRoutes(app);

// ✅ Global Error Handler (phải đặt sau tất cả routes)
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ✅ Tạo HTTP server và Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ✅ Đính io vào app để dùng trong controllers
app.set('io', io);

// ✅ Socket.IO namespace /support — real-time chat hỗ trợ khách hàng
const supportNS = io.of('/support');

supportNS.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Khách hàng / Admin join vào room của conversation
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined room: ${conversationId}`);
  });

  // Admin join tất cả để nhận notification
  socket.on('admin_join', () => {
    socket.join('admin_room');
    console.log(`Admin socket ${socket.id} joined admin_room`);
  });

  // Gửi tin nhắn
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, sender, content } = data;
      if (!conversationId || !sender || !content?.trim()) return;

      const conversation = await SupportConversation.findById(conversationId);
      if (!conversation || conversation.status === 'closed') return;

      const newMsg = {
        sender,
        content: content.trim(),
        createdAt: new Date()
      };

      conversation.messages.push(newMsg);
      conversation.lastMessageAt = new Date();

      // Cập nhật unread counter
      if (sender === 'customer') {
        conversation.unreadByAdmin += 1;
        if (conversation.status === 'open') conversation.status = 'in_progress';
      } else {
        conversation.unreadByCustomer += 1;
      }

      await conversation.save();

      const savedMsg = conversation.messages[conversation.messages.length - 1];

      // Emit tin nhắn tới tất cả trong room
      supportNS.to(conversationId).emit('new_message', {
        conversationId,
        message: savedMsg
      });

      // Notify admin room về unread count mới
      supportNS.to('admin_room').emit('unread_update', {
        conversationId,
        unreadByAdmin: conversation.unreadByAdmin
      });

    } catch (error) {
      console.error('Socket send_message error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ✅ Start server
server.listen(port, () => {
  console.log(`🚀 Backend API running at http://localhost:${port}`);
  console.log(`🔌 Socket.IO /support namespace ready`);

  // ✅ Chạy task kiểm tra đơn hàng hết hạn mỗi phút
  setInterval(() => {
    cleanupExpiredOrders();
  }, 60000);
});