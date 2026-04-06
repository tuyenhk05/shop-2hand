const express = require('express');
const authRoutes = require('./auth.routes');

module.exports = (app) => {
    const router = express.Router();

    // ✅ Auth routes
    router.use('/auth', authRoutes);
    
    // ✅ Thêm routes khác ở đây
    // router.use('/products', require('../products.routes'));
    // router.use('/users', require('../users.routes'));

    app.use('/api', router);
};