const mongoose = require('mongoose');

const consignmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    consignmentCode: {
        type: String,
        unique: true
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

// Hàm sinh mã Ký gửi (VD: KG-260426-9B21)
consignmentSchema.pre('save', async function(next) {
    if (!this.consignmentCode) {
        let isUnique = false;
        while (!isUnique) {
            const date = new Date();
            const dateStr = `${String(date.getFullYear()).slice(-2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
            const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
            const newCode = `KG-${dateStr}-${randomStr}`;
            
            // Kiểm tra trùng lặp
            const existing = await mongoose.models.Consignment.findOne({ consignmentCode: newCode });
            if (!existing) {
                this.consignmentCode = newCode;
                isUnique = true;
            }
        }
    }
});

module.exports = mongoose.model('Consignment', consignmentSchema, 'consignments');
