const Brand = require('../../models/brands.model');

exports.getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find({}).sort({ sortOrder: 1, createdAt: -1 });
        res.status(200).json({ success: true, data: brands });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createBrand = async (req, res) => {
    try {
        const { name, description, image, isActive, sortOrder } = req.body;
        let slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const newBrand = await Brand.create({ 
            name, slug, description, image, isActive, sortOrder 
        });
        res.status(201).json({ success: true, data: newBrand });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, image, isActive, sortOrder } = req.body;

        let updateData = { name, description, image, isActive, sortOrder };
        if (name) {
            updateData.slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }

        const updatedBrand = await Brand.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json({ success: true, data: updatedBrand });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;
        await Brand.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Thương hiệu đã bị xóa' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
