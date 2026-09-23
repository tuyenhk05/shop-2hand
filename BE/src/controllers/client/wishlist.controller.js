const Wishlist = require('../../models/wishlists.model');
const ProductImage = require('../../models/productImages.model');

exports.getWishlist = async (req, res) => {
    try {
        const targetUserId = req.user?.id || req.params.userId;
        if (req.user && req.params.userId && req.params.userId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền xem danh sách yêu thích này' });
        }

        const wishlists = await Wishlist.find({ userId: targetUserId }).populate('productId').lean();

        const wishlistsWithImages = await Promise.all(
            wishlists.map(async (item) => {
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

        res.status(200).json({ success: true, data: wishlistsWithImages });
    } catch (error) {
        console.error('getWishlist error:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách yêu thích' });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const targetUserId = req.user?.id || req.params.userId;
        if (req.user && req.params.userId && req.params.userId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa danh sách yêu thích này' });
        }

        const { productId } = req.body;

        const existing = await Wishlist.findOne({ userId: targetUserId, productId });
        if (existing) {
            return res.status(200).json({ success: true, message: 'Sản phẩm đã có trong danh sách yêu thích' });
        }

        await Wishlist.create({ userId: targetUserId, productId });
        res.status(201).json({ success: true, message: 'Đã thêm vào danh sách yêu thích' });
    } catch (error) {
        console.error('addToWishlist error:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi thêm vào yêu thích' });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const targetUserId = req.user?.id || req.params.userId;
        if (req.user && req.params.userId && req.params.userId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa danh sách yêu thích này' });
        }

        const { productId } = req.body;
        await Wishlist.findOneAndDelete({ userId: targetUserId, productId });
        res.status(200).json({ success: true, message: 'Đã xóa khỏi danh sách yêu thích' });
    } catch (error) {
        console.error('removeFromWishlist error:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xóa khỏi yêu thích' });
    }
};
