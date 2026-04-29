const express = require('express');
const authRoutes = require('./auth.routes');
const productsRoutes = require('./products.routes');
const brandsRoutes = require('./brand.routes');
const categoriesRoutes = require('./category.routes');
const cartRoutes = require('./cart.routes');
const wishlistRoutes = require('./wishlist.routes');
const orderRoutes = require('./order.routes');
const consignmentRoutes = require('./consignment.routes');
const paymentRoutes = require('./payment.routes');
const chatRoutes = require('./chat.routes');
const supportRoutes = require('./support.route');

module.exports = (app) => {
    const router = express.Router();

    // ✅ Auth routes
    router.use('/auth', authRoutes);
    router.use('/products', productsRoutes);
    router.use('/brands', brandsRoutes);
    router.use('/categories', categoriesRoutes);
    router.use('/cart', cartRoutes);
    router.use('/wishlists', wishlistRoutes);
    router.use('/orders', orderRoutes);
    router.use('/consignments', consignmentRoutes);
    router.use('/payment', paymentRoutes);
    router.use('/chat', chatRoutes);
    router.use('/support', supportRoutes);
    // ✅ Thêm routes khác ở đây
    // router.use('/products', require('../products.routes'));
    // router.use('/users', require('../users.routes'));

    app.use('/api', router);
};