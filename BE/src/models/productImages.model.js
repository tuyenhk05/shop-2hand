const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required']
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required'],
        maxlength: [500, 'Image URL cannot exceed 500 characters']
    },
    isPrimary: {
        type: Boolean,
        default: false
    },
    sortOrder: {
        type: Number,
        default: 0,
        min: [0, 'Sort order cannot be negative']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'product_images' });

module.exports = mongoose.model('ProductImage', productImageSchema, 'product_images');