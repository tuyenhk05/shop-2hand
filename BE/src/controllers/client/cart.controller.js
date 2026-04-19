const Cart = require('../../models/carts.model');
const Product = require('../../models/products.model');
const ProductImage = require('../../models/productImages.model');

exports.getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        let cart = await Cart.findOne({ userId }).populate('items.productId').lean();
        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
            return res.status(200).json({ success: true, cart: [] });
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

        res.status(200).json({ success: true, cart: itemsWithImages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId, quantity = 1 } = req.body;
        
        // Kiểm tra trạng thái sản phẩm trước khi thêm
        const product = await Product.findById(productId);
        if (!product || product.status !== 'active') {
            return res.status(400).json({ 
                success: false, 
                message: product?.status === 'sold' ? 'Sản phẩm này đã bán' : 'Sản phẩm hiện không khả dụng' 
            });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) cart = new Cart({ userId, items: [] });

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
