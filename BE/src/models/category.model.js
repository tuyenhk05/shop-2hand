const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const categorySchema = new mongoose.Schema({
    category_id: {
        type: Number,
        required: [true, 'Category ID is required'],
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        maxlength: [100, 'Category name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        slug: 'name',
        unique: true,
        sparse: true
    },
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Liên kết (Self-reference) về chính bảng Category để tạo danh mục cha - con
        default: null
    },
    image_url: {
        type: String,
        maxlength: [500, 'Image URL cannot exceed 500 characters'],
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
}, { collection: 'categories' });

module.exports = mongoose.model('Category', categorySchema, 'categories');