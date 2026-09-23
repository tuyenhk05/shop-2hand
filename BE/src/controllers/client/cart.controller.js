const Cart = require('../../models/carts.model');
const Product = require('../../models/products.model');
const ProductImage = require('../../models/productImages.model');

exports.getCart = async (req, res) => {
    try {
        const targetUserId = req.user?.id || req.params.userId;
        if (req.user && req.params.userId && req.params.userId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập giỏ hàng này' });
        }

        let cart = await Cart.findOne({ userId: targetUserId }).populate('items.productId').lean();
        if (!cart) {
            cart = await Cart.create({ userId: targetUserId, items: [] });
            return res.status(200).json({ success: true, cart: [], data: [] });
        }

        // Loại bỏ các sản phẩm đã bán khỏi giỏ hàng hiển thị (tuỳ chọn nhưng nên làm)
        const validItems = cart.items.filter(item => item.productId && item.productId.status === 'active');
        
        // Lookup ảnh cho từng sản phẩm trong giỏ hàng
        const itemsWithImages = await Promise.all(
            validItems.map(async (item) => {
                if (item.productId && item.productId._id) {
                    const images = await ProductImage.find({ productId: item.productId._id })
                        .sort({ isPrimary: -1, sortOrder: 1 })
                        .lean();
                    return {
                        ...item,
                        productId: {
                            ...item.productId,
                            images
                        }
                    };
                }
                return item;
            })
        );

        res.status(200).json({ success: true, cart: itemsWithImages, data: itemsWithImages });
    } catch (error) {
        console.error('getCart error:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy giỏ hàng' });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const targetUserId = req.user?.id || req.params.userId;
        if (req.user && req.params.userId && req.params.userId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa giỏ hàng này' });
        }

        const { productId, quantity = 1 } = req.body;
        
        // Kiểm tra trạng thái sản phẩm trước khi thêm
        const product = await Product.findById(productId).lean();
        if (!product || product.status !== 'active') {
            return res.status(400).json({ 
                success: false, 
                message: product?.status === 'sold' ? 'Sản phẩm này đã bán' : 'Sản phẩm hiện không khả dụng' 
            });
        }

        let cart = await Cart.findOne({ userId: targetUserId });
        if (!cart) cart = new Cart({ userId: targetUserId, items: [] });

        const itemIndex = cart.items.findIndex(p => p.productId && p.productId.toString() === productId);
        if (itemIndex > -1) {
            return res.status(400).json({ 
                success: false, 
                message: 'Sản phẩm này đã có trong giỏ hàng' 
            });
        }
        
        // Luôn ép số lượng là 1 cho hàng độc bản (second-hand)
        const finalQuantity = 1;
        cart.items.push({ productId, quantity: finalQuantity });

        await cart.save();
        res.status(200).json({ success: true, message: 'Đã thêm sản phẩm vào giỏ hàng' });
    } catch (error) {
        console.error('addToCart error:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi thêm vào giỏ hàng' });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const targetUserId = req.user?.id || req.params.userId;
        if (req.user && req.params.userId && req.params.userId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa giỏ hàng này' });
        }

        const { productId } = req.body;

        const cart = await Cart.findOne({ userId: targetUserId });
        if (cart) {
            cart.items = cart.items.filter(p => p.productId && p.productId.toString() !== productId);
            await cart.save();
        }
        res.status(200).json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
    } catch (error) {
        console.error('removeFromCart error:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xóa khỏi giỏ hàng' });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const targetUserId = req.user?.id || req.params.userId;
        if (req.user && req.params.userId && req.params.userId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa giỏ hàng này' });
        }

        await Cart.findOneAndUpdate({ userId: targetUserId }, { items: [] });
        res.status(200).json({ success: true, message: 'Đã dọn sạch giỏ hàng' });
    } catch (error) {
        console.error('clearCart error:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xóa giỏ hàng' });
    }
};
