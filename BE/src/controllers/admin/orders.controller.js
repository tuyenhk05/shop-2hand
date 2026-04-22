const Order = require('../../models/orders.model');
const ProductImage = require('../../models/productImages.model');
const User = require('../../models/users.model');

// ✅ Lấy danh sách toàn bộ đơn hàng
exports.getAllOrders = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        let query = {};

        // 1. Lọc theo trạng thái đơn hàng
        if (status) {
            query.status = status;
        }

        // 2. Lọc theo ngày đặt hàng
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate + 'T00:00:00.000Z'),
                $lte: new Date(endDate + 'T23:59:59.999Z')
            };
        }

        const orders = await Order.find(query)
            .populate('buyerId', 'fullName email phone')
            .populate({
                path: 'items.productId',
                select: 'title price'
            })
            .sort({ createdAt: -1 });

        // Gắn ảnh chính cho từng sản phẩm trong items
        const productIds = [...new Set(
            orders.flatMap(o => o.items.map(i => i.productId?._id?.toString()).filter(Boolean))
        )];

        const images = await ProductImage.find({
            productId: { $in: productIds },
            isPrimary: true
        });

        const imageMap = {};
        images.forEach(img => { imageMap[img.productId.toString()] = img.imageUrl; });

        const ordersWithImages = orders.map(order => {
            const obj = order.toObject();
            obj.items = obj.items.map(item => ({
                ...item,
                productImage: item.productId ? imageMap[item.productId._id?.toString() || item.productId.toString()] || null : null
            }));
            return obj;
        });

        res.status(200).json({ success: true, data: ordersWithImages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() },
            { new: true }
        ).populate('buyerId', 'fullName email phone');

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Hủy đơn hàng
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        await Order.findByIdAndUpdate(id, { status: 'cancelled', updatedAt: new Date() });
        res.status(200).json({ success: true, message: 'Đơn hàng đã được đánh dấu Hủy' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
