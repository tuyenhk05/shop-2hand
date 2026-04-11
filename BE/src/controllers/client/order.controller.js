const Order = require('../../models/orders.model');
const Cart = require('../../models/carts.model');
const Product = require('../../models/products.model');

exports.getOrders = async (req, res) => {
    try {
        const { buyerId } = req.params;
        const orders = await Order.find({ buyerId }).populate('items.productId').sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
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
