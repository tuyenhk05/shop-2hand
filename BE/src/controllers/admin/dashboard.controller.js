const User = require('../../models/users.model');
const Product = require('../../models/products.model');
const Order = require('../../models/orders.model');
const Consignment = require('../../models/consignments.model');
const Review = require('../../models/reviews.model');
const Category = require('../../models/category.model');

exports.getStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // --- 1. Orders Stat (7 days) & Mini Chart ---
        const last7DaysStart = new Date(startOfToday);
        last7DaysStart.setDate(last7DaysStart.getDate() - 6);
        
        const previous7DaysStart = new Date(last7DaysStart);
        previous7DaysStart.setDate(previous7DaysStart.getDate() - 7);

        const ordersLast7DaysData = await Order.find({ createdAt: { $gte: last7DaysStart } });
        const ordersPrevious7Days = await Order.countDocuments({ createdAt: { $gte: previous7DaysStart, $lt: last7DaysStart } });
        
        const ordersLast7Days = ordersLast7DaysData.length;
        let ordersGrowth = 0;
        if (ordersPrevious7Days > 0) {
            ordersGrowth = ((ordersLast7Days - ordersPrevious7Days) / ordersPrevious7Days) * 100;
        } else if (ordersLast7Days > 0) {
            ordersGrowth = 100;
        }

        const miniOrdersChart = [];
        for (let i = 0; i < 7; i++) {
            const currDate = new Date(last7DaysStart);
            currDate.setDate(currDate.getDate() + i);
            const count = ordersLast7DaysData.filter(o => new Date(o.createdAt).toDateString() === currDate.toDateString()).length;
            miniOrdersChart.push({ name: currDate.toLocaleDateString('vi-VN', { weekday: 'short' }), val: count });
        }

        const completedOrdersCount = ordersLast7DaysData.filter(o => o.status === 'delivered').length;
        const pendingPaymentCount = ordersLast7DaysData.filter(o => o.status === 'pending_payment').length;
        const orderCompletionRate = ordersLast7Days > 0 ? Math.round((completedOrdersCount / ordersLast7Days) * 100) : 0;
        const orderPendingRate = ordersLast7Days > 0 ? Math.round((pendingPaymentCount / ordersLast7Days) * 100) : 0;

        // --- 2. Customers Stat (7 days) & Mini Chart ---
        const usersLast7DaysData = await User.find({ createdAt: { $gte: last7DaysStart } });
        const customersPrevious7Days = await User.countDocuments({ createdAt: { $gte: previous7DaysStart, $lt: last7DaysStart } });
        
        const customersLast7Days = usersLast7DaysData.length;
        let customersGrowth = 0;
        if (customersPrevious7Days > 0) {
            customersGrowth = ((customersLast7Days - customersPrevious7Days) / customersPrevious7Days) * 100;
        } else if (customersLast7Days > 0) {
            customersGrowth = 100;
        }

        const miniUsersChart = [];
        for (let i = 0; i < 7; i++) {
            const currDate = new Date(last7DaysStart);
            currDate.setDate(currDate.getDate() + i);
            const count = usersLast7DaysData.filter(u => new Date(u.createdAt).toDateString() === currDate.toDateString()).length;
            miniUsersChart.push({ name: currDate.toLocaleDateString('vi-VN', { weekday: 'short' }), val: count });
        }

        // --- 3. Status Block ---
        const awaitingProcessing = await Order.countDocuments({ status: { $in: ['pending_payment', 'processing'] } });
        const pendingConsignments = await Consignment.countDocuments({ status: 'pending' });
        const activeProducts = await Product.countDocuments({ status: 'active' });

        // --- 4. Revenue Chart (with filter) ---
        const revenueRange = req.query.revenueRange || '30';
        const daysToFetch = parseInt(revenueRange) === 7 ? 7 : 30;

        const lastXDaysStart = new Date(startOfToday);
        lastXDaysStart.setDate(lastXDaysStart.getDate() - (daysToFetch - 1));
        
        const prevXDaysStart = new Date(lastXDaysStart);
        prevXDaysStart.setDate(prevXDaysStart.getDate() - daysToFetch);

        const currentXDaysOrders = await Order.find({
            paymentStatus: 'paid',
            createdAt: { $gte: lastXDaysStart }
        });
        const prevXDaysOrders = await Order.find({
            paymentStatus: 'paid',
            createdAt: { $gte: prevXDaysStart, $lt: lastXDaysStart }
        });

        const revenueChart = [];
        for (let i = 0; i < daysToFetch; i++) {
            const currDate = new Date(lastXDaysStart);
            currDate.setDate(currDate.getDate() + i);
            const currDateStr = currDate.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' });
            
            const prevDate = new Date(prevXDaysStart);
            prevDate.setDate(prevDate.getDate() + i);

            const currTotal = currentXDaysOrders
                .filter(o => new Date(o.createdAt).toDateString() === currDate.toDateString())
                .reduce((sum, o) => sum + o.totalAmount, 0);

            const prevTotal = prevXDaysOrders
                .filter(o => new Date(o.createdAt).toDateString() === prevDate.toDateString())
                .reduce((sum, o) => sum + o.totalAmount, 0);

            revenueChart.push({
                name: currDateStr,
                current: currTotal,
                previous: prevTotal
            });
        }

        // --- 5. Order Status Ratio ---
        const orderStatusRaw = await Order.aggregate([
            { $match: { createdAt: { $gte: lastXDaysStart } } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        
        const orderStatusMap = {
            pending_payment: 'Chờ thanh toán',
            paid: 'Đã thanh toán',
            processing: 'Đang xử lý',
            shipped: 'Đang giao',
            delivered: 'Đã giao',
            cancelled: 'Đã hủy',
            returned: 'Hoàn trả'
        };

        const orderStatusRatio = orderStatusRaw.map(item => ({
            name: orderStatusMap[item._id] || item._id,
            value: item.count
        })).sort((a, b) => b.value - a.value);
        
        // --- 6. Paying vs Non-paying ---
        const paymentStatsRaw = await Order.aggregate([
            { $match: { createdAt: { $gte: lastXDaysStart } } },
            { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }
        ]);
        
        let payingCount = 0;
        let nonPayingCount = 0;
        paymentStatsRaw.forEach(item => {
            if (item._id === 'paid') payingCount += item.count;
            else nonPayingCount += item.count;
        });

        const paymentStats = [
            { name: 'Đã thanh toán', value: payingCount },
            { name: 'Chưa thanh toán', value: nonPayingCount }
        ];

        // --- 7. Recent Orders ---
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        res.status(200).json({
            success: true,
            data: {
                ordersStat: {
                    total: ordersLast7Days,
                    growth: ordersGrowth.toFixed(1),
                    completionRate: orderCompletionRate,
                    pendingRate: orderPendingRate,
                    miniChart: miniOrdersChart
                },
                customersStat: {
                    total: customersLast7Days,
                    growth: customersGrowth.toFixed(1),
                    miniChart: miniUsersChart
                },
                inventoryStats: {
                    awaitingProcessing,
                    pendingConsignments,
                    activeProducts
                },
                revenueChart,
                orderStatusRatio: orderStatusRatio.length > 0 ? orderStatusRatio : [{ name: 'Chưa có', value: 1 }],
                paymentStats,
                recentOrders
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
