const User = require('../../models/users.model');
const Product = require('../../models/products.model');
const Order = require('../../models/orders.model');

// ✅ GET Dashboard Stats
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        
        // Tính tổng doanh thu từ các Order đã thanh toán
        const revenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
