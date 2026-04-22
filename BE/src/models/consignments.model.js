const mongoose = require('mongoose');

const consignmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    expectedPrice: {
        type: Number,
        required: [true, 'Expected Price is required']
    },
    photos: [{
        type: String, // URLs to images hosted on Cloudinary
        required: true
    }],
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand'
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'unisex', 'kids'],
        default: 'unisex'
    },
    size: {
        type: String
    },
    color: {
        type: String
    },
    material: {
        type: String
    },
    condition: {
        type: String,
        enum: ['perfect', 'excellent', 'very_good', 'good'],
        default: 'excellent'
    },
    status: {
        type: String,
        enum: ['pending', 'valued', 'approved', 'rejected', 'completed'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        default: ''
    },
    approvedProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },
    commissionRate: {
        type: Number,
        default: 0
    },
    payoutAmount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    processedAt: {
        type: Date,
        default: null
    }
}, { collection: 'consignments' });

module.exports = mongoose.model('Consignment', consignmentSchema, 'consignments');
