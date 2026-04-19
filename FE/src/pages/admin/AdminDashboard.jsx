import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { getDashboardStats } from '../../services/admin/dashboard.service.jsx';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getDashboardStats();
                if (response.success) setStats(response.data);
            } catch (error) {
                console.error('Dashboard Stats Error:', error);
                message.error('Không thể tải dữ liệu thống kê');
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="animate-in fade-in duration-500">
            {/* KPI Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {/* Metric Card 1 */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border-outline-variant/10 flex flex-col justify-between h-40 shadow-sm">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Doanh thu</span>
                        <span className="material-symbols-outlined text-primary">payments</span>
                    </div>
                    <div>
                        <h3 className="font-notoSerif text-3xl font-bold text-on-surface">
                            {isLoading ? '...' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
                        </h3>
                        <p className="text-xs text-primary mt-1 font-medium">Toàn hệ thống</p>
                    </div>
                </div>

                {/* Metric Card 2 */}
                <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between h-40 shadow-sm border border-outline-variant/10">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Đơn hàng</span>
                        <span className="material-symbols-outlined text-primary">inventory</span>
                    </div>
                    <div>
                        <h3 className="font-notoSerif text-3xl font-bold text-on-surface">{isLoading ? '...' : stats.totalOrders}</h3>
                        <p className="text-xs text-on-surface-variant mt-1 font-medium">Tổng số đơn</p>
                    </div>
                </div>

                {/* Metric Card 3 */}
                <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-col justify-between h-40 shadow-sm border border-outline-variant/10">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Sản phẩm kho</span>
                        <span className="material-symbols-outlined text-primary">checkroom</span>
                    </div>
                    <div>
                        <h3 className="font-notoSerif text-3xl font-bold text-on-surface">{isLoading ? '...' : stats.totalProducts}</h3>
                        <p className="text-xs text-primary mt-1 font-medium">Tổng lượng tồn kho</p>
                    </div>
                </div>

                {/* Metric Card 4: Users */}
                <div className="bg-primary text-on-primary p-6 rounded-xl flex flex-col justify-between h-40 shadow-sm">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold opacity-80 uppercase tracking-wider">Khách hàng</span>
                        <span className="material-symbols-outlined">group</span>
                    </div>
                    <div>
                        <h3 className="font-notoSerif text-3xl font-bold">{isLoading ? '...' : stats.totalUsers}</h3>
                        <p className="text-xs opacity-80 mt-1 font-medium">Người dùng đăng ký</p>
                    </div>
                </div>
            </div>

            {/* Charts & Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 bg-surface-container-low rounded-xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="font-notoSerif text-2xl font-semibold text-on-surface">Biểu đồ Doanh thu (Mô phỏng)</h2>
                            <p className="text-sm text-on-surface-variant">Thống kê theo tháng</p>
                        </div>
                    </div>
                    {/* Visualizing a Line Chart with SVG */}
                    <div className="relative h-64 w-full">
                        <svg className="w-full h-full" viewBox="0 0 1000 300">
                            {/* Horizontal Grid Lines */}
                            <line stroke="#c6c8b8" strokeDasharray="4" strokeWidth="0.5" x1="0" x2="1000" y1="50" y2="50"></line>
                            <line stroke="#c6c8b8" strokeDasharray="4" strokeWidth="0.5" x1="0" x2="1000" y1="150" y2="150"></line>
                            <line stroke="#c6c8b8" strokeDasharray="4" strokeWidth="0.5" x1="0" x2="1000" y1="250" y2="250"></line>
                            {/* Main Path */}
                            <path d="M0,250 C100,240 150,280 250,200 S400,50 500,100 S700,220 850,140 S1000,80 1000,80" fill="none" stroke="#4c6545" strokeLinecap="round" strokeWidth="4"></path>
                            {/* Area Fill */}
                            <path d="M0,250 C100,240 150,280 250,200 S400,50 500,100 S700,220 850,140 S1000,80 1000,80 V300 H0 Z" fill="url(#chartGradient)" opacity="0.1"></path>
                            <defs>
                                <linearGradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                                    <stop offset="0%" style={{stopColor: '#4c6545', stopOpacity: 1}}></stop>
                                    <stop offset="100%" style={{stopColor: '#4c6545', stopOpacity: 0}}></stop>
                                </linearGradient>
                            </defs>
                            {/* Points */}
                            <circle cx="250" cy="200" fill="#4c6545" r="5"></circle>
                            <circle cx="500" cy="100" fill="#4c6545" r="5"></circle>
                            <circle cx="850" cy="140" fill="#4c6545" r="5"></circle>
                        </svg>
                        <div className="flex justify-between mt-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-2">
                            <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
                        </div>
                    </div>
                </div>

                {/* Impact Snapshot Section mapped to the Sustainability widget */}
                <div className="bg-surface-container-low rounded-xl p-8 flex flex-col justify-center items-center text-center shadow-sm relative overflow-hidden">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-tertiary-container/20 text-tertiary rounded-full mb-6 relative z-10">
                        <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>eco</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Sustainability Milestone</span>
                    </div>
                    <h2 className="font-notoSerif text-3xl font-bold text-on-surface mb-4 leading-tight relative z-10">Circular <span className="italic text-primary">movement.</span></h2>
                    <p className="text-on-surface-variant text-sm mb-6 relative z-10">You have prevented {stats.totalProducts * 3.5 || 120}kg of textile waste from reaching landfills.</p>
                    
                    <div className="w-full space-y-2 relative z-10">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Progress</span>
                            <span className="font-notoSerif text-lg font-bold text-primary">82%</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[82%]"></div>
                        </div>
                    </div>
                    <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-primary/5 rounded-full blur-[80px]"></div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
