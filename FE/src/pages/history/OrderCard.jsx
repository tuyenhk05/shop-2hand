import React from 'react';

const OrderCard = ({ order, formatPrice }) => {
    // Determine status badge colors
    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'đã giao hàng':
                return 'bg-tertiary-fixed text-on-tertiary-fixed';
            case 'processing':
            case 'đang xử lý':
                return 'bg-surface-container-high text-on-surface-variant';
            case 'shipping':
            case 'đang vận chuyển':
                return 'bg-secondary-container text-on-secondary-container';
            default:
                return 'bg-surface-container text-on-surface-variant';
        }
    };

    // Calculate total CO2 optionally if backend provides it
    const co2Saved = order.co2Saved || 'N/A';

    return (
        <div className="bg-surface-container-lowest p-8 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-outline-variant/20 h-full flex flex-col">
            <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
                <div>
                    <span className="block text-[10px] tracking-[0.2em] uppercase font-bold text-outline mb-1">MÃ ĐƠN HÀNG</span>
                    <h3 className="font-notoSerif font-bold text-lg text-on-surface">#{order._id?.slice(-8).toUpperCase() || 'ATL-XXXX'}</h3>
                </div>
                <div className="text-right">
                    <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${getStatusStyle(order.status)}`}>
                        {order.status || 'Đang xử lý'}
                    </span>
                    <p className="text-xs text-on-surface-variant mt-2">
                        Ngày mua: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                </div>
            </div>

            {/* Render Items Summary */}
            <div className="space-y-4 mb-6 flex-grow">
                {order.items && order.items.map((item, idx) => {
                    const product = item.productId || {};
                    return (
                        <div key={idx} className="flex items-center gap-4 border-b border-surface-variant pb-4 last:border-0 last:pb-0">
                            <img 
                                className="w-16 h-20 object-cover rounded-md bg-surface-container shrink-0" 
                                src={product.image || 'https://placehold.co/100x120?text=No+Image'} 
                                alt={product.title} 
                            />
                            <div className="flex-1">
                                <h4 className="font-notoSerif text-sm text-on-surface font-bold line-clamp-1">{product.title || 'Sản phẩm ' + idx}</h4>
                                <p className="text-xs text-on-surface-variant mt-1">SL: {item.quantity}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-wrap justify-between items-end border-t border-outline-variant/10 pt-4 mt-auto">
                <div className="flex items-center gap-2 text-primary/70 mb-2 sm:mb-0">
                    {co2Saved !== 'N/A' && (
                        <>
                            <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>eco</span>
                            <span className="text-xs font-medium italic">SL CO2: -{co2Saved}kg</span>
                        </>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-xs text-outline font-bold uppercase tracking-widest mb-1">Tổng cộng</p>
                    <p className="font-notoSerif font-bold border-l border-b border-primary/20 text-xl text-primary pl-2">{formatPrice(order.totalPrice)}</p>
                </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
                <button className="text-primary text-xs font-bold hover:underline transition-all px-3 py-2">Hỗ trợ</button>
                <button className="bg-primary/10 text-primary px-5 py-2 rounded-lg text-xs font-bold active:scale-95 hover:bg-primary hover:text-white transition-all">Chi tiết</button>
            </div>
        </div>
    );
};

export default OrderCard;
