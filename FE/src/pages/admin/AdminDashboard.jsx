import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Table, Tag } from 'antd';
import { getDashboardStats } from '../../services/admin/dashboard.service.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Loading from '../../components/loading/loading';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalActiveProducts: 0,
        pendingOrders: 0,
        totalDeliveredOrders: 0,
        totalPendingConsignments: 0
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
        { 
            title: 'Mã đơn', 
            dataIndex: 'orderCode', 
            render: (val, r) => (
                <span 
                    onClick={() => navigate('/admin/orders')} 
                    className="text-primary hover:underline font-bold cursor-pointer transition-all"
                >
                    {val || r._id.slice(-6).toUpperCase()}
                </span>
            ) 
        },
        { title: 'Khách hàng', dataIndex: 'buyerName' },
        { title: 'Tổng tiền', dataIndex: 'totalAmount', render: formatVND },
        { title: 'Ngày tạo', dataIndex: 'createdAt', render: (val) => new Date(val).toLocaleDateString('vi-VN') },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status',
            render: (status) => {
                const color = status === 'delivered' ? 'green' : (status === 'cancelled' ? 'red' : 'blue');
                return <Tag color={color}>{statusLabels[status] || status}</Tag>;
            }
        }
    ];

    if (isLoading) return <Loading fullScreen={true} text="Đang tải dữ liệu thống kê..." />;

    return (
        <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-12">
            <div>
                <h1 className="font-notoSerif text-3xl font-bold tracking-tight text-on-surface">Bảng điều khiển</h1>
                <p className="text-sm text-on-surface-variant mt-1">Dữ liệu kinh doanh và xu hướng mới nhất</p>
            </div>

            {/* Premium Bento Grid: 6 Distinct Cards with micro-animations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metric 1: Revenue */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 flex flex-col justify-between h-44 shadow-sm hover:shadow-md transition-all ease-in-out">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Doanh thu tháng này</span>
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">payments</span>
                    </div>
                    <div>
                        <h3 className="font-notoSerif text-3xl font-bold text-on-surface">
                            {isLoading ? '...' : formatVND(stats.totalRevenue)}
                        </h3>
                        <p className="text-xs text-primary mt-1 font-medium select-none">Doanh thu thực nhận tháng này</p>
                    </div>
                </div>

                {/* Metric 2: Pending Orders */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl flex flex-col justify-between h-44 shadow-sm hover:shadow-md transition-all border border-outline-variant/10">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Đơn hàng cần xử lý</span>
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">inventory</span>
                    </div>
                    <div>
                        <h3 className="font-notoSerif text-3xl font-bold text-on-surface">{isLoading ? '...' : stats.pendingOrders ?? 0}</h3>
                        <p className="text-xs text-on-surface-variant mt-1 font-medium select-none">Đơn hàng chờ duyệt hoặc đang giao</p>
                    </div>
                </div>

                {/* Metric 3: Active Products */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl flex flex-col justify-between h-44 shadow-sm hover:shadow-md transition-all border border-outline-variant/10">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Sản phẩm đang bán</span>
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">checkroom</span>
                    </div>
                    <div>
                        <h3 className="font-notoSerif text-3xl font-bold text-on-surface">{isLoading ? '...' : stats.totalActiveProducts ?? 0}</h3>
                        <p className="text-xs text-primary mt-1 font-medium select-none">Sản phẩm đang được niêm yết</p>
                    </div>
                </div>

                {/* Metric 4: Success Orders */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl flex flex-col justify-between h-44 shadow-sm hover:shadow-md transition-all border border-outline-variant/10">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Đơn hàng thành công</span>
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">task_alt</span>
                    </div>
                    <div>
                        <h3 className="font-notoSerif text-3xl font-bold text-on-surface">{isLoading ? '...' : stats.totalDeliveredOrders ?? 0}</h3>
                        <p className="text-xs text-on-surface-variant mt-1 font-medium select-none">Đơn đã giao thành công</p>
                    </div>
                </div>

                {/* Metric 5: Pending Consignments */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl flex flex-col justify-between h-44 shadow-sm hover:shadow-md transition-all border border-outline-variant/10">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Ký gửi cần xử lý</span>
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">handshake</span>
                    </div>
                    <div>
                        <h3 className="font-notoSerif text-3xl font-bold text-on-surface">{isLoading ? '...' : stats.totalPendingConsignments ?? 0}</h3>
                        <p className="text-xs text-on-surface-variant mt-1 font-medium select-none">Yêu cầu ký gửi mới</p>
                    </div>
                </div>

                {/* Metric 6: Users */}
                <div className="bg-[#4c6545] text-white p-6 rounded-2xl flex flex-col justify-between h-44 shadow-sm hover:shadow-md transition-all select-none">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Khách hàng đăng ký</span>
                        <span className="material-symbols-outlined text-white bg-white/20 p-2 rounded-xl">group</span>
                    </div>
                    <div>
                        <h3 className="font-notoSerif text-3xl font-bold">{isLoading ? '...' : stats.totalUsers}</h3>
                        <p className="text-xs opacity-80 mt-1 font-medium">Lượng người dùng trên hệ thống</p>
                    </div>
                </div>
            </div>

            {/* Analytics Section: Two-Column Flexible Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Biểu đồ Doanh thu Năm nay */}
                    <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="font-notoSerif text-xl font-semibold text-on-surface">Biểu đồ Doanh thu (Năm nay)</h2>
                                <p className="text-sm text-on-surface-variant mt-1">Doanh thu thực tế theo từng tháng trong năm</p>
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

                    {/* Biểu đồ Doanh thu Tuần này */}
                    <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="font-notoSerif text-xl font-semibold text-on-surface">Biểu đồ Doanh thu (Tuần này)</h2>
                                <p className="text-sm text-on-surface-variant mt-1">Doanh thu theo các ngày trong tuần</p>
                            </div>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.weeklyRevenue || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} tickFormatter={(value) => `${value.toLocaleString('vi-VN')} đ`} />
                                    <Tooltip formatter={(value) => formatVND(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Line type="monotone" dataKey="revenue" stroke="#8ea582" strokeWidth={3} dot={{ r: 4, fill: '#8ea582' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Narrow column side: Pie Chart Order Breakdown */}
                <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10 self-start">
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

                    {/* Summary status breakdown list */}
                    <div className="mt-6 space-y-2 text-xs border-t border-outline-variant/10 pt-4">
                        {pieData.map((entry, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    <span className="text-on-surface-variant font-medium">{entry.name}</span>
                                </div>
                                <span className="font-bold text-on-surface">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="font-notoSerif text-xl font-semibold text-on-surface">Đơn hàng mới nhất</h2>
                        <p className="text-sm text-on-surface-variant mt-1">5 đơn hàng vừa được khởi tạo</p>
                    </div>
                    <button 
                        onClick={() => navigate('/admin/orders')} 
                        className="text-xs font-semibold text-primary hover:underline"
                    >
                        Xem tất cả đơn hàng
                    </button>
                </div>
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
