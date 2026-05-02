import React, { memo } from 'react';
import AnimateWhenVisible from '../helpers/animationScroll';

const conditionLabel = (c) => ({ new: 'Mới', like_new: 'Như mới', good: 'Tốt', fair: 'Khá', poor: 'Cũ' }[c] || c);

const getMainImageHelper = (product) => {
    if (product.images && product.images.length > 0) {
        const primary = product.images.find(img => img.isPrimary);
        if (primary && primary.imageUrl) return primary.imageUrl;
        return product.images[0].imageUrl;
    }
    return 'https://placehold.co/400x500?text=No+Image';
};

const formatPriceHelper = (price) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const ProductCard = memo(({ item, isLarge, wishlisted, onWishlist, onCart, onNavigate }) => {
    const isMuseumQuality = item.condition === 'like_new' || item.price > 1000000; // Updated condition threshold for 2hand shop
    
    return (
        <AnimateWhenVisible direction="fadeInUp" className="group cursor-pointer h-full">
            <div onClick={() => onNavigate(`/products/${item.slug || item._id}`)} className="h-full flex flex-col">
                {/* Ảnh */}
                <div className={`relative overflow-hidden rounded-2xl bg-surface-container-low flex-shrink-0 ${isLarge ? 'aspect-[4/3]' : 'aspect-[3/4]'}`}>
                    <img
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                        src={getMainImageHelper(item)}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500/eeeeee/aaaaaa?text=No+Image'; }}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Badge */}
                    {isMuseumQuality && (
                        <div className="absolute top-3.5 left-3.5">
                            <span className="bg-white/95 backdrop-blur-sm text-on-surface text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">✦ Chọn lọc</span>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="absolute top-3.5 right-3.5 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0">
                        <button
                            onClick={(e) => onWishlist(e, item._id || item.slug)}
                            className={`w-9 h-9 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all ${wishlisted ? 'bg-primary text-white' : 'bg-white/90 text-primary hover:bg-primary hover:text-white'}`}
                            title={wishlisted ? 'Bỏ yêu thích' : 'Yêu thích'}
                        >
                            <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: wishlisted ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                        </button>
                        <button
                            onClick={(e) => onCart(e, item._id || item.slug)}
                            className="w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-primary shadow-lg active:scale-90 transition-all hover:bg-primary hover:text-white"
                            title="Thêm vào giỏ"
                        >
                            <span className="material-symbols-outlined text-[17px]">add_shopping_cart</span>
                        </button>
                    </div>

                    {/* Giá nổi khi hover */}
                    <div className="absolute bottom-0 left-0 right-0 px-5 py-4 opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-1 group-hover:translate-y-0 pointer-events-none">
                        <span className="text-white font-manrope font-bold text-xl drop-shadow-lg">{formatPriceHelper(item.price)}</span>
                    </div>
                </div>

                {/* Info */}
                <div className="mt-4 px-0.5 flex-1">
                    <h3 className={`font-notoSerif font-bold text-on-surface leading-snug mb-1.5 line-clamp-2 ${isLarge ? 'text-xl md:text-2xl' : 'text-base md:text-xl'}`}>
                        {item.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-xs text-on-surface-variant">{item.categoryId?.name || 'Thời trang'}</span>
                        <span className="w-1 h-1 rounded-full bg-outline-variant/60 inline-block" />
                        <span className="text-xs text-on-surface-variant">{conditionLabel(item.condition)}</span>
                        {item.brandId?.name && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-outline-variant/60 inline-block" />
                                <span className="text-xs font-semibold text-primary">{item.brandId.name}</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-primary font-manrope font-bold text-lg">{formatPriceHelper(item.price)}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-xs text-on-surface-variant line-through">{formatPriceHelper(item.originalPrice)}</span>
                        )}
                    </div>
                </div>
            </div>
        </AnimateWhenVisible>
    );
});

export default ProductCard;
