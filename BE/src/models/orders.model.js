const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Buyer ID is required']
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            priceAtSale: {
                type: Number,
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingFee: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending_payment'
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'vnpay', 'momo', 'bank_transfer'],
        default: 'vnpay'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    shippingAddress: {
        type: String, // In production, this can be broken down into address, district, city, phone
        required: true
    },
    buyerName: {
        type: String,
        default: ''
    },
    buyerPhone: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'orders' });

module.exports = mongoose.model('Order', orderSchema, 'orders');
