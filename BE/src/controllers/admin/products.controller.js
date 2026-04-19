const Product = require('../../models/products.model');
const ProductImage = require('../../models/productImages.model');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../configs/cloudinary');

// ✅ Lấy tất cả sản phẩm kèm ảnh đại diện từ bảng product_images
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({})
            .populate('categoryId', 'name')
            .populate('brandId', 'name')
            .sort({ createdAt: -1 });

        // Lấy ảnh primary cho từng sản phẩm từ bảng product_images
        const productIds = products.map(p => p._id);
        const images = await ProductImage.find({
            productId: { $in: productIds },
            isPrimary: true
        });

        // Map ảnh vào từng sản phẩm
        const imageMap = {};
        images.forEach(img => {
            imageMap[img.productId.toString()] = img.imageUrl;
        });

        const productsWithImages = products.map(p => ({
            ...p.toObject(),
            mainImage: imageMap[p._id.toString()] || null
        }));

        res.status(200).json({ success: true, data: productsWithImages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Lấy chi tiết 1 sản phẩm kèm TẤT CẢ ảnh
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('categoryId', 'name')
            .populate('brandId', 'name');
        if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

        const images = await ProductImage.find({ productId: product._id }).sort({ sortOrder: 1, isPrimary: -1 });

        res.status(200).json({ success: true, data: { ...product.toObject(), images } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Tạo sản phẩm mới + Upload ảnh lên Cloudinary
exports.createProduct = async (req, res) => {
    try {
        const productData = { ...req.body };

        // Tạo sản phẩm
        const product = new Product(productData);
        await product.save();

        // Upload ảnh nếu có
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(async (file, index) => {
                const result = await uploadToCloudinary(file.buffer, 'shop-2hand/products');
                return new ProductImage({
                    productId: product._id,
                    imageUrl: result.secure_url,
                    isPrimary: index === 0, // Ảnh đầu tiên là primary
                    sortOrder: index
                });
            });

            const imageDocuments = await Promise.all(uploadPromises);
            await ProductImage.insertMany(imageDocuments);
        }

        const newProduct = await Product.findById(product._id)
            .populate('categoryId', 'name')
            .populate('brandId', 'name');
        const images = await ProductImage.find({ productId: product._id });

        res.status(201).json({
            success: true,
            message: 'Tạo sản phẩm thành công',
            data: { ...newProduct.toObject(), images }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Cập nhật sản phẩm + Upload ảnh mới nếu có
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body, updatedAt: new Date() };

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true })
            .populate('categoryId', 'name')
            .populate('brandId', 'name');

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        // Nếu có ảnh mới được upload
        if (req.files && req.files.length > 0) {
            // Lấy số thứ tự ảnh hiện tại
            const existingCount = await ProductImage.countDocuments({ productId: id });

            const uploadPromises = req.files.map(async (file, index) => {
                const result = await uploadToCloudinary(file.buffer, 'shop-2hand/products');
                return new ProductImage({
                    productId: id,
                    imageUrl: result.secure_url,
                    isPrimary: existingCount === 0 && index === 0, // Chỉ set primary nếu chưa có ảnh nào
                    sortOrder: existingCount + index
                });
            });

            const imageDocuments = await Promise.all(uploadPromises);
            await ProductImage.insertMany(imageDocuments);
        }

        const images = await ProductImage.find({ productId: id }).sort({ sortOrder: 1 });

        res.status(200).json({ success: true, data: { ...updatedProduct.toObject(), images } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Thay đổi trạng thái sản phẩm
exports.updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(id, { status }, { new: true });

        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Xóa sản phẩm + Xóa ảnh khỏi Cloudinary
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Xóa ảnh trên Cloudinary trước
        const images = await ProductImage.find({ productId: id });
        for (const img of images) {
            // Lấy public_id từ URL Cloudinary (phần sau /upload/ và trước extension)
            const urlParts = img.imageUrl.split('/');
            const uploadIndex = urlParts.indexOf('upload');
            if (uploadIndex !== -1) {
                const publicIdWithExt = urlParts.slice(uploadIndex + 2).join('/'); // bỏ version
                const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
                await deleteFromCloudinary(publicId);
            }
        }

        // Xóa ảnh trong DB
        await ProductImage.deleteMany({ productId: id });

        // Xóa sản phẩm
        await Product.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Đã xóa sản phẩm thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Xóa 1 ảnh cụ thể của sản phẩm
exports.deleteProductImage = async (req, res) => {
    try {
        const { imageId } = req.params;
        const image = await ProductImage.findById(imageId);
        if (!image) return res.status(404).json({ success: false, message: 'Không tìm thấy ảnh' });

        // Xóa trên Cloudinary
        const urlParts = image.imageUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        if (uploadIndex !== -1) {
            const publicIdWithExt = urlParts.slice(uploadIndex + 2).join('/');
            const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
            await deleteFromCloudinary(publicId);
        }

        await ProductImage.findByIdAndDelete(imageId);

        // Nếu ảnh bị xóa là primary, đặt ảnh tiếp theo làm primary
        if (image.isPrimary) {
            const nextImage = await ProductImage.findOne({ productId: image.productId }).sort({ sortOrder: 1 });
            if (nextImage) {
                await ProductImage.findByIdAndUpdate(nextImage._id, { isPrimary: true });
            }
        }

        res.status(200).json({ success: true, message: 'Đã xóa ảnh' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
