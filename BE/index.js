const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const database = require('./src/configs/database.js');
const systemconfig = require('./src/configs/system');
const methodOverride = require('method-override');
const { cleanupExpiredOrders } = require('./src/controllers/client/order.controller');
const SupportConversation = require('./src/models/support_conversations.model');
const User = require('./src/models/users.model');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3001';

// Danh sách origin được phép truy cập
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Cho phép requests không có origin (native mobile apps, server-to-server) hoặc nằm trong whitelist
    if (
      !origin || 
      allowedOrigins.includes(origin) || 
      origin.endsWith('.vercel.app') || 
      origin.endsWith('.onrender.com') || 
      origin.startsWith('http://localhost:') || 
      origin.startsWith('http://127.0.0.1:')
    ) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy: Origin not allowed'));
    }
  },
  credentials: true
};

// ✅ Security & CORS
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(cors(corsOptions));

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
  console.error('Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.' 
      : (err.message || 'Internal Server Error')
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
  cors: corsOptions
});

// ✅ Đính io vào app để dùng trong controllers
app.set('io', io);

// Helper xác thực token cho Socket.IO
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.id).populate('role').lean();
      if (user && user.isActive) {
        socket.user = {
          id: user._id.toString(),
          role: user.role?.title || 'Khách hàng',
          isAdmin: user.role?.title === 'Quản trị viên' || (user.role?.permissions && (user.role.permissions.includes('all') || user.role.permissions.length > 0))
        };
      }
    }
    next();
  } catch (err) {
    // Không block handshake nếu chưa đăng nhập nhưng không gán socket.user
    next();
  }
};

// ✅ Socket.IO namespace /support — real-time chat hỗ trợ khách hàng
const supportNS = io.of('/support');
supportNS.use(authenticateSocket);

supportNS.on('connection', (socket) => {
  // Khách hàng / Admin join vào room của conversation
  socket.on('join_conversation', (conversationId) => {
    if (conversationId) {
      socket.join(conversationId);
    }
  });

  // Chỉ Admin được phép join admin_room để nghe thông báo
  socket.on('admin_join', () => {
    if (socket.user?.isAdmin) {
      socket.join('admin_room');
    }
  });

  // Gửi tin nhắn an toàn (ngăn chặn mạo danh sender)
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, content } = data;
      if (!conversationId || !content?.trim()) return;

      const conversation = await SupportConversation.findById(conversationId);
      if (!conversation || conversation.status === 'closed') return;

      // Xác định danh tính thật của người gửi dựa trên token đã xác thực
      const actualSender = socket.user?.isAdmin ? 'admin' : 'customer';

      const newMsg = {
        sender: actualSender,
        content: content.trim(),
        createdAt: new Date()
      };

      conversation.messages.push(newMsg);
      conversation.lastMessageAt = new Date();

      // Cập nhật unread counter
      if (actualSender === 'customer') {
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

  socket.on('disconnect', () => {});
});

// ✅ Socket.IO namespace /notifications
const notificationNS = io.of('/notifications');
notificationNS.use(authenticateSocket);

notificationNS.on('connection', (socket) => {
  // Join user room có kiểm tra quyền hoặc khớp userId
  socket.on('join', (userId) => {
    if (userId) {
      if (!socket.user || socket.user.id === userId || socket.user.isAdmin) {
        socket.join(userId);
      }
    }
  });

  // Admin join room
  socket.on('admin_join', () => {
    if (socket.user?.isAdmin) {
      socket.join('admin_room');
    }
  });

  socket.on('disconnect', () => {});
});

app.set('notificationNS', notificationNS);

// ✅ Start server
server.listen(port, () => {
  console.log(`🚀 Backend API running at http://localhost:${port}`);
  console.log(`🔌 Socket.IO /support namespace ready`);

  // ✅ Chạy task kiểm tra đơn hàng hết hạn định kỳ mỗi 60 giây
  setInterval(() => {
    cleanupExpiredOrders();
  }, 60000);
});