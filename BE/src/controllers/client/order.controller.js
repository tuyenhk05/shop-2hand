const Order = require('../../models/orders.model');
const Cart = require('../../models/carts.model');
const Product = require('../../models/products.model');
const ProductImage = require('../../models/productImages.model');

// Helper function to cancel orders that haven't been paid within 10 minutes
const cleanupExpiredOrders = async () => {
    try {
        const expirationTime = 10 * 60 * 1000; // 10 minutes
        const expiredThreshold = new Date(Date.now() - expirationTime);

        // Find pending_payment orders older than 10 mins
        const expiredOrders = await Order.find({
            status: 'pending_payment',
            createdAt: { $lt: expiredThreshold }
        });

        if (expiredOrders.length > 0) {
            console.log(`[Cleanup] Found ${expiredOrders.length} expired orders. Cancelling...`);
            for (const order of expiredOrders) {
                // Cancel order
                await Order.findByIdAndUpdate(order._id, { status: 'cancelled' });

                // Restore products to active
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(item.productId, { status: 'active' });
                }
            }
        }
    } catch (error) {
        console.error('Error during cleanupExpiredOrders:', error);
    }
};

exports.cleanupExpiredOrders = cleanupExpiredOrders;

exports.getOrders = async (req, res) => {
    try {
        await cleanupExpiredOrders();
        const { buyerId } = req.params;
        let orders = await Order.find({ buyerId }).populate('items.productId').sort({ createdAt: -1 }).lean();
        
        for (let order of orders) {
            for (let item of order.items) {
                if (item.productId && item.productId._id) {
                     const image = await ProductImage.findOne({ productId: item.productId._id, isPrimary: true });
                     if (image) {
                         item.productId.image = image.imageUrl;
                     } else {
                         const firstImage = await ProductImage.findOne({ productId: item.productId._id });
                         item.productId.image = firstImage ? firstImage.imageUrl : null;
                     }
                }
            }
        }

        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        await cleanupExpiredOrders();
        const { orderId } = req.params;
        const order = await Order.findById(orderId).populate('items.productId').lean();
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        for (let item of order.items) {
            if (item.productId && item.productId._id) {
                 const image = await ProductImage.findOne({ productId: item.productId._id, isPrimary: true });
                 if (image) {
                     item.productId.image = image.imageUrl;
                 } else {
                     const firstImage = await ProductImage.findOne({ productId: item.productId._id });
                     item.productId.image = firstImage ? firstImage.imageUrl : null;
                 }
            }
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const { buyerId, items, totalAmount, shippingAddress, buyerName, buyerPhone, paymentMethod } = req.body;

        const newOrder = new Order({
            buyerId, 
            items, 
            totalAmount, 
            shippingAddress, 
            buyerName, 
            buyerPhone, 
            paymentMethod
        });
        await newOrder.save();

        // Xoá giỏ hàng sau khi đặt thành công
        await Cart.findOneAndUpdate({ userId: buyerId }, { items: [] });
        
        // Đổi trạng thái các sản phẩm thành "sold" (nếu thiết kế kho chỉ có 1)
        for (let item of items) {
             await Product.findByIdAndUpdate(item.productId, { status: 'sold' });
        }

        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
