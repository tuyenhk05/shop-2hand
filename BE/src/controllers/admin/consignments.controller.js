const Consignment = require('../../models/consignments.model');
const Product = require('../../models/products.model');
const ProductImage = require('../../models/productImages.model');

// Lấy danh sách toàn bộ yêu cầu ký gửi
exports.getAllConsignments = async (req, res) => {
    try {
        const consignments = await Consignment.find({})
            .populate('userId', 'fullName email phone')
            .populate('categoryId', 'name')
            .populate('brandId', 'name')
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, data: consignments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật trạng thái ký gửi
exports.updateConsignmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes, expectedPrice } = req.body;
        
        let updateData = {};
        if (status) updateData.status = status;
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
        if (expectedPrice !== undefined) updateData.expectedPrice = Number(expectedPrice);

        const updatedConsignment = await Consignment.findByIdAndUpdate(id, updateData, { new: true })
            .populate('userId', 'fullName email phone')
            .populate('categoryId', 'name')
            .populate('brandId', 'name');
            
        res.status(200).json({ success: true, data: updatedConsignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa yêu cầu ký gửi
exports.deleteConsignment = async (req, res) => {
    try {
        const { id } = req.params;
        await Consignment.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Đã xóa yêu cầu ký gửi' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Chuyển đổi Ký gửi thành Sản phẩm (Đăng bán)
exports.convertToProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const consignment = await Consignment.findById(id);

        if (!consignment) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu ký gửi.' });
        }

        if (consignment.status !== 'received') {
            return res.status(400).json({ success: false, message: 'Yêu cầu ký gửi chưa được xác nhận nhận hàng & kiểm định.' });
        }

        // 1. Tạo sản phẩm mới
        const product = new Product({
            title: consignment.title,
            description: consignment.description,
            price: consignment.expectedPrice, // Lấy giá đã được định giá (hoặc giá mong muốn)
            originalPrice: consignment.expectedPrice * 1.2, // Mock 
            condition: consignment.condition === 'perfect' ? 'new' : (consignment.condition === 'excellent' ? 'like_new' : 'good'),
            size: consignment.size,
            color: consignment.color,
            material: consignment.material,
            gender: consignment.gender || 'unisex',
            categoryId: consignment.categoryId,
            brandId: consignment.brandId,
            sellerId: consignment.userId,
            listingType: 'consignment',
            status: 'active', // Đăng lên kệ luôn
            stock: 1
        });

        await product.save();

        // 2. Tạo record ảnh sản phẩm từ ảnh ký gửi
        if (consignment.photos && consignment.photos.length > 0) {
            const imageDocuments = consignment.photos.map((url, index) => ({
                productId: product._id,
                imageUrl: url,
                isPrimary: index === 0,
                sortOrder: index
            }));
            await ProductImage.insertMany(imageDocuments);
        }

        // 3. Cập nhật trạng thái ký gửi thành hoàn thành và lưu productId
        consignment.status = 'completed';
        consignment.approvedProductId = product._id;
        consignment.processedAt = Date.now();
        await consignment.save();

        res.status(200).json({ 
            success: true, 
            message: 'Đã đăng bán sản phẩm thành công!',
            productId: product._id 
        });
    } catch (error) {
        console.error('Convert Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
