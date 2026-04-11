import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimateWhenVisible from '../../helpers/animationScroll';
import { getOrdersApi } from '../../services/order.service';
import { getConsignmentsApi } from '../../services/consignment.service';
import { getCookie } from '../../helpers/cookie';
import useScrollToTop from '../../hooks/useScrollToTop';

const Dashboard = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('buyer');

    const [orders, setOrders] = useState([]);
    const [consignments, setConsignments] = useState([]);
    const userId = getCookie('userId') || localStorage.getItem('userId') || '66bb1f9d506a73c1d51ab4cd';

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [ordersRes, consignmentsRes] = await Promise.all([
                    getOrdersApi(userId),
                    getConsignmentsApi(userId)
                ]);
                
                if (ordersRes && ordersRes.success) {
                    setOrders(ordersRes.orders || []);
                }
                
                if (consignmentsRes && consignmentsRes.success) {
                    setConsignments(consignmentsRes.consignments || []);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu Dashboard:", error);
            }
        };

        loadDashboardData();
    }, [userId]);

    const processingOrders = orders.filter(o => o.status === 'Đang xử lý');
    const recentOrders = [...orders].reverse().slice(0, 3); // Lấy 3 order mới nhất

    const formatPrice = (price) => {
        return (price || 0).toLocaleString('vi-VN') + 'đ';
    };

    return (
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
                                <div className="bg-surface-container-lowest p-7 rounded-2xl flex flex-col justify-between h-44 shadow-sm border border-outline-variant/10">
                                    <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.15em]">Bù đắp Carbon</span>
                                    <div className="mt-4">
                                        <span className="text-4xl font-notoSerif font-bold text-primary tracking-tight">2.4kg</span>
                                        <p className="text-[11px] font-medium text-on-surface-variant mt-2 uppercase tracking-wide">Tiết kiệm tháng này</p>
                                    </div>
                                </div>
                                <div className="bg-primary p-7 rounded-2xl flex flex-col justify-between h-44 text-white shadow-lg">
                                    <span className="text-white/70 text-[10px] font-bold uppercase tracking-[0.15em]">Đơn hàng Đang xử lý</span>
                                    <div className="mt-4">
                                        <span className="text-4xl font-notoSerif font-bold tracking-tight">{processingOrders.length < 10 ? `0${processingOrders.length}` : processingOrders.length}</span>
                                        <p className="text-[11px] font-medium text-white/70 mt-2 uppercase tracking-wide">Đang chờ hệ thống</p>
                                    </div>
                                </div>
                                <div className="bg-tertiary-container p-7 rounded-2xl flex flex-col justify-between h-44 text-on-tertiary-container">
                                    <span className="text-on-tertiary-container/70 text-[10px] font-bold uppercase tracking-[0.15em]">Đánh giá Tin cậy</span>
                                    <div className="mt-4">
                                        <div className="flex items-center gap-0.5 mb-2">
                                            {[...Array(4)].map((_, i) => <span key={i} className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>)}
                                            <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star_half</span>
                                        </div>
                                        <span className="text-2xl font-notoSerif font-bold">Hạng Vàng</span>
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
                                        <p className="text-on-surface-variant text-sm">Chưa có đơn hàng nào.</p>
                                    ) : (
                                        recentOrders.map(order => (
                                            <div key={order._id} className="bg-surface-container-lowest p-6 rounded-2xl flex items-center gap-7 group hover:shadow-xl transition-all duration-500 border border-outline-variant/10">
                                                <div className="w-24 h-28 rounded-xl overflow-hidden bg-surface-container-high flex-shrink-0">
                                                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="order image" src={order.items?.[0]?.productId?.image || 'https://placehold.co/150x180?text=No+Image'} />
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex justify-between mb-1.5">
                                                        <h3 className="font-bold text-lg text-on-surface tracking-tight line-clamp-1">{order.items?.[0]?.productId?.title || 'Đơn hàng mới'}</h3>
                                                        <span className="text-primary font-extrabold text-lg shrink-0 pl-2">{formatPrice(order.totalPrice)}</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-on-surface-variant/80 mb-4">Đơn hàng #{order._id?.slice(-6).toUpperCase()} • {order.status}</p>
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
                                    <p className="text-on-surface-variant text-sm py-4">Bạn chưa có yêu cầu ký gửi nào.</p>
                                ) : (
                                    <div className="space-y-6">
                                        {consignments.map(item => (
                                            <div key={item._id} className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex -space-x-4">
                                                        {item.images?.slice(0, 2).map((img, idx) => (
                                                             <img key={idx} src={img} className="w-12 h-12 object-cover rounded-full border-2 border-white shadow-sm" />
                                                        ))}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-on-surface">{item.productName || 'Yêu cầu ký gửi'}</p>
                                                        <p className="text-xs text-on-surface-variant mt-1">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${item.status === 'Đang chờ xử lý' ? 'bg-surface-container-high text-on-surface' : (item.status === 'Từ chối' ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed text-on-primary-fixed')}`}>{item.status}</span>
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
                                <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/10">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-2">Số dư Sẵn sàng thanh toán</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-notoSerif font-bold text-on-background tracking-tight">0đ</span>
                                        <button onClick={() => navigate('/consignment')} className="px-4 py-2 bg-primary text-white text-[11px] font-bold uppercase tracking-widest rounded-lg hover:shadow-lg transition-all active:scale-95">KÝ GỬI THÊM</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AnimateWhenVisible>

                    {/* Favorites/Watchlist Quick Access */}
                    <AnimateWhenVisible direction="fadeInUp" className="bg-surface-container-lowest p-7 rounded-3xl border border-outline-variant/10">
                        <h3 className="font-notoSerif text-xl font-bold mb-5 tracking-tight">Khám phá mới</h3>
                        <button onClick={() => navigate('/wishlist')} className="w-full mt-7 py-3.5 border border-primary/20 text-primary font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-primary/5 transition-all">
                            Đi đến Danh sách mong muốn
                        </button>
                    </AnimateWhenVisible>
                </div>
            </div>
        </main>
    );
};

export default Dashboard;
