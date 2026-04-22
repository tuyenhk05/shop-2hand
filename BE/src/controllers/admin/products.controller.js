const Product = require('../../models/products.model');
const ProductImage = require('../../models/productImages.model');
const Brand = require('../../models/brands.model');
const mongoose = require('mongoose');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../configs/cloudinary');

// ✅ Lấy tất cả sản phẩm kèm ảnh đại diện từ bảng product_images
exports.getAllProducts = async (req, res) => {
    try {
        const { q, status, categoryId, minPrice, maxPrice } = req.query;
        
        // Xây dựng query cơ bản (không lấy sản phẩm đã xóa)
        const query = { status: { $ne: 'delete' } };

        // 1. Tìm kiếm theo từ khóa (title hoặc description)
        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ];
        }

        // 2. Lọc theo trạng thái
        if (status) {
            query.status = status;
        }

        // 3. Lọc theo danh mục
        if (categoryId) {
            query.categoryId = categoryId;
        }

        // 4. Lọc theo khoảng giá
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const products = await Product.find(query)
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
        console.log('--- START CREATE PRODUCT ---');
        const productData = { ...req.body };
        console.log('Body data:', productData);

        // ✅ Xử lý Brand mới nếu brandId không phải ObjectId hợp lệ
        if (productData.brandId && !mongoose.Types.ObjectId.isValid(productData.brandId)) {
            const brandName = productData.brandId;
            // Tìm brand theo tên (không phân biệt hoa thường)
            let brand = await Brand.findOne({ name: { $regex: new RegExp(`^${brandName}$`, 'i') } });
            
            if (!brand) {
                // Tạo mới nếu chưa có
                const brand_id = brandName.toLowerCase().replace(/ /g, '_').replace(/[^\w-]+/g, '') + '_' + Date.now().toString().slice(-4);
                brand = await Brand.create({
                    name: brandName,
                    brand_id: brand_id
                });
                console.log('Created new brand:', brand.name, 'ID:', brand._id);
            }
            productData.brandId = brand._id;
        }

        // Tạo sản phẩm
        const product = new Product(productData);
        await product.save();
        console.log('Product saved, ID:', product._id);

        // Upload ảnh nếu có
        if (req.files && req.files.length > 0) {
            console.log(`Uploading ${req.files.length} files...`);
            const uploadPromises = req.files.map(async (file, index) => {
                const result = await uploadToCloudinary(file.buffer, 'shop-2hand/products');
                console.log(`- Uploaded image ${index} to Cloudinary:`, result.secure_url);
                return new ProductImage({
                    productId: product._id,
                    imageUrl: result.secure_url,
                    isPrimary: index === 0, // Ảnh đầu tiên là primary
                    sortOrder: index
                });
            });

            const imageDocuments = await Promise.all(uploadPromises);
            await ProductImage.insertMany(imageDocuments);
            console.log('All image records saved to database.');
        } else {
            console.log('No files to upload.');
        }

        const newProduct = await Product.findById(product._id)
            .populate('categoryId', 'name')
            .populate('brandId', 'name');
        const images = await ProductImage.find({ productId: product._id });

        console.log('--- CREATE PRODUCT FINISHED ---');
        res.status(201).json({
            success: true,
            message: 'Tạo sản phẩm thành công',
            data: { ...newProduct.toObject(), images }
        });
    } catch (error) {
        console.error('--- CREATE PRODUCT ERROR ---');
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Cập nhật sản phẩm + Upload ảnh mới nếu có
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('--- START UPDATE PRODUCT ---', id);
        const updateData = { ...req.body, updatedAt: new Date() };

        // ✅ Xử lý Brand mới nếu brandId không phải ObjectId hợp lệ
        if (updateData.brandId && !mongoose.Types.ObjectId.isValid(updateData.brandId)) {
            const brandName = updateData.brandId;
            let brand = await Brand.findOne({ name: { $regex: new RegExp(`^${brandName}$`, 'i') } });
            
            if (!brand) {
                const brand_id = brandName.toLowerCase().replace(/ /g, '_').replace(/[^\w-]+/g, '') + '_' + Date.now().toString().slice(-4);
                brand = await Brand.create({
                    name: brandName,
                    brand_id: brand_id
                });
                console.log('Created new brand in update:', brand.name, 'ID:', brand._id);
            }
            updateData.brandId = brand._id;
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true })
            .populate('categoryId', 'name')
            .populate('brandId', 'name');

        if (!updatedProduct) {
            console.log('Product not found:', id);
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        // Nếu có ảnh mới được upload
        if (req.files && req.files.length > 0) {
            console.log(`Updating product images: uploading ${req.files.length} new files...`);
            // Lấy số thứ tự ảnh hiện tại
            const existingCount = await ProductImage.countDocuments({ productId: id });

            const uploadPromises = req.files.map(async (file, index) => {
                const result = await uploadToCloudinary(file.buffer, 'shop-2hand/products');
                console.log(`- Uploaded new image ${index} to Cloudinary:`, result.secure_url);
                return new ProductImage({
                    productId: id,
                    imageUrl: result.secure_url,
                    isPrimary: existingCount === 0 && index === 0, // Chỉ set primary nếu chưa có ảnh nào
                    sortOrder: existingCount + index
                });
            });

            const imageDocuments = await Promise.all(uploadPromises);
            await ProductImage.insertMany(imageDocuments);
            console.log('New image records saved to database.');
        }

        const images = await ProductImage.find({ productId: id }).sort({ sortOrder: 1 });

        console.log('--- UPDATE PRODUCT FINISHED ---');
        res.status(200).json({ success: true, data: { ...updatedProduct.toObject(), images } });
    } catch (error) {
        console.error('--- UPDATE PRODUCT ERROR ---');
        console.error(error);
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

        // Cập nhật trạng thái thành 'delete' (Soft delete)
        const updatedProduct = await Product.findByIdAndUpdate(id, { status: 'delete' }, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        res.status(200).json({ success: true, message: 'Đã xóa sản phẩm thành công (soft delete)' });
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
