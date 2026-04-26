const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Buyer ID is required']
    },
    orderCode: {
        type: String,
        unique: true
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

// Hàm sinh mã Order (VD: ORD-260426-8A3F)
orderSchema.pre('save', async function(next) {
    if (!this.orderCode) {
        let isUnique = false;
        while (!isUnique) {
            const date = new Date();
            const dateStr = `${String(date.getFullYear()).slice(-2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
            const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
            const newCode = `ORD-${dateStr}-${randomStr}`;
            
            // Kiểm tra trùng lặp
            const existing = await mongoose.models.Order.findOne({ orderCode: newCode });
            if (!existing) {
                this.orderCode = newCode;
                isUnique = true;
            }
        }
    }
});

module.exports = mongoose.model('Order', orderSchema, 'orders');
