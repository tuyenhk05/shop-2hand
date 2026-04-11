import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import AnimateWhenVisible from '../../helpers/animationScroll';
import CartItem from './CartItem';
import { getCartApi, removeFromCartApi } from '../../services/cart.service';
import { createPaymentUrlApi } from '../../services/payment.service';
import { createOrderApi } from '../../services/order.service';
import { getCookie } from '../../helpers/cookie';
import useScrollToTop from '../../hooks/useScrollToTop';
import Loading from '../../components/loading/loading';

const Checkout = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const userId = getCookie('userId') || localStorage.getItem('userId') || '66bb1f9d506a73c1d51ab4cd';

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setIsLoading(true);
            const response = await getCartApi(userId);
            if (response && response.success) {
                setCartItems(response.cart || []);
            }
        } catch (error) {
            console.error('Lỗi khi tải giỏ hàng', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        const pid = String(productId);
        try {
            const res = await removeFromCartApi(userId, pid);
            if (res && res.success) {
                // Cập nhật state ngay không cần fetch lại
                setCartItems(prev => prev.filter(item => {
                    const itemPid = String(item.productId?._id || item.productId || '');
                    return itemPid !== pid;
                }));
                message.success('Xóa sản phẩm khỏi giỏ hàng thành công!');
            } else {
                message.error('Không thể xóa. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Lỗi xóa sản phẩm khỏi giỏ', error);
            message.error('Đã xảy ra lỗi. Vui lòng thử lại!');
        }
    };

    const formatPrice = (price) => {
        return (price || 0).toLocaleString('vi-VN') + 'đ';
    }

    // Logic tính tổng tiền
    const subtotal = cartItems.reduce((acc, item) => {
        const product = item.productId || item;
        return acc + (product.price || 0) * (item.quantity || 1);
    }, 0);
    const shippingFee = 30000;
    const total = subtotal + shippingFee;

    const handleCheckout = async () => {
        if (cartItems.length === 0) return alert('Giỏ hàng trống');
        
        try {
            // 1. Tạo order draft trên DB
            const orderRes = await createOrderApi({
                buyerId: userId,
                items: cartItems.map(i => ({ productId: i.productId._id, quantity: i.quantity })),
                totalPrice: total,
                shippingAddress: "Địa chỉ mặc định",
                paymentMethod: "VNPAY"
            });

            // 2. Gọi VNPAY để lấy URL thanh toán
            if (orderRes.success && orderRes.orderId) {
                const payRes = await createPaymentUrlApi({
                    amount: total,
                    orderInfo: `Thanh toan don hang ${orderRes.orderId}`,
                    // Truyền thêm param cần thiết cho payment controller nếu có
                });

                if (payRes.success && payRes.url) {
                    window.location.href = payRes.url; // Chuyển hướng sang VNPAY
                } else {
                    alert('Lỗi tạo cổng thanh toán VNPAY (Vui lòng config ENV ở BE)');
                    navigate('/history');
                }
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Quá trình checkout xảy ra lỗi');
        }
    };

    return (
        <main className="max-w-7xl mx-auto px-6 pt-28 pb-20 font-manrope">
            <AnimateWhenVisible direction="fade" className="mb-12">
                <h1 className="font-notoSerif font-black text-4xl tracking-tight mb-2">Thanh toán</h1>
                <p className="text-on-surface-variant text-sm tracking-wide">Hoàn tất đơn hàng của bạn và đóng góp vào tương lai bền vững.</p>
            </AnimateWhenVisible>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Checkout Forms */}
                <div className="lg:col-span-7 space-y-12">
                    <AnimateWhenVisible direction="fadeInUp">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-primary">local_shipping</span>
                            <h2 className="font-notoSerif font-bold text-xl">Thông tin giao hàng</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Họ và tên</label>
                                <input className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary/30 outline-none" placeholder="Nguyễn Văn A" type="text" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Số điện thoại</label>
                                <input className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary/30 outline-none" placeholder="090 123 4567" type="tel" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Địa chỉ nhận hàng</label>
                                <input className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary/30 outline-none" placeholder="Số nhà, tên đường, phường/xã..." type="text" />
                            </div>
                        </div>
                    </AnimateWhenVisible>

                    <AnimateWhenVisible direction="fadeInUp">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                            <h2 className="font-notoSerif font-bold text-xl">Phương thức thanh toán</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 mb-6">
                            <button className="flex items-center justify-between p-6 bg-surface-container-lowest border-2 border-primary rounded-xl overflow-hidden hover:bg-surface-container transition-all">
                                <div className="flex items-center justify-center gap-4">
                                    <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
                                    <div className="flex flex-col text-left">
                                        <span className="font-bold text-base uppercase tracking-widest">Ví VNPAY / Thẻ Ngân hàng</span>
                                        <span className="text-xs font-medium text-on-surface-variant">Thanh toán bảo mật 100% qua VnPay Sandbox</span>
                                    </div>
                                </div>
                                <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418189687.png" alt="VNPay" className="h-8 object-contain" />
                            </button>
                        </div>
                    </AnimateWhenVisible>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-5 relative">
                    <AnimateWhenVisible direction="slideFromRight" className="sticky top-32 space-y-6">
                        <div className="bg-surface-container-low rounded-2xl p-8">
                            <h3 className="font-notoSerif font-bold text-xl mb-6">Tóm tắt đơn hàng</h3>
                            
                            {isLoading ? (
                                <Loading fullScreen={false} text="Đang tải giỏ hàng..." />
                            ) : cartItems.length === 0 ? (
                                <div className="text-center p-4 text-on-surface-variant text-sm">Giỏ hàng trống</div>
                            ) : (
                                <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2">
                                    {cartItems.map((item, idx) => (
                                        <CartItem key={idx} item={item} formatPrice={formatPrice} onRemove={handleRemove} />
                                    ))}
                                </div>
                            )}
                            
                            <div className="space-y-3 pt-6 border-t border-outline-variant/20">
                                <div className="flex justify-between text-sm text-on-surface-variant">
                                    <span>Tạm tính</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-on-surface-variant">
                                    <span>Phí vận chuyển</span>
                                    <span>{formatPrice(shippingFee)}</span>
                                </div>
                                <div className="flex justify-between font-notoSerif font-bold text-lg pt-2">
                                    <span>Tổng cộng</span>
                                    <span className="text-primary">{formatPrice(total)}</span>
                                </div>
                            </div>

                            <button onClick={handleCheckout} disabled={cartItems.length === 0} className={`w-full mt-8 font-bold py-4 rounded-xl transition-all ${cartItems.length === 0 ? 'bg-outline text-white opacity-50 cursor-not-allowed' : 'bg-primary text-on-primary hover:bg-primary-container active:scale-95'}`}>
                                Xác nhận thanh toán & Pay
                            </button>
                        </div>

                        <div className="bg-tertiary-container/10 border border-tertiary-container/20 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full"></div>
                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <span className="material-symbols-outlined text-primary">eco</span>
                                <h4 className="font-notoSerif font-bold text-sm uppercase tracking-widest">Tác động môi trường</h4>
                            </div>
                            <p className="text-xs text-on-surface-variant leading-relaxed relative z-10">
                                Bằng cách chọn mua đồ cũ cao cấp, bạn đã trực tiếp giúp giảm thiểu lượng rác thải. Lựa chọn xanh, tương lai khỏe vững!
                            </p>
                        </div>
                    </AnimateWhenVisible>
                </div>
            </div>
        </main>
    );
};

export default Checkout;
