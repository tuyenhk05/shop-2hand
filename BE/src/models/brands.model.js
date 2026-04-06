const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Brand name is required'],
        unique: true,
        trim: true,
        maxlength: [100, 'Brand name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        slug: 'name',
        unique: true,
        sparse: true
    },
    logoUrl: {
        type: String,
        maxlength: [500, 'Logo URL cannot exceed 500 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'brands' });

module.exports = mongoose.model('Brand', brandSchema, 'brands');