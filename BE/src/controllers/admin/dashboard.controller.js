const User = require('../../models/users.model');
const Product = require('../../models/products.model');
const Order = require('../../models/orders.model');
const Consignment = require('../../models/consignments.model');

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

        const pendingOrders = await Order.countDocuments({ status: { $in: ['paid', 'processing'] } });
        const totalActiveProducts = await Product.countDocuments({ status: 'active' });
        const totalDeliveredOrders = await Order.countDocuments({ status: 'delivered' });
        const totalPendingConsignments = await Consignment.countDocuments({ status: { $in: ['pending', 'received'] } });

        // Tính toán doanh thu tuần hiện tại (Thứ 2 -> Chủ nhật)
        const currentWeekStart = new Date();
        const day = currentWeekStart.getDay();
        const diffToMonday = currentWeekStart.getDate() - (day === 0 ? 6 : day - 1);
        currentWeekStart.setDate(diffToMonday);
        currentWeekStart.setHours(0, 0, 0, 0);

        const currentWeekEnd = new Date(currentWeekStart);
        currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
        currentWeekEnd.setHours(23, 59, 59, 999);

        const weeklyOrders = await Order.find({
            paymentStatus: 'paid',
            createdAt: { $gte: currentWeekStart, $lte: currentWeekEnd }
        });

        const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
        const weeklyRevenue = dayNames.map((name, index) => {
            const startOfDay = new Date(currentWeekStart);
            startOfDay.setDate(currentWeekStart.getDate() + index);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(startOfDay);
            endOfDay.setHours(23, 59, 59, 999);

            const total = weeklyOrders
                .filter(o => o.createdAt >= startOfDay && o.createdAt <= endOfDay)
                .reduce((acc, o) => acc + o.totalAmount, 0);

            return { name, revenue: total };
        });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalActiveProducts,
                pendingOrders,
                totalDeliveredOrders,
                totalPendingConsignments,
                totalOrders: currentMonthOrders,
                totalRevenue: currentMonthRevenue,
                monthlyRevenue,
                weeklyRevenue,
                orderStatusCounts,
                recentOrders
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
