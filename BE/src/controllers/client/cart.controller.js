const Cart = require('../../models/carts.model');
const ProductImage = require('../../models/productImages.model');

exports.getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        let cart = await Cart.findOne({ userId }).populate('items.productId').lean();
        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
            return res.status(200).json({ success: true, cart: [] });
        }

        // Lookup ảnh cho từng sản phẩm trong giỏ hàng
        const itemsWithImages = await Promise.all(
            (cart.items || []).map(async (item) => {
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

        res.status(200).json({ success: true, cart: itemsWithImages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId, quantity = 1 } = req.body;
        
        let cart = await Cart.findOne({ userId });
        if (!cart) cart = new Cart({ userId, items: [] });

        const itemIndex = cart.items.findIndex(p => p.productId && p.productId.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        await cart.save();
        res.status(200).json({ success: true, message: 'Added to cart' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId } = req.body;

        const cart = await Cart.findOne({ userId });
        if (cart) {
            cart.items = cart.items.filter(p => p.productId && p.productId.toString() !== productId);
            await cart.save();
        }
        res.status(200).json({ success: true, message: 'Removed from cart' });
    } catch (error) {
         res.status(500).json({ success: false, message: error.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const { userId } = req.params;
        await Cart.findOneAndUpdate({ userId }, { items: [] });
        res.status(200).json({ success: true, message: 'Cart cleared' });
    } catch (error) {
         res.status(500).json({ success: false, message: error.message });
    }
};
