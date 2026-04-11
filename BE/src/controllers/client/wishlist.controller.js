const Wishlist = require('../../models/wishlists.model');
const ProductImage = require('../../models/productImages.model');

exports.getWishlist = async (req, res) => {
    try {
        const { userId } = req.params;

        // Populate product tr\u01b0\u1edbc, sau \u0111\u00f3 l\u1ea5y \u1ea3nh t\u1eeb collection product_images
        const wishlists = await Wishlist.find({ userId }).populate('productId').lean();

        // V\u1edbi m\u1ed7i wishlist item, lookup \u1ea3nh t\u01b0\u01a1ng \u1ee9ng
        const wishlistsWithImages = await Promise.all(
            wishlists.map(async (item) => {
                if (item.productId && item.productId._id) {
                    const images = await ProductImage.find({ productId: item.productId._id })
                        .sort({ isPrimary: -1, sortOrder: 1 }) // \u1ea3nh primary l\u00ean \u0111\u1ea7u
                        .lean();
                    return {
                        ...item,
                        productId: {
                            ...item.productId,
                            images // g\u1eafn m\u1ea3ng \u1ea3nh v\u00e0o product
                        }
                    };
                }
                return item;
            })
        );

        res.status(200).json({ success: true, data: wishlistsWithImages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId } = req.body;

        const existing = await Wishlist.findOne({ userId, productId });
        if (existing) {
            return res.status(200).json({ success: true, message: 'Already in wishlist' });
        }

        await Wishlist.create({ userId, productId });
        res.status(201).json({ success: true, message: 'Added to wishlist' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId } = req.body;
        await Wishlist.findOneAndDelete({ userId, productId });
        res.status(200).json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
