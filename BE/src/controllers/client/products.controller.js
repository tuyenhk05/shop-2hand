const Product = require('../../models/products.model');
const ProductImage = require('../../models/productImages.model');
const Brand = require('../../models/brands.model');

module.exports.getAllProducts = async (req, res) => {
    try {
        // 1. Lấy sản phẩm và nối (populate) thông tin Brand
        // Dùng .lean() để biến Mongoose Document thành Plain JavaScript Object (để gán thêm field images)
        // 1. Chỉ lấy các sản phẩm đang hiển thị (active) và còn hàng
        const products = await Product.find({ status: 'active' })
            .populate('brandId', 'name logoUrl')
            .populate('categoryId', 'name')
            .lean();

        // 2. Lấy ra danh sách tất cả ID của các sản phẩm vừa tìm được
        const productIds = products.map(product => product._id);

        // 3. Tìm TẤT CẢ hình ảnh thuộc về nhóm sản phẩm trên, sắp xếp theo sortOrder
        const allImages = await ProductImage.find({ productId: { $in: productIds } })
            .sort({ sortOrder: 1 })
            .lean();

        // 4. Lắp ráp: Ghép mảng hình ảnh vào đúng từng sản phẩm tương ứng
        const productsWithImages = products.map(product => {
            return {
                ...product,
                images: allImages.filter(img => img.productId.toString() === product._id.toString())
            };
        });

        res.status(200).json({
            success: true,
            data: productsWithImages
        });
    }
    catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching products'
        });
    }
};

module.exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const mongoose = require('mongoose');

        // Xác định điều kiện tìm kiếm: Nếu là ID chuẩn thì tìm bằng _id, nếu không thì tìm bằng slug
        const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };

        // 1. Lấy thông tin chi tiết của 1 sản phẩm
        const product = await Product.findOne(query)
            .populate('brandId', 'name logoUrl')
            .populate('categoryId', 'name')
            .lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // 2. Lấy danh sách ảnh của riêng sản phẩm này (dùng ObjectId thay vì params)
        const images = await ProductImage.find({ productId: product._id })
            .sort({ sortOrder: 1 })
            .lean();

        // 3. Nhét mảng ảnh vào trong object product
        product.images = images;

        res.status(200).json({
            success: true,
            data: product
        });
    }
    catch (error) {
        console.error('Get product by id error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching product'
        });
    }
};
module.exports.createProduct = async (req, res) => {
    try {
        const productData = req.body;
        const newProduct = await Product.create(productData);
        
        res.status(201).json({
            success: true,
            data: newProduct,
            message: 'Product created successfully'
        });
    }
    catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while creating product'
        });
    }
};

module.exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: updatedProduct,
            message: 'Product updated successfully'
        });
    }
    catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating product'
        });
    }
};

module.exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        
        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: deletedProduct,
            message: 'Product deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while deleting product'
        });
    }
};
// ==============================================================
// PHẦN QUẢN LÝ HÌNH ẢNH SẢN PHẨM (PRODUCT IMAGES)
// ==============================================================

// 1. Lấy tất cả hình ảnh của một sản phẩm
exports.getImagesByProductId = async (req, res) => {
    try {
        const { productId } = req.params;

        // Lấy ảnh và tự động sắp xếp theo sortOrder từ nhỏ đến lớn
        const images = await ProductImage.find({ productId: productId })
            .sort({ sortOrder: 1 });

        res.status(200).json({
            success: true,
            data: images
        });
    } catch (error) {
        console.error('Lấy hình ảnh lỗi:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy danh sách hình ảnh'
        });
    }
};

// 2. Thêm một hình ảnh mới cho sản phẩm
exports.addProductImage = async (req, res) => {
    try {
        const { productId } = req.params;
        const { imageUrl, isPrimary, sortOrder } = req.body;

        // LOGIC BẢO VỆ: Nếu ảnh mới được set là Primary (Ảnh bìa)
        // Thì phải gỡ trạng thái Primary của tất cả các ảnh cũ của sản phẩm này
        if (isPrimary === true) {
            await ProductImage.updateMany(
                { productId: productId },
                { isPrimary: false }
            );
        }

        const newImage = await ProductImage.create({
            productId: productId,
            imageUrl: imageUrl,
            isPrimary: isPrimary || false,
            sortOrder: sortOrder || 0
        });

        res.status(201).json({
            success: true,
            message: 'Thêm hình ảnh thành công',
            data: newImage
        });
    } catch (error) {
        console.error('Thêm hình ảnh lỗi:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi thêm hình ảnh mới'
        });
    }
};

// 3. Cập nhật thông tin hình ảnh (Đổi URL, đổi ảnh bìa, đổi thứ tự)
exports.updateProductImage = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Nếu request yêu cầu biến ảnh này thành ảnh bìa
        if (updateData.isPrimary === true) {
            // Bước 1: Phải tìm xem ảnh này thuộc về productId nào
            const currentImage = await ProductImage.findById(id);
            if (currentImage) {
                // Bước 2: Tắt primary của các ảnh khác cùng productId
                await ProductImage.updateMany(
                    { productId: currentImage.productId, _id: { $ne: id } },
                    { isPrimary: false }
                );
            }
        }

        const updatedImage = await ProductImage.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedImage) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hình ảnh này'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật hình ảnh thành công',
            data: updatedImage
        });
    } catch (error) {
        console.error('Cập nhật hình ảnh lỗi:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi cập nhật hình ảnh'
        });
    }
};

// 4. Xóa hình ảnh
exports.deleteProductImage = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedImage = await ProductImage.findByIdAndDelete(id);

        if (!deletedImage) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hình ảnh để xóa'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Đã xóa hình ảnh',
            data: deletedImage
        });
    } catch (error) {
        console.error('Xóa hình ảnh lỗi:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi xóa hình ảnh'
        });
    }
};