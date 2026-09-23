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
    brand_id: {
        type: String,
        required: [true, 'Brand ID is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Brand ID cannot exceed 50 characters']
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

// Tự động tạo brand_id nếu không được truyền vào khi tạo mới
brandSchema.pre('validate', function () {
    if (!this.brand_id && this.name) {
        this.brand_id = this.name.toLowerCase().replace(/ /g, '_').replace(/[^\w-]+/g, '') + '_' + Date.now().toString().slice(-4);
    }
});

module.exports = mongoose.model('Brand', brandSchema, 'brands');