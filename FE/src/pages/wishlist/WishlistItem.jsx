import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

const WishlistItem = ({ item, formatPrice, onRemove, onAddToCart }) => {
    const navigate = useNavigate();
    const [removing, setRemoving] = useState(false);
    const [addingCart, setAddingCart] = useState(false);
    console.log(item);

    // API trả về Wishlist document, item.productId là sản phẩm đã populate
    const product = item.productId || item;

    // Lấy ảnh từ mảng images[] — cùng logic với trang Store
    const getImage = () => {
        if (product.images && product.images.length > 0) {
            const primary = product.images.find(img => img.isPrimary);
            if (primary && primary.imageUrl) return primary.imageUrl;
            console.log(product.images[0].imageUrl);
            return product.images[0].imageUrl;
        }
        return product.image || 'https://placehold.co/400x500?text=No+Image';
    };

    const handleRemove = async (e) => {
        e.stopPropagation();
        setRemoving(true);
        try {
            await onRemove(product._id);
        } finally {
            setRemoving(false);
        }
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        setAddingCart(true);
        try {
            await onAddToCart(product._id);
        } finally {
            setAddingCart(false);
        }
    };

    return (
        <div className="group relative flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">

            {/* Image area */}
            <div
                className="aspect-[4/5] overflow-hidden relative cursor-pointer"
                onClick={() => navigate(`/products/${product.slug || product._id}`)}
            >
                <img
                    alt={product.title || product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    src={getImage()}
                    onError={(e) => { e.target.src = 'https://placehold.co/400x500?text=No+Image'; }}
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Condition badge */}
                {product.condition && (
                    <div className="absolute top-4 left-4">
                        <span className="bg-tertiary-container/90 backdrop-blur text-on-tertiary-container text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                            {product.condition === 'like_new' ? 'Như mới' : product.condition === 'good' ? 'Tốt' : product.condition === 'new' ? 'Mới' : product.condition}
                        </span>
                    </div>
                )}

                {/* Wishlist toggle button */}
                <button
                    className={`absolute top-4 right-4 w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm transition-all duration-300 active:scale-90 ${removing
                        ? 'bg-surface-container-highest text-on-surface-variant opacity-60'
                        : 'bg-primary text-white hover:bg-white hover:text-error'
                        }`}
                    onClick={handleRemove}
                    title="Bỏ yêu thích"
                    disabled={removing}
                >
                    {removing ? (
                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    ) : (
                        <span
                            className="material-symbols-outlined text-[18px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >favorite</span>
                    )}
                </button>

                {/* Quick add to cart (hiện khi hover ảnh) */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <button
                        onClick={handleAddToCart}
                        disabled={addingCart}
                        className="flex items-center gap-2 bg-white/95 backdrop-blur text-primary text-xs font-bold px-5 py-2.5 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all active:scale-95 disabled:opacity-60"
                    >
                        {addingCart ? (
                            <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                        )}
                        {addingCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
                    </button>
                </div>
            </div>

            {/* Info area */}
            <div className="p-5 flex flex-col flex-grow">
                <div
                    className="cursor-pointer mb-3"
                    onClick={() => navigate(`/products/${product.slug || product._id}`)}
                >
                    <h3 className="font-notoSerif font-bold text-lg text-on-background line-clamp-1 hover:text-primary transition-colors">
                        {product.title || product.name}
                    </h3>
                    <p className="text-on-surface-variant text-xs mt-1 line-clamp-1">
                        {product.categoryId?.name || ''}{product.categoryId?.name && product.brandId?.name ? ' • ' : ''}{product.brandId?.name || ''}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-outline-variant/10">
                    <span className="text-lg font-bold font-manrope text-primary">
                        {formatPrice(product.price)}
                    </span>
                    <button
                        onClick={handleAddToCart}
                        disabled={addingCart}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-primary hover:text-white text-on-surface-variant transition-all active:scale-95 disabled:opacity-60"
                        title="Thêm vào giỏ hàng"
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {addingCart ? 'hourglass_empty' : 'add_shopping_cart'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WishlistItem;
