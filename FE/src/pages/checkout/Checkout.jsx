import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import AnimateWhenVisible from '../../helpers/animationScroll';
import CartItem from './CartItem';
import { getCartApi, removeFromCartApi } from '../../services/cart.service';
import { createPaymentUrlApi } from '../../services/payment.service';
import { createOrderApi, getOrdersApi } from '../../services/order.service';
import { getCookie } from '../../helpers/cookie';
import useScrollToTop from '../../hooks/useScrollToTop';
import Loading from '../../components/loading/loading';
import ProtectedRoute from '../../components/checkLogin/ProtectedRoute';

const Checkout = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formErrors, setFormErrors] = useState({});

    const userId = useSelector((state) => state.auth.userId);

    // Đọc thông tin user từ localStorage (được lưu khi đăng nhập)
    const storedName = localStorage.getItem('fullName') || '';
    const storedPhone = localStorage.getItem('phone') || '';

    const [form, setForm] = useState({
        buyerName: storedName,
        buyerPhone: storedPhone,
        shippingAddress: '',
    });

    const [previousAddresses, setPreviousAddresses] = useState([]);
    const [showAddressPicker, setShowAddressPicker] = useState(false);

    useEffect(() => {
        if (!userId) {
            setIsLoading(false);
            return;
        }
        fetchCart();
        fetchPreviousAddresses();
    }, [userId]);

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

    const fetchPreviousAddresses = async () => {
        try {
            const res = await getOrdersApi(userId);
            if (res && res.success && res.orders) {
                // Lọc ra các địa chỉ duy nhất từ lịch sử đơn hàng
                const addresses = [...new Set(
                    res.orders
                        .map(o => o.shippingAddress)
                        .filter(a => a && a !== 'Địa chỉ mặc định' && a.trim() !== '')
                )];
                setPreviousAddresses(addresses);
            }
        } catch (error) {
            console.error('Lỗi tải lịch sử địa chỉ', error);
        }
    };

    const handleRemove = async (productId) => {
        const pid = String(productId);
        try {
            const res = await removeFromCartApi(userId, pid);
            if (res && res.success) {
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
    };

    // Logic tính tổng tiền
    const subtotal = cartItems.reduce((acc, item) => {
        const product = item.productId || item;
        return acc + (product.price || 0) * (item.quantity || 1);
    }, 0);
    const shippingFee = 30000;
    const total = subtotal + shippingFee;

    const validateForm = () => {
        const errors = {};
        if (!form.shippingAddress || form.shippingAddress.trim() === '') {
            errors.shippingAddress = 'Vui lòng nhập địa chỉ nhận hàng để tiếp tục.';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            message.warning('Giỏ hàng của bạn đang trống.');
            return;
        }
        if (!validateForm()) {
            document.getElementById('address-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        try {
            // 1. Tạo order draft trên DB
            const orderRes = await createOrderApi({
                buyerId: userId,
                items: cartItems.map(i => {
                    const product = i.productId || i;
                    return {
                        productId: product._id || product,
                        quantity: i.quantity || 1,
                        priceAtSale: product.price || 0
                    };
                }),
                totalAmount: total,
                shippingAddress: form.shippingAddress.trim(),
                buyerName: form.buyerName.trim() || storedName || 'Khách hàng',
                buyerPhone: form.buyerPhone.trim() || storedPhone || '',
                paymentMethod: "vnpay"
            });

            // 2. Gọi VNPAY để lấy URL thanh toán
            if (orderRes.success && orderRes.order && orderRes.order._id) {
                const payRes = await createPaymentUrlApi({
                    amount: total,
                    orderInfo: `Thanh toan don hang ${orderRes.order._id}`,
                    orderId: orderRes.order._id
                });

                if (payRes.success && payRes.url) {
                    window.location.href = payRes.url;
                } else {
                    message.error('Lỗi tạo cổng thanh toán VNPAY (Vui lòng kiểm tra cấu hình hệ thống).');
                    navigate('/history');
                }
            }
        } catch (error) {
            console.error('Checkout error:', error);
            message.error('Quá trình checkout xảy ra lỗi. Vui lòng thử lại sau.');
        }
    };


    return (
        <ProtectedRoute>
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
                                {/* Họ tên - auto-fill từ tài khoản */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1 flex items-center gap-2">
                                        Họ và tên
                                        {storedName && (
                                            <span className="text-[10px] normal-case font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                Tự động từ tài khoản
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary/30 outline-none"
                                        placeholder="Nguyễn Văn A"
                                        type="text"
                                        value={form.buyerName}
                                        onChange={e => setForm(prev => ({ ...prev, buyerName: e.target.value }))}
                                    />
                                </div>

                                {/* Số điện thoại - auto-fill từ tài khoản */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1 flex items-center gap-2">
                                        Số điện thoại
                                        {storedPhone && (
                                            <span className="text-[10px] normal-case font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                Tự động từ tài khoản
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary/30 outline-none"
                                        placeholder="090 123 4567"
                                        type="tel"
                                        value={form.buyerPhone}
                                        onChange={e => setForm(prev => ({ ...prev, buyerPhone: e.target.value }))}
                                    />
                                </div>

                                {/* Địa chỉ - bắt buộc, có gợi ý địa chỉ cũ */}
                                <div className="md:col-span-2 space-y-2">
                                    <div className="flex items-center justify-between ml-1 mb-1">
                                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
                                            Địa chỉ nhận hàng
                                            <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        {previousAddresses.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowAddressPicker(prev => !prev)}
                                                className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline transition-all"
                                            >
                                                <span className="material-symbols-outlined text-sm">history</span>
                                                {showAddressPicker ? 'Ẩn địa chỉ cũ' : `Dùng địa chỉ cũ (${previousAddresses.length})`}
                                            </button>
                                        )}
                                    </div>

                                    {/* Dropdown gợi ý địa chỉ cũ */}
                                    {showAddressPicker && previousAddresses.length > 0 && (
                                        <div className="bg-surface-container-low rounded-xl border border-primary/20 overflow-hidden shadow-md mb-2">
                                            <p className="px-4 py-2.5 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant border-b border-outline-variant/20 bg-surface-container">
                                                📍 Địa chỉ đã dùng trong đơn hàng trước
                                            </p>
                                            {previousAddresses.map((addr, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => {
                                                        setForm(prev => ({ ...prev, shippingAddress: addr }));
                                                        setShowAddressPicker(false);
                                                        setFormErrors(prev => ({ ...prev, shippingAddress: '' }));
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-sm hover:bg-primary/5 flex items-start gap-3 border-b border-outline-variant/10 last:border-0 transition-colors group"
                                                >
                                                    <span className="material-symbols-outlined text-base text-primary mt-0.5 shrink-0">location_on</span>
                                                    <span className="text-on-surface group-hover:text-primary transition-colors">{addr}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <input
                                        id="address-input"
                                        className={`w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all ${formErrors.shippingAddress
                                            ? 'ring-2 ring-red-400 focus:ring-red-400'
                                            : 'focus:ring-primary/30'
                                            }`}
                                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                                        type="text"
                                        value={form.shippingAddress}
                                        onChange={e => {
                                            setForm(prev => ({ ...prev, shippingAddress: e.target.value }));
                                            if (e.target.value.trim()) {
                                                setFormErrors(prev => ({ ...prev, shippingAddress: '' }));
                                            }
                                        }}
                                    />
                                    {formErrors.shippingAddress && (
                                        <p className="text-red-500 text-xs font-medium flex items-center gap-1 ml-1 mt-1">
                                            <span className="material-symbols-outlined text-sm">error</span>
                                            {formErrors.shippingAddress}
                                        </p>
                                    )}
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

                                <button
                                    onClick={handleCheckout}
                                    disabled={cartItems.length === 0}
                                    className={`w-full mt-8 font-bold py-4 rounded-xl transition-all ${cartItems.length === 0
                                        ? 'bg-outline text-white opacity-50 cursor-not-allowed'
                                        : 'bg-primary text-on-primary hover:bg-primary-container active:scale-95'
                                        }`}
                                >
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
        </ProtectedRoute>
    );
};

export default Checkout;
