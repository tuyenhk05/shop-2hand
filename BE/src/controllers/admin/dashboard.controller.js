const User = require('../../models/users.model');
const Product = require('../../models/products.model');
const Order = require('../../models/orders.model');

// ✅ GET Dashboard Stats
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        
        // Tính toán khoảng thời gian tháng hiện tại
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Số đơn hàng trong tháng này
        const currentMonthOrders = await Order.countDocuments({
            createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
        });

        // Doanh thu trong tháng này (từ các đơn đã thanh toán)
        const revenueResult = await Order.aggregate([
            { 
                $match: { 
                    paymentStatus: 'paid',
                    createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
                } 
            },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        const currentMonthRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        const currentYear = new Date().getFullYear();

        // 1. Doanh thu theo tháng (12 tháng của năm hiện tại)
        const monthlyRevenueRaw = await Order.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    createdAt: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: "$totalAmount" }
                }
            }
        ]);

        const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
            name: `T${i + 1}`,
            revenue: 0
        }));

        monthlyRevenueRaw.forEach(item => {
            monthlyRevenue[item._id - 1].revenue = item.total;
        });

        // 2. Thống kê số lượng đơn hàng theo trạng thái
        const orderStatusRaw = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const orderStatusCounts = orderStatusRaw.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        // 3. Đơn hàng gần đây
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('orderCode buyerName totalAmount status paymentMethod createdAt')
            .lean();

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalOrders: currentMonthOrders,
                totalRevenue: currentMonthRevenue,
                monthlyRevenue,
                orderStatusCounts,
                recentOrders
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
