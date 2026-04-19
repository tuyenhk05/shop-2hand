const Category = require('../../models/category.model');

// ✅ Lấy tất cả danh mục (có tên danh mục cha)
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({})
            .populate('parent_id', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Tạo danh mục mới
exports.createCategory = async (req, res) => {
    try {
        const { name, parent_id } = req.body;

        // Tính toán category_id tiếp theo (Number)
        const lastCategory = await Category.findOne().sort({ category_id: -1 });
        const nextId = lastCategory ? lastCategory.category_id + 1 : 1;

        const newCategory = await Category.create({
            name,
            category_id: nextId,
            parent_id: parent_id || null
        });

        res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Cập nhật danh mục
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params; // _id của MongoDB
        const { name, parent_id } = req.body;

        const updateData = { name };
        if (parent_id !== undefined) {
            updateData.parent_id = parent_id || null;
        }

        const updatedCategory = await Category.findByIdAndUpdate(id, updateData, { new: true })
            .populate('parent_id', 'name');

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        }

        res.status(200).json({ success: true, data: updatedCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Xóa danh mục
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Kiểm tra xem có danh mục con nào đang phụ thuộc không
        const hasChildren = await Category.findOne({ parent_id: id });
        if (hasChildren) {
            return res.status(400).json({ 
                success: false, 
                message: 'Không thể xóa danh mục này vì có danh mục con đang phụ thuộc' 
            });
        }

        await Category.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Danh mục đã bị xóa' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
