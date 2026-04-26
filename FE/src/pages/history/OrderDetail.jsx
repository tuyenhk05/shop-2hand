import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderByIdApi } from '../../services/order.service';
import { createPaymentUrlApi } from '../../services/payment.service';
import AnimateWhenVisible from '../../helpers/animationScroll';
import Loading from '../../components/loading/loading';
import useScrollToTop from '../../hooks/useScrollToTop';
import { message } from 'antd';

const OrderDetail = () => {
    useScrollToTop();
    const { orderId } = useParams();
    const navigate = useNavigate();
    
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                setIsLoading(true);
                const response = await getOrderByIdApi(orderId);
                if (response && response.success) {
                    setOrder(response.order);
                }
            } catch (error) {
                console.error('Lỗi tải chi tiết đơn hàng:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrderDetail();
    }, [orderId]);

    // Timer logic for pending_payment
    useEffect(() => {
        if (!order || order.status !== 'pending_payment') {
            setTimeLeft(null);
            return;
        }

        const calculateTimeLeft = () => {
            const createdAt = new Date(order.createdAt).getTime();
            const expirationTime = createdAt + 10 * 60 * 1000;
            const now = new Date().getTime();
            const difference = expirationTime - now;

            if (difference <= 0) {
                setTimeLeft(0);
                // Refresh order status if expired
                setOrder(prev => ({ ...prev, status: 'cancelled' }));
                return;
            }

            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [order]);

    const handlePayment = async () => {
        try {
            setIsProcessingPayment(true);
            const response = await createPaymentUrlApi({
                amount: order.totalAmount,
                orderInfo: `Thanh toan don hang ${order._id}`,
                orderId: order._id
            });

            if (response.success && response.url) {
                window.location.href = response.url;
            } else {
                message.error('Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Lỗi thanh toán:', error);
            message.error('Đã xảy ra lỗi khi kết nối với cổng thanh toán.');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const formatPrice = (price) => {
        return (price || 0).toLocaleString('vi-VN') + 'đ';
    };

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

    if (isLoading) return <Loading fullScreen={false} text="Đang tải chi tiết đơn hàng..." />;
    if (!order) return <div className="pt-32 pb-20 text-center font-bold text-lg">Không tìm thấy đơn hàng.</div>;

    const co2Saved = order.co2Saved || '12.5'; // hardcode fallback like standard page

    return (
        <main className="pt-32 pb-20 max-w-5xl mx-auto px-6 font-manrope">
            {/* Header & Back Button */}
            <AnimateWhenVisible direction="fade">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-bold text-sm mb-8 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    QUAY LẠI LỊCH SỬ
                </button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-outline-variant/30">
                    <div>
                        <h2 className="font-notoSerif text-3xl font-bold tracking-tight mb-1">Chi tiết Đơn hàng</h2>
                        <p className="text-on-surface-variant font-medium">{order.orderCode || `#${order._id?.slice(-8).toUpperCase()}`} • Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>
            </AnimateWhenVisible>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Left Column: Items */}
                <div className="md:col-span-2 space-y-8">
                    <AnimateWhenVisible direction="fadeInUp">
                        <h2 className="font-bold text-xl mb-4">Sản phẩm</h2>
                        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20 shadow-sm space-y-6">
                            {order.items && order.items.map((item, idx) => {
                                const product = item.productId || {};
                                return (
                                    <div key={idx} className="flex gap-6 border-b border-outline-variant/10 pb-6 last:border-0 last:pb-0">
                                        <div className="w-24 h-32 bg-surface-container rounded-lg overflow-hidden flex-shrink-0">
                                            <img 
                                                src={product.image || 'https://placehold.co/200x250?text=No+Image'} 
                                                alt={product.title} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-notoSerif font-bold text-lg text-on-surface mb-1">{product.title || 'Sản phẩm không xác định'}</h3>
                                                <p className="text-sm text-on-surface-variant">Số lượng: {item.quantity}</p>
                                            </div>
                                            <div className="font-bold text-primary text-lg">
                                                {formatPrice(product.price)}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </AnimateWhenVisible>

                    {co2Saved !== 'N/A' && (
                        <AnimateWhenVisible direction="fadeInUp" className="bg-primary-container/20 p-6 rounded-2xl border border-primary/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>eco</span>
                                <div>
                                    <h4 className="font-bold text-sm text-primary uppercase">Mức độ Giảm phát thải</h4>
                                    <p className="text-xs mt-1 text-on-surface-variant">Giảm CO2 thông qua việc mua sắm bền vững.</p>
                                </div>
                            </div>
                            <div className="text-primary font-black font-notoSerif text-3xl">-{co2Saved}kg</div>
                        </AnimateWhenVisible>
                    )}
                </div>

                {/* Right Column: Summaries */}
                <div className="md:col-span-1 space-y-8">
                    <AnimateWhenVisible direction="fadeInUp">
                        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
                            <h2 className="font-bold text-lg mb-6 tracking-tight">Tóm tắt thanh toán</h2>
                            <div className="space-y-4 text-sm font-medium border-b border-outline-variant/20 pb-6 mb-6">
                                <div className="flex justify-between text-on-surface-variant">
                                    <span>Tổng phụ</span>
                                    <span>{formatPrice(order.totalAmount - 30000)}</span>
                                </div>
                                <div className="flex justify-between text-on-surface-variant">
                                    <span>Vận chuyển tiêu chuẩn</span>
                                    <span>30.000đ</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-end mb-6">
                                <span className="font-bold uppercase text-xs tracking-widest text-on-surface">Tổng cộng</span>
                                <span className="font-notoSerif font-black text-2xl text-primary">{formatPrice(order.totalAmount)}</span>
                            </div>
                            
                            <div className="w-full bg-primary/10 text-primary py-3 px-4 rounded-xl flex items-center justify-between text-sm font-bold">
                                <span>{order.paymentMethod === 'vnpay' ? 'Thanh toán VNPay' : 'Thanh toán khi nhận hàng'}</span>
                                <span className="material-symbols-outlined text-sm">{order.paymentMethod === 'vnpay' ? 'credit_card' : 'local_shipping'}</span>
                            </div>

                            {order.status === 'pending_payment' && order.paymentMethod === 'vnpay' && (
                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant uppercase tracking-widest border-t border-outline-variant/10 pt-4">
                                        <span>Hết hạn sau</span>
                                        <span className={`font-mono text-lg ${timeLeft === '00:00' || !timeLeft ? 'text-red-500' : 'text-primary'}`}>
                                            {timeLeft || '--:--'}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={handlePayment}
                                        disabled={isProcessingPayment || timeLeft === '00:00'}
                                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                            isProcessingPayment || timeLeft === '00:00'
                                            ? 'bg-outline-variant text-on-surface-variant cursor-not-allowed'
                                            : 'bg-primary text-white hover:bg-primary-container shadow-lg shadow-primary/20'
                                        }`}
                                    >
                                        {isProcessingPayment ? (
                                            <span className="material-symbols-outlined animate-spin">sync</span>
                                        ) : (
                                            <span className="material-symbols-outlined">payments</span>
                                        )}
                                        THANH TOÁN NGAY
                                    </button>
                                </div>
                            )}
                        </div>
                    </AnimateWhenVisible>

                    <AnimateWhenVisible direction="fadeInUp">
                        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
                            <h2 className="font-bold text-lg mb-4 tracking-tight">Giao hàng tới</h2>
                            <div className="text-sm text-on-surface-variant leading-relaxed mb-6 bg-surface-container-low p-4 rounded-xl">
                                <strong className="text-on-surface block mb-1">{order.buyerName || 'Người mua'}</strong>
                                {order.buyerPhone && <span className="block">{order.buyerPhone}</span>}
                                {order.shippingAddress || 'Không có địa chỉ giao hàng cụ thể'}
                            </div>

                            <h2 className="font-bold text-lg mb-4 tracking-tight mt-6">Trạng thái đơn</h2>
                            <div className="flex items-center gap-3 bg-surface-container p-4 rounded-xl">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                                    <span className="material-symbols-outlined text-sm">{order.status === 'Đang xử lý' ? 'pending_actions' : 'check_circle'}</span>
                                </div>
                                <span className="font-bold text-sm tracking-wide text-on-surface flex-1">{translateStatus(order.status)}</span>
                            </div>
                        </div>
                    </AnimateWhenVisible>
                </div>
            </div>
        </main>
    );
};

export default OrderDetail;
