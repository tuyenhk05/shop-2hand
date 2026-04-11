const Category = require('../../models/category.model');
const Product = require('../../models/products.model');

// 1. Lấy danh sách tất cả danh mục (có kèm thông tin danh mục cha nếu có)
module.exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .populate('parent_id', 'name slug') // Lấy tên của danh mục cha
            .sort({ category_id: 1 });

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get all categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy danh sách danh mục'
        });
    }
};

// 2. Lấy thông tin chi tiết 1 danh mục
module.exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id).populate('parent_id', 'name');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Get category by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy thông tin danh mục'
        });
    }
};

// 3. Lấy tất cả sản phẩm thuộc về 1 danh mục
module.exports.getProductsByCategoryId = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục'
            });
        }

        // Tìm sản phẩm có categoryId khớp với id của danh mục này
        const products = await Product.find({ categoryId: id })
            .populate('brandId', 'name logoUrl')
            .lean();

        res.status(200).json({
            success: true,
            categoryInfo: category,
            data: products
        });
    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy sản phẩm của danh mục này'
        });
    }
};

// 4. Tạo danh mục mới
module.exports.createCategory = async (req, res) => {
    try {
        const categoryData = req.body;
        const newCategory = await Category.create(categoryData);

        res.status(201).json({
            success: true,
            message: 'Tạo danh mục thành công',
            data: newCategory
        });
    } catch (error) {
        console.error('Create category error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Tên danh mục hoặc Category ID đã tồn tại!'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi tạo danh mục'
        });
    }
};

// 5. Cập nhật danh mục
module.exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        updateData.updatedAt = Date.now();

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục để cập nhật'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật danh mục thành công',
            data: updatedCategory
        });
    } catch (error) {
        console.error('Update category error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Tên danh mục hoặc Category ID đã tồn tại!'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi cập nhật danh mục'
        });
    }
};

// 6. Xóa danh mục
module.exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Kiểm tra xem có danh mục con nào đang dùng danh mục này làm parent_id không
        const subCategories = await Category.find({ parent_id: id });
        if (subCategories.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa! Có các danh mục con đang phụ thuộc vào danh mục này.'
            });
        }

        // 2. Tiến hành xóa
        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục để xóa'
            });
        }

        // 3. Xóa liên kết (set null) trên các sản phẩm đang thuộc danh mục này
        await Product.updateMany({ categoryId: id }, { categoryId: null });

        res.status(200).json({
            success: true,
            message: 'Xóa danh mục thành công',
            data: deletedCategory
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi xóa danh mục'
        });
    }
};