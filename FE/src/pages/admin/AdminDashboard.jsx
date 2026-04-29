import React, { useEffect, useState } from 'react';
import { message, Table, Tag } from 'antd';
import { getDashboardStats } from '../../services/admin/dashboard.service.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

    // Cấu hình dữ liệu cho Recharts
    const COLORS = ['#4c6545', '#8ea582', '#b2c8a5', '#d4e1cc', '#e57373', '#ffb74d'];
    const statusLabels = {
        pending_payment: 'Chờ thanh toán',
        paid: 'Đã thanh toán',
        processing: 'Đang xử lý',
        shipped: 'Đang giao',
        delivered: 'Đã giao',
        cancelled: 'Đã hủy',
        returned: 'Hoàn trả'
    };

    const pieData = stats.orderStatusCounts ? Object.keys(stats.orderStatusCounts).map(key => ({
        name: statusLabels[key] || key,
        value: stats.orderStatusCounts[key]
    })) : [];

    const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    const recentOrderColumns = [
        { title: 'Mã đơn', dataIndex: 'orderCode', render: (val, r) => val || r._id.slice(-6).toUpperCase() },
        { title: 'Khách hàng', dataIndex: 'buyerName' },
        { title: 'Tổng tiền', dataIndex: 'totalAmount', render: formatVND },
        { title: 'Ngày tạo', dataIndex: 'createdAt', render: (val) => new Date(val).toLocaleDateString('vi-VN') }
    ];

    return (
        <div className="animate-in fade-in duration-500">
            {/* KPI Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {/* Metric Card 1 */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border-outline-variant/10 flex flex-col justify-between h-40 shadow-sm">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Doanh thu tháng này</span>
                        <span className="material-symbols-outlined text-primary">payments</span>
                    </div>
                    <div>
                        <h3 className="font-notoSerif text-3xl font-bold text-on-surface">
                            {isLoading ? '...' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
                        </h3>
                        <p className="text-xs text-primary mt-1 font-medium">Tháng này</p>
                    </div>
                </div>

                {/* Metric Card 2 */}
                <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between h-40 shadow-sm border border-outline-variant/10">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Đơn hàng tháng này</span>
                        <span className="material-symbols-outlined text-primary">inventory</span>
                    </div>
                    <div>
                        <h3 className="font-notoSerif text-3xl font-bold text-on-surface">{isLoading ? '...' : stats.totalOrders}</h3>
                        <p className="text-xs text-on-surface-variant mt-1 font-medium">Số đơn tháng này</p>
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
                <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="font-notoSerif text-xl font-semibold text-on-surface">Biểu đồ Doanh thu (Năm nay)</h2>
                            <p className="text-sm text-on-surface-variant">Doanh thu thực tế theo từng tháng</p>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.monthlyRevenue || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} tickFormatter={(value) => `${value / 1000000}M`} />
                                <Tooltip formatter={(value) => formatVND(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="revenue" stroke="#4c6545" strokeWidth={3} dot={{ r: 4, fill: '#4c6545' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
                    <h2 className="font-notoSerif text-xl font-semibold text-on-surface mb-2">Trạng thái Đơn hàng</h2>
                    <p className="text-sm text-on-surface-variant mb-6">Phân bổ tổng số đơn</p>
                    <div className="h-64 w-full">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-on-surface-variant">Chưa có dữ liệu</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
                <h2 className="font-notoSerif text-xl font-semibold text-on-surface mb-6">Đơn hàng mới nhất</h2>
                <Table 
                    dataSource={stats.recentOrders || []} 
                    columns={recentOrderColumns} 
                    rowKey="_id" 
                    pagination={false}
                    size="small"
                />
            </div>
        </div>
    );
};

export default AdminDashboard;
