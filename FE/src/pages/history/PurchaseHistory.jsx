import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useSelector } from 'react-redux';
import AnimateWhenVisible from '../../helpers/animationScroll';
import OrderCard from './OrderCard';
import { getOrdersApi } from '../../services/order.service';
import { getCookie } from '../../helpers/cookie';
import useScrollToTop from '../../hooks/useScrollToTop';
import Loading from '../../components/loading/loading';

const PurchaseHistory = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const location = useLocation();
    const [filter, setFilter] = useState(location.state?.filter || 'all'); // all, pending, completed

    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState([]);

    const totalCarbonSaved = React.useMemo(() => {
        return orders.reduce((total, order) => {
            if (order.status !== 'cancelled' && order.status !== 'returned') {
                const itemCount = order.items?.length || 1;
                return total + (itemCount * 1.5);
            }
            return total;
        }, 0);
    }, [orders]);

    const userId = useSelector((state) => state.auth.userId);

    useEffect(() => {
        if (!userId) {
            setIsLoading(false);
            return;
        }
        fetchOrders();
    }, [userId]);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const response = await getOrdersApi(userId);
            if (response && response.success) {
                setOrders(response.orders || []);
            }
        } catch (error) {
            console.error('Lỗi khi tải lịch sử đơn hàng', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price) => {
        return (price || 0).toLocaleString('vi-VN') + 'đ';
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'pending') return ['pending_payment', 'processing', 'shipped'].includes(order.status);
        if (filter === 'completed') return ['delivered', 'paid'].includes(order.status);
        return true;
    });

    return (
        <main className="pt-32 pb-20 max-w-7xl mx-auto px-6 font-manrope">
            {/* Hero Section */}
            <section className="mb-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                <AnimateWhenVisible direction="fade" className="md:col-span-7">
                    <h1 className="font-notoSerif text-5xl md:text-7xl font-black text-on-surface tracking-tight mb-6 leading-tight">
                        Lịch sử <span className="italic text-primary">sở hữu.</span>
                    </h1>
                    <p className="text-on-surface-variant max-w-lg text-lg font-light leading-relaxed">
                        Mỗi món đồ bạn chọn tại Atelier không chỉ là một giao dịch, mà là một bước đi hướng tới lối sống bền vững hơn. Cảm ơn bạn đã đồng hành cùng chúng tôi.
                    </p>
                </AnimateWhenVisible>

                <AnimateWhenVisible direction="slideFromRight" className="md:col-span-5 bg-primary-container/20 p-8 rounded-xl border border-primary/10 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>eco</span>
                            <span className="font-bold tracking-widest text-xs text-primary uppercase">Tác động Môi trường</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="font-notoSerif text-5xl font-black text-primary">{totalCarbonSaved.toFixed(1)}</span>
                            <span className="font-notoSerif text-xl text-primary/80">kg CO2</span>
                        </div>
                        <p className="text-on-primary-container text-sm mt-2 opacity-80">Tổng lượng phát thải đã giảm thiểu từ các đơn hàng của bạn.</p>
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                </AnimateWhenVisible>
            </section>

            {/* Order List Section */}
            <section className="space-y-12">
                <AnimateWhenVisible direction="fadeInUp" className="flex flex-wrap items-center justify-between gap-4 py-6 border-b border-outline-variant/30">
                    <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full sm:w-auto">
                        <button onClick={() => setFilter('all')} className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>Tất cả</button>
                        <button onClick={() => setFilter('pending')} className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'pending' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>Đang xử lý</button>
                        <button onClick={() => setFilter('completed')} className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'completed' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>Hoàn thành</button>
                    </div>
                </AnimateWhenVisible>

                {isLoading ? (
                    <Loading fullScreen={false} text="Đang tải đơn hàng..." />
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center p-10 bg-surface-container-low rounded-xl">Bạn không có đơn hàng nào trong mục này.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredOrders.map((order, idx) => (
                            <AnimateWhenVisible key={order._id || idx} direction="fadeInUp" transition={{ delay: idx * 0.1 }}>
                                <OrderCard order={order} formatPrice={formatPrice} />
                            </AnimateWhenVisible>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
};

export default PurchaseHistory;
