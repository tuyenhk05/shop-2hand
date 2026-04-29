const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Product title is required'],
        trim: true,
        maxlength: [255, 'Title cannot exceed 255 characters']
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    originalPrice: {
        type: Number,
        min: [0, 'Original price cannot be negative']
    },
    condition: {
        type: String,
        enum: ['new', 'like_new', 'good', 'fair', 'poor'],
        required: [true, 'Product condition is required']
    },
    size: {
        type: String,
        maxlength: [50, 'Size cannot exceed 50 characters']
    },
    color: {
        type: String,
        maxlength: [50, 'Color cannot exceed 50 characters']
    },
    material: {
        type: String,
        maxlength: [100, 'Material cannot exceed 100 characters']
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'unisex', 'kids'],
        default: 'unisex'
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand'
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    listingType: {
        type: String,
        enum: ['direct_sale', 'consignment', 'buyback'],
        default: 'direct_sale'
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'active', 'sold', 'rejected', 'archived', 'delete'],
        default: 'pending'
    },
    stock: {
        type: Number,
        default: 1,
        min: [0, 'Stock cannot be negative']
    },
    views: {
        type: Number,
        default: 0,
        min: [0, 'Views cannot be negative']
    },
    isMain: {
        type: Boolean,
        default: false
    },
    position: {
        type: Number
    },

    slug: {
        type: String,
        slug: 'title',
        unique: true,
        sparse: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'products' });

module.exports = mongoose.model('Product', productSchema, 'products');