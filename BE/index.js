const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const database = require('./src/configs/database.js');
const systemconfig = require('./src/configs/system');
const methodOverride = require('method-override');
const router = require('./src/routes/client/index.routes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// ✅ Security & CORS
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
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

// ✅ Routes
router(app);

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

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Backend API running at http://localhost:${port}`);
});