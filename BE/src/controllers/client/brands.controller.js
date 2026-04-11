const Brand = require('../../models/brands.model');
const Product = require('../../models/products.model'); // Cần để lấy sản phẩm theo brand

// 1. Lấy danh sách tất cả thương hiệu
module.exports.getAllBrands = async (req, res) => {
    try {
        // Sắp xếp theo tên A-Z
        const brands = await Brand.find().sort({ name: 1 });

        res.status(200).json({
            success: true,
            data: brands
        });
    } catch (error) {
        console.error('Get all brands error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy danh sách thương hiệu'
        });
    }
};

// 2. Lấy thông tin chi tiết 1 thương hiệu
module.exports.getBrandById = async (req, res) => {
    try {
        const { id } = req.params;
        const brand = await Brand.findById(id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thương hiệu'
            });
        }

        res.status(200).json({
            success: true,
            data: brand
        });
    } catch (error) {
        console.error('Get brand by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy thông tin thương hiệu'
        });
    }
};

// 3. Lấy tất cả sản phẩm thuộc về 1 thương hiệu (Cực kỳ hữu ích cho Frontend)
module.exports.getProductsByBrandId = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra xem brand có tồn tại không
        const brand = await Brand.findById(id);
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thương hiệu'
            });
        }

        // Tìm tất cả sản phẩm có brandId trùng khớp
        const products = await Product.find({ brandId: id })
            .populate('categoryId', 'name')
            .lean();

        res.status(200).json({
            success: true,
            brandInfo: brand,
            data: products
        });
    } catch (error) {
        console.error('Get products by brand error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy sản phẩm của thương hiệu này'
        });
    }
};

// 4. Tạo thương hiệu mới
module.exports.createBrand = async (req, res) => {
    try {
        const brandData = req.body;
        const newBrand = await Brand.create(brandData);

        res.status(201).json({
            success: true,
            message: 'Tạo thương hiệu thành công',
            data: newBrand
        });
    } catch (error) {
        console.error('Create brand error:', error);

        // Xử lý lỗi trùng lặp (Duplicate key) của brand_id hoặc name
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Tên thương hiệu hoặc Mã thương hiệu (brand_id) đã tồn tại!'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi tạo thương hiệu'
        });
    }
};

// 5. Cập nhật thông tin thương hiệu
module.exports.updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Dùng returnDocument: 'after' thay cho { new: true } để fix cảnh báo của Mongoose
        const updatedBrand = await Brand.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedBrand) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thương hiệu để cập nhật'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật thương hiệu thành công',
            data: updatedBrand
        });
    } catch (error) {
        console.error('Update brand error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Tên thương hiệu hoặc Mã thương hiệu (brand_id) đã tồn tại!'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi cập nhật thương hiệu'
        });
    }
};

// 6. Xóa thương hiệu
module.exports.deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBrand = await Brand.findByIdAndDelete(id);

        if (!deletedBrand) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thương hiệu để xóa'
            });
        }

        // Tùy chọn nâng cao: Khi xóa Brand, bạn có thể cập nhật các Product có brandId này thành null
        await Product.updateMany({ brandId: id }, { brandId: null });

        res.status(200).json({
            success: true,
            message: 'Xóa thương hiệu thành công',
            data: deletedBrand
        });
    } catch (error) {
        console.error('Delete brand error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi xóa thương hiệu'
        });
    }
};