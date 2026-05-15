import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Table, Tag } from 'antd';
import { getDashboardStats } from '../../services/admin/dashboard.service.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import Loading from '../../components/loading/loading';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [revenueRange, setRevenueRange] = useState(30);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const response = await getDashboardStats(revenueRange);
                if (response.success) setStats(response.data);
            } catch (error) {
                console.error('Dashboard Stats Error:', error);
                message.error('Không thể tải dữ liệu thống kê');
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [revenueRange]);

    // Colors matching the blue/grey template theme + some brand colors
    const COLORS_DONUT = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#e5e7eb', '#d1d5db'];
    const COLORS_PIE = ['#2563eb', '#e5e7eb'];

    const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    const statusLabels = {
        pending_payment: 'Chờ thanh toán',
        paid: 'Đã thanh toán',
        processing: 'Đang xử lý',
        shipped: 'Đang giao',
        delivered: 'Đã giao',
        cancelled: 'Đã hủy',
        returned: 'Hoàn trả'
    };

    const orderColumns = [
        { 
            title: 'MÃ ĐƠN', 
            dataIndex: 'orderCode', 
            key: 'orderCode',
            render: (val, r) => (
                <span 
                    onClick={() => navigate('/admin/orders')} 
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer"
                >
                    {val || r._id.slice(-6).toUpperCase()}
                </span>
            ) 
        },
        { 
            title: 'KHÁCH HÀNG', 
            dataIndex: 'buyerName', 
            key: 'buyerName',
            render: (name) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm text-gray-600">{name || 'Khách hàng'}</span>
                </div>
            )
        },
        { 
            title: 'TỔNG TIỀN', 
            dataIndex: 'totalAmount', 
            key: 'totalAmount',
            render: (val) => <span className="text-sm font-medium text-gray-800">{formatVND(val)}</span>
        },
        { title: 'NGÀY TẠO', dataIndex: 'createdAt', render: (val) => <span className="text-sm text-gray-500">{new Date(val).toLocaleDateString('vi-VN')}</span> },
        { 
            title: 'TRẠNG THÁI', 
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const isSuccess = status === 'delivered';
                const isError = status === 'cancelled' || status === 'returned';
                return (
                    <Tag 
                        color={isSuccess ? 'success' : (isError ? 'error' : 'processing')} 
                        className="rounded-full px-3 py-1 text-xs"
                    >
                        {(statusLabels[status] || status).toUpperCase()}
                    </Tag>
                );
            }
        }
    ];

    if (!stats) return <Loading fullScreen={true} text="Đang tải dữ liệu thống kê..." />;

    return (
        <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-6 bg-gray-50/50 p-6 rounded-3xl relative">
            {isLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl">
                    <Loading />
                </div>
            )}

            {/* Dashboard Global Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-800">Bảng điều khiển</h1>
                    <p className="text-sm text-gray-500 mt-1">Hoạt động kinh doanh của bạn lúc này</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 font-medium hidden sm:inline-block">Dữ liệu thống kê:</span>
                    <select 
                        value={revenueRange}
                        onChange={(e) => setRevenueRange(Number(e.target.value))}
                        className="border border-gray-200 rounded-lg text-sm py-2 px-4 text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white hover:bg-gray-50 cursor-pointer font-medium shadow-sm transition-all"
                    >
                        <option value={7}>7 ngày qua</option>
                        <option value={30}>30 ngày qua</option>
                    </select>
                </div>
            </div>

            {/* TOP ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Header & Status Blocks */}
                <div className="lg:col-span-1 flex flex-col justify-end">
                    <div className="flex items-center gap-4 border-t border-b border-gray-100 py-4 bg-white px-4 rounded-xl shadow-sm h-[132px]">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="bg-orange-100 p-2 rounded-lg relative">
                                <span className="material-symbols-outlined text-orange-600 text-xl">inventory_2</span>
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                </span>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 leading-tight">{stats.inventoryStats?.awaitingProcessing || 0} đơn hàng</h4>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Chờ xử lý</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-l border-gray-200 pl-4 flex-1">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <span className="material-symbols-outlined text-blue-600 text-xl">local_shipping</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 leading-tight">{stats.inventoryStats?.pendingConsignments || 0} ký gửi</h4>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Cần xử lý</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-l border-gray-200 pl-4 flex-1">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 leading-tight">{stats.inventoryStats?.activeProducts || 0} sản phẩm</h4>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Đang bán</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Orders Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-800">Tổng đơn hàng</span>
                                <Tag color={stats.ordersStat?.growth >= 0 ? "success" : "error"} className="rounded-full border-none font-bold text-xs">
                                    {stats.ordersStat?.growth >= 0 ? '+' : ''}{stats.ordersStat?.growth || 0}%
                                </Tag>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">So với tuần trước</p>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.ordersStat?.total?.toLocaleString('vi-VN') || 0}</h3>
                    </div>
                    <div className="h-16 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.ordersStat?.miniChart || []}>
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="val" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-sm"></div>Hoàn thành <span className="text-gray-800 ml-1">{stats.ordersStat?.completionRate || 0}%</span></div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-200 rounded-sm"></div>Chờ thanh toán <span className="text-gray-800 ml-1">{stats.ordersStat?.pendingRate || 0}%</span></div>
                    </div>
                </div>

                {/* New Customers Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-800">Khách hàng mới</span>
                                <Tag color={stats.customersStat?.growth >= 0 ? "success" : "error"} className="rounded-full border-none font-bold text-xs bg-orange-50 text-orange-600">
                                    {stats.customersStat?.growth >= 0 ? '+' : ''}{stats.customersStat?.growth || 0}%
                                </Tag>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">So với tuần trước</p>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.customersStat?.total?.toLocaleString('vi-VN') || 0}</h3>
                    </div>
                    <div className="h-16 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.customersStat?.miniChart || []}>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>Đầu tuần</span>
                        <span>Cuối tuần</span>
                    </div>
                </div>
            </div>

            {/* MIDDLE ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Total Sells Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Tổng doanh thu</h2>
                            <p className="text-xs text-gray-500 mt-1">Doanh thu ghi nhận trên hệ thống theo chu kỳ</p>
                        </div>
                    </div>
                    <div className="h-56 w-full flex-1 min-h-[224px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.revenueChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(val) => val === 0 ? '0' : ''} />
                                <Tooltip 
                                    formatter={(value) => formatVND(value)} 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                                />
                                <Line type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Kỳ này" />
                                <Line type="monotone" dataKey="previous" stroke="#93c5fd" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Kỳ trước" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-2 px-6">
                        <span>{stats.revenueChart?.[0]?.name || 'Bắt đầu'}</span>
                        <span>{stats.revenueChart?.[Math.floor((stats.revenueChart?.length || 2) / 2)]?.name || 'Giữa kỳ'}</span>
                        <span>{stats.revenueChart?.[stats.revenueChart?.length - 1]?.name || 'Hiện tại'}</span>
                    </div>
                </div>

                {/* Right Side Stacked Cards */}
                <div className="flex flex-col gap-6">
                    {/* Order Status Ratio (Donut Chart) */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1 flex flex-col">
                        <h2 className="text-sm font-bold text-gray-800">Tỷ lệ Trạng thái Đơn hàng</h2>
                        <p className="text-xs text-gray-400 mt-1 mb-4">Phân bổ trạng thái</p>
                        <div className="relative h-[160px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={stats.orderStatusRatio || []} 
                                        cx="50%" cy="50%" 
                                        innerRadius={45} outerRadius={70} 
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.orderStatusRatio?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_DONUT[index % COLORS_DONUT.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                <span className="text-xl font-bold text-gray-800">{stats.orderStatusRatio?.reduce((a, b) => a + b.value, 0) || 0}</span>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2 h-20 overflow-y-auto pr-2 custom-scrollbar">
                            {stats.orderStatusRatio?.map((cat, i) => (
                                <div key={i} className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{backgroundColor: COLORS_DONUT[i % COLORS_DONUT.length]}}></div>
                                        <span className="text-gray-600 truncate max-w-[100px]" title={cat.name}>{cat.name}</span>
                                    </div>
                                    <span className="text-gray-800 font-medium whitespace-nowrap">
                                        {((cat.value / (stats.orderStatusRatio.reduce((a,b)=>a+b.value,0) || 1)) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Paying vs non paying */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1 flex flex-col">
                        <h2 className="text-sm font-bold text-gray-800">Tỷ lệ thanh toán</h2>
                        <p className="text-xs text-gray-400 mt-1 mb-4">Tổng quan</p>
                        <div className="relative h-[120px] w-full overflow-hidden flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={240} className="-mt-16">
                                <PieChart>
                                    <Pie
                                        data={stats.paymentStats || []}
                                        cx="50%"
                                        cy="100%"
                                        startAngle={180}
                                        endAngle={0}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={0}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.paymentStats?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-blue-600"></div>
                                    <span className="text-gray-600">Khách đã thanh toán</span>
                                </div>
                                <span className="text-gray-800 font-medium">{((stats.paymentStats?.[0]?.value / ((stats.paymentStats?.[0]?.value + stats.paymentStats?.[1]?.value) || 1)) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-gray-200"></div>
                                    <span className="text-gray-600">Khách chưa thanh toán</span>
                                </div>
                                <span className="text-gray-800 font-medium">{((stats.paymentStats?.[1]?.value / ((stats.paymentStats?.[0]?.value + stats.paymentStats?.[1]?.value) || 1)) * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM ROW */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Đơn hàng mới nhất</h2>
                        <p className="text-xs text-gray-500 mt-1">Danh sách các đơn hàng vừa được tạo trên hệ thống</p>
                    </div>
                    <div className="flex gap-2">
                        <select className="border border-gray-200 rounded-lg text-xs py-1.5 px-3 text-gray-600 outline-none focus:border-blue-400">
                            <option>Tất cả trạng thái</option>
                        </select>
                        <button 
                            onClick={() => navigate('/admin/orders')}
                            className="border border-gray-200 rounded-lg text-xs p-1.5 px-3 text-gray-600 hover:bg-gray-50 font-medium"
                        >
                            Xem tất cả
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <Table 
                        dataSource={stats.recentOrders || []} 
                        columns={orderColumns} 
                        rowKey="_id" 
                        pagination={false}
                        size="middle"
                        className="custom-table-header"
                    />
                </div>
            </div>
            
            <style>{`
                .custom-table-header .ant-table-thead > tr > th {
                    background-color: transparent !important;
                    color: #6b7280;
                    font-size: 11px;
                    font-weight: 700;
                    border-bottom: 1px solid #f3f4f6;
                    padding-bottom: 12px;
                }
                .custom-table-header .ant-table-tbody > tr > td {
                    border-bottom: 1px solid #f3f4f6;
                    padding: 16px 16px;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #e5e7eb;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
