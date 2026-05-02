import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createConversationApi } from '../../services/client/support.service';
import { message } from 'antd';

const OrderCard = ({ order, formatPrice }) => {
    const navigate = useNavigate();
    const [isOpeningSupport, setIsOpeningSupport] = useState(false);

    // Dịch trạng thái từ DB sang tiếng Việt
    const translateStatus = (status) => {
        switch (status) {
            case 'pending_payment': return 'Chờ thanh toán';
            case 'paid': return 'Đã thanh toán';
            case 'processing': return 'Đang xử lý';
            case 'shipped': return 'Đang vận chuyển';
            case 'delivered': return 'Đã giao hàng';
            case 'cancelled': return 'Đã hủy';
            case 'returned': return 'Đã hoàn trả';
            default: return status || 'Đang xử lý';
        }
    };

    // Màu badge theo trạng thái (dùng Tailwind chuẩn)
    const getStatusStyle = (status) => {
        switch (status) {
            case 'delivered':       return 'bg-green-100 text-green-800';
            case 'paid':            return 'bg-blue-100 text-blue-800';
            case 'processing':      return 'bg-indigo-100 text-indigo-700';
            case 'shipped':         return 'bg-cyan-100 text-cyan-800';
            case 'cancelled':       return 'bg-red-100 text-red-700';
            case 'returned':        return 'bg-orange-100 text-orange-700';
            case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
            default:                return 'bg-gray-100 text-gray-600';
        }
    };

    const handleOpenSupport = async (e) => {
        e.stopPropagation(); // Ngăn sự kiện nổi bọt nếu sau này card có click
        if (!order) return;
        try {
            setIsOpeningSupport(true);
            const orderCode = order.orderCode || `#${order._id?.slice(-8).toUpperCase()}`;
            const res = await createConversationApi({
                orderId: order._id,
                orderCode,
                subject: `Hỗ trợ đơn hàng ${orderCode}`
            });
            if (res.success) {
                navigate(`/chat?conversationId=${res.data._id}`);
            }
        } catch {
            message.error('Không thể mở hội thoại hỗ trợ. Vui lòng thử lại.');
        } finally {
            setIsOpeningSupport(false);
        }
    };

    let itemCount = 0;
    if (order && order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
            itemCount += (item.quantity || 1);
        });
    }
    const co2Saved = itemCount * 14;

    return (
        <div className="bg-surface-container-lowest p-8 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-outline-variant/20 h-full flex flex-col">
            <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
                <div>
                    <span className="block text-[10px] tracking-[0.2em] uppercase font-bold text-outline mb-1">MÃ ĐƠN HÀNG</span>
                    <h3 className="font-notoSerif font-bold text-lg text-on-surface">{order.orderCode || `#${order._id?.slice(-8).toUpperCase() || 'ATL-XXXX'}`}</h3>
                </div>
                <div className="text-right">
                    <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${getStatusStyle(order.status)}`}>
                        {translateStatus(order.status)}
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
                    <p className="font-notoSerif font-bold border-l border-b border-primary/20 text-xl text-primary pl-2">{formatPrice(order.totalAmount)}</p>
                </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
                <button 
                    onClick={handleOpenSupport}
                    disabled={isOpeningSupport}
                    className="text-primary text-xs font-bold hover:underline transition-all px-3 py-2 flex items-center gap-1 disabled:opacity-50"
                >
                    {isOpeningSupport ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : null}
                    Hỗ trợ
                </button>
                <button onClick={() => navigate(`/history/${order._id}`)} className="bg-primary/10 text-primary px-5 py-2 rounded-lg text-xs font-bold active:scale-95 hover:bg-primary hover:text-white transition-all">Chi tiết</button>
            </div>
        </div>
    );
};

export default OrderCard;
