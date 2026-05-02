import React from 'react';

const CartItem = ({ item, formatPrice, onRemove, isChecked, onToggle }) => {
    const product = item.productId || item;

    // Lấy ảnh từ mảng images[] — cùng logic với Store, Wishlist
    const getImage = () => {
        if (product.images && product.images.length > 0) {
            const primary = product.images.find(img => img.isPrimary);
            if (primary && primary.imageUrl) return primary.imageUrl;
            return product.images[0].imageUrl;
        }
        return product.image || 'https://placehold.co/150x180?text=No+Image';
    };

    return (
        <div className="flex gap-4 group items-center">
            <input 
                type="checkbox" 
                checked={isChecked} 
                onChange={() => onToggle(product._id || product)}
                className="w-5 h-5 accent-primary cursor-pointer shrink-0 rounded border-outline-variant focus:ring-primary/30"
            />
            <div className="w-20 h-24 bg-surface-container-highest rounded-lg overflow-hidden flex-shrink-0 relative">
                <img
                    alt={product.title || product.name}
                    className="w-full h-full object-cover"
                    src={getImage()}
                    onError={(e) => { e.target.src = 'https://placehold.co/150x180?text=No+Image'; }}
                />
                <button 
                    onClick={() => onRemove(product._id)}
                    className="absolute inset-0 bg-error/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <span className="material-symbols-outlined text-white text-sm">delete</span>
                </button>
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm uppercase tracking-tight">{product.title || product.name}</h4>
                    <span className="font-bold text-sm">{formatPrice(product.price)}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                    {product.size && `Size: ${product.size}`} {product.color && `| Màu: ${product.color}`}
                </p>
                {product.condition && (
                    <div className="mt-2 text-primary text-[10px] font-bold uppercase tracking-widest">
                        {product.condition}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartItem;

