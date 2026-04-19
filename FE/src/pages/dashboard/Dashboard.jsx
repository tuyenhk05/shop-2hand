import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AnimateWhenVisible from '../../helpers/animationScroll';
import { getOrdersApi } from '../../services/order.service';
import { getConsignmentsApi } from '../../services/consignment.service';
import { getWishlistApi } from '../../services/wishlist.service';

import { getCookie } from '../../helpers/cookie';
import useScrollToTop from '../../hooks/useScrollToTop';
import ProtectedRoute from '../../components/checkLogin/ProtectedRoute';

const Dashboard = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('buyer');

    const [orders, setOrders] = useState([]);
    const [consignments, setConsignments] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);


    const userId = useSelector((state) => state.auth.userId);

    useEffect(() => {
        if (!userId) {
            setIsLoading(false);
            return;
        }

        const loadDashboardData = async () => {
            setIsLoading(true);
            try {
                const [ordersRes, consignmentsRes, wishlistRes] = await Promise.all([
                    getOrdersApi(userId),
                    getConsignmentsApi(userId),
                    getWishlistApi(userId)
                ]);

                if (ordersRes && ordersRes.success) {
                    setOrders(ordersRes.orders || []);
                }

                if (consignmentsRes && consignmentsRes.success) {
                    setConsignments(consignmentsRes.consignments || []);
                }

                if (wishlistRes && (wishlistRes.success || wishlistRes.data)) {
                    setWishlistItems(wishlistRes.wishlists || wishlistRes.data || []);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu Dashboard:", error);
            } finally {

                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, [userId]);

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

    const translateConsignmentStatus = (status) => {
        switch (status) {
            case 'pending': return 'Đang chờ xử lý';
            case 'approved': return 'Đã duyệt';
            case 'rejected': return 'Từ chối';
            case 'completed': return 'Đã hoàn thành';
            default: return status || 'Đang chờ xử lý';
        }
    };


    // --- XỬ LÝ LOGIC HIỂN THỊ DỮ LIỆU BẰNG USEMEMO (Tối ưu hiệu năng) ---
    const processingOrders = useMemo(() => {
        return orders.filter(o => ['pending_payment', 'processing', 'shipped'].includes(o.status));
    }, [orders]);

    const recentOrders = useMemo(() => {
        return [...orders].reverse().slice(0, 3);
    }, [orders]);

    const totalCarbonSaved = useMemo(() => {
        // Ước tính: Mỗi món đồ trong đơn hàng hợp lệ tiết kiệm được khoảng 1.5kg CO2
        return orders.reduce((total, order) => {
            if (order.status !== 'cancelled' && order.status !== 'returned') {
                const itemCount = order.items?.length || 1;
                return total + (itemCount * 1.5);
            }
            return total;
        }, 0);
    }, [orders]);

    const formatPrice = (price) => {
        return (price || 0).toLocaleString('vi-VN') + 'đ';
    };

    // --- HIỂN THỊ LOADING SKELETON / SPINNER ---
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <main className="pt-32 pb-32 px-6 md:px-12 max-w-7xl mx-auto font-manrope">
                <AnimateWhenVisible direction="fade" className="mb-14">
                    <h1 className="font-notoSerif text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-tight">Bảng điều khiển</h1>
                    <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed font-light">
                        Tổng quan được tuyển chọn của bạn về tiêu dùng có ý thức và quyền sở hữu vòng tròn. Quản lý các giao dịch mua của bạn và theo dõi hành trình của các món đồ đã ký gửi.
                    </p>
                </AnimateWhenVisible>

                {/* View Toggle */}
                <AnimateWhenVisible direction="fadeInUp" className="flex p-1.5 bg-surface-container-low w-fit rounded-xl mb-14">
                    <button
                        onClick={() => setActiveTab('buyer')}
                        className={`px-8 py-3 font-bold text-sm rounded-lg shadow-sm transition-all duration-300 flex items-center gap-2.5 ${activeTab === 'buyer' ? 'bg-surface-container-lowest text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">shopping_basket</span>
                        Trung tâm Người mua
                    </button>
                    <button
                        onClick={() => setActiveTab('consignor')}
                        className={`px-8 py-3 font-bold text-sm rounded-lg shadow-sm transition-all duration-300 flex items-center gap-2.5 ${activeTab === 'consignor' ? 'bg-surface-container-lowest text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">storefront</span>
                        Người ký gửi
                    </button>
                </AnimateWhenVisible>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-14">
                        {activeTab === 'buyer' ? (
                            <>
                                <AnimateWhenVisible direction="fadeInUp" className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                    {/* CARD: BÙ ĐẮP CARBON DYNAMIC */}
                                    <div className="bg-surface-container-lowest p-7 rounded-2xl flex flex-col justify-between min-h-[11rem] shadow-sm border border-outline-variant/10">
                                        <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.15em] mb-3">Bù đắp Carbon</span>
                                        {totalCarbonSaved > 0 ? (
                                            <div className="mt-auto">
                                                <span className="text-4xl font-notoSerif font-bold text-primary tracking-tight">
                                                    {totalCarbonSaved.toFixed(1)}kg
                                                </span>
                                                <p className="text-[11px] font-medium text-on-surface-variant mt-2 uppercase tracking-wide">
                                                    Đã tiết kiệm từ đơn hàng
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="mt-auto flex items-center h-full">
                                                <p className="text-xs text-on-surface-variant leading-relaxed">
                                                    Bạn có thể góp phần giảm thiểu khí nhà kính bằng cách mua sắm các sản phẩm thời trang tuần hoàn.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* CARD: ĐƠN HÀNG ĐANG XỬ LÝ DYNAMIC */}
                                    <div
                                        onClick={() => navigate('/history', { state: { filter: 'pending' } })}
                                        className="bg-primary p-7 rounded-2xl flex flex-col justify-between min-h-[11rem] text-white shadow-lg cursor-pointer hover:bg-primary/90 transition-all active:scale-[0.98]"
                                    >
                                        <span className="text-white/70 text-[10px] font-bold uppercase tracking-[0.15em] mb-3">Đơn hàng Đang xử lý</span>
                                        <div className="mt-auto">
                                            <span className="text-4xl font-notoSerif font-bold tracking-tight">
                                                {processingOrders.length < 10 ? `0${processingOrders.length}` : processingOrders.length}
                                            </span>
                                            <p className="text-[11px] font-medium text-white/70 mt-2 uppercase tracking-wide">
                                                {processingOrders.length > 0 ? 'Đang trên đường đến bạn' : 'Hiện không có đơn mới'}
                                            </p>
                                        </div>
                                    </div>


                                </AnimateWhenVisible>

                                <AnimateWhenVisible direction="fadeInUp">
                                    <div className="flex justify-between items-end mb-8">
                                        <h2 className="font-notoSerif text-3xl font-bold tracking-tight">Sản phẩm mới mua</h2>
                                        <button onClick={() => navigate('/history')} className="text-xs font-bold text-primary uppercase tracking-widest border-b-2 border-primary/20 hover:border-primary transition-all pb-1">Xem tất cả</button>
                                    </div>
                                    <div className="space-y-6">
                                        {recentOrders.length === 0 ? (
                                            <div className="py-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                                                <p className="text-on-surface-variant text-sm">Bạn chưa có lịch sử mua hàng nào.</p>
                                            </div>
                                        ) : (
                                            recentOrders.map(order => (
                                                <div key={order._id} className="bg-surface-container-lowest p-6 rounded-2xl flex items-center gap-7 group hover:shadow-xl transition-all duration-500 border border-outline-variant/10">
                                                    <div className="w-24 h-28 rounded-xl overflow-hidden bg-surface-container-high flex-shrink-0">
                                                        <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="order image" src={order.items?.[0]?.productId?.image || 'https://placehold.co/150x180?text=No+Image'} />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <div className="flex justify-between mb-1.5">
                                                            <h3 className="font-bold text-lg text-on-surface tracking-tight line-clamp-1">{order.items?.[0]?.productId?.title || 'Đơn hàng mới'}</h3>
                                                            <span className="text-primary font-extrabold text-lg shrink-0 pl-2">{formatPrice(order.totalAmount)}</span>
                                                        </div>
                                                        <p className="text-sm font-medium text-on-surface-variant/80 mb-4">Đơn hàng #{order._id?.slice(-6).toUpperCase()} • {translateStatus(order.status)}</p>
                                                        <div className="flex gap-2">
                                                            <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant text-[9px] uppercase font-extrabold tracking-wider rounded-md">Đã xác minh</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </AnimateWhenVisible>
                            </>
                        ) : (
                            <AnimateWhenVisible direction="fadeInUp" className="space-y-6">
                                <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10">
                                    <h3 className="font-notoSerif text-2xl font-bold mb-7">Nhật ký Ký gửi</h3>
                                    {consignments.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <p className="text-on-surface-variant text-sm py-4">Bạn chưa có yêu cầu ký gửi nào.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {consignments.map(item => (
                                                <div key={item._id} className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex -space-x-4">
                                                            {item.photos?.slice(0, 2).map((img, idx) => (
                                                                <img key={idx} src={img} className="w-12 h-12 object-cover rounded-full border-2 border-white shadow-sm" alt="consignment item" />
                                                            ))}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-on-surface">{item.title || 'Yêu cầu ký gửi'}</p>
                                                            <p className="text-xs text-on-surface-variant mt-1">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${item.status === 'pending' ? 'bg-surface-container-high text-on-surface' : (item.status === 'rejected' ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed text-on-primary-fixed')}`}>{translateConsignmentStatus(item.status)}</span>
                                                        <p className="text-xs text-primary font-bold mt-2">{formatPrice(item.expectedPrice)}</p>
                                                    </div>
                                                </div>
                                            ))}

                                        </div>
                                    )}
                                </div>
                            </AnimateWhenVisible>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-4 space-y-10">
                        <AnimateWhenVisible direction="fadeInUp" className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10">
                            <h3 className="font-notoSerif text-2xl font-bold mb-7 tracking-tight">Doanh thu Ký gửi</h3>
                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-3">
                                        <span>Tổng doanh thu</span>
                                        <span className="text-primary font-extrabold text-sm border-b border-primary/20">{formatPrice(consignments.filter(c => c.status === 'Đã hoàn thành').reduce((a, b) => a + b.expectedPrice, 0))}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-surface-variant/50 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full w-[35%]"></div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-8 border-t border-outline-variant/20">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-2">Số dư Sẵn sàng thanh toán</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-notoSerif font-bold text-on-background tracking-tight">{formatPrice(consignments.filter(c => c.status === 'Đã hoàn thành').reduce((a, b) => a + b.expectedPrice, 0))}</span>
                                        <button onClick={() => navigate('/consignment')} className="px-4 py-2 bg-primary text-white text-[11px] font-bold uppercase tracking-widest rounded-lg hover:shadow-lg transition-all active:scale-95">KÝ GỬI THÊM</button>
                                    </div>
                                </div>
                            </div>
                        </AnimateWhenVisible>

                        <AnimateWhenVisible direction="fadeInUp" className="bg-surface-container-lowest p-7 rounded-3xl border border-outline-variant/10">
                            <h3 className="font-notoSerif text-xl font-bold mb-5 tracking-tight">Khám phá mới</h3>

                            {wishlistItems.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        {wishlistItems.slice(0, 4).map((item, idx) => {
                                            const product = item.productId || {};
                                            return (
                                                <div 
                                                    key={idx} 
                                                    onClick={() => navigate(`/products/${product.slug || product._id}`)}
                                                    className="group relative aspect-square rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/5 cursor-pointer"
                                                >
                                                    <img
                                                        src={
                                                            product.images?.find(img => img.isPrimary)?.imageUrl || 
                                                            product.images?.[0]?.imageUrl || 
                                                            'https://placehold.co/150'
                                                        }
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        alt={product.title}
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-white text-sm">visibility</span>
                                                    </div>
                                                </div>
                                            );

                                        })}
                                    </div>
                                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                                        Bạn có <strong>{wishlistItems.length}</strong> sản phẩm trong danh sách yêu thích. Hãy quay lại để hoàn tất lựa chọn của mình.
                                    </p>
                                </div>
                            ) : (
                                <div className="py-6 mb-4">
                                    <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-primary/40 text-xl">favorite</span>
                                    </div>
                                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                                        Danh sách yêu thích của bạn hiện đang trống. Hãy khám phá những bộ sưu tập mới nhất để tìm thấy món đồ ưng ý.
                                    </p>
                                </div>
                            )}

                            <button onClick={() => navigate('/wishlist')} className="w-full py-3.5 border border-primary/20 text-primary font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-primary/5 transition-all active:scale-[0.98]">
                                {wishlistItems.length > 0 ? 'ĐI ĐẾN DANH SÁCH YÊU THÍCH' : 'KHÁM PHÁ NGAY'}
                            </button>
                        </AnimateWhenVisible>

                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
};

export default Dashboard;