import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { Table, Button, Modal, Form, Select, message, Tag, Descriptions, Popconfirm, Badge, DatePicker } from 'antd';
import { EyeOutlined, EditOutlined, StopOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { getAllOrders, updateOrderStatus, cancelOrder } from '../../services/admin/orders.service.jsx';
import { exportToCSV } from '../../untils/exportCSV';

const { RangePicker } = DatePicker;

const STATUS_CONFIG = {
    pending_payment: { color: 'orange',  label: 'Chờ thanh toán' },
    paid:            { color: 'cyan',    label: 'Đã thanh toán' },
    processing:      { color: 'blue',    label: 'Đang xử lý' },
    shipped:         { color: 'purple',  label: 'Đang giao' },
    delivered:       { color: 'green',   label: 'Đã giao' },
    cancelled:       { color: 'red',     label: 'Đã hủy' },
    returned:        { color: 'volcano', label: 'Hoàn trả' },
};

const PAYMENT_CONFIG = {
    vnpay:         { color: 'blue',    label: 'VNPAY' },
    momo:          { color: 'purple',  label: 'MoMo' },
    cod:           { color: 'default', label: 'COD' },
    bank_transfer: { color: 'geekblue', label: 'Chuyển khoản' },
};

const formatMoney = (val) =>
    val != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) : '—';

const OrdersManagement = () => {
    const { role } = useSelector((state) => state.auth);
    const hasPerm = (perm) => role?.permissions?.includes('all') || role?.permissions?.includes(perm);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [printOrder, setPrintOrder] = useState(null);
    const [form] = Form.useForm();

    // ─── Filter State ──────────────────────────────────────────
    const [filters, setFilters] = useState({
        status: undefined,
        dateRange: null
    });

    // ─── Fetch ────────────────────────────────────────────────
    const fetchOrders = async (currentFilters = filters) => {
        try {
            setLoading(true);
            const params = {};
            if (currentFilters.status) params.status = currentFilters.status;
            if (currentFilters.dateRange && currentFilters.dateRange.length === 2) {
                params.startDate = currentFilters.dateRange[0].format('YYYY-MM-DD');
                params.endDate = currentFilters.dateRange[1].format('YYYY-MM-DD');
            }

            const res = await getAllOrders(params);
            if (res.success) setOrders(res.data);
        } catch {
            message.error('Lỗi khi tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    // Trigger fetch khi status hoặc ngày thay đổi
    useEffect(() => {
        fetchOrders();
    }, [filters.status, filters.dateRange]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key] : value }));
    };

    const resetFilters = () => {
        setFilters({ status: undefined, dateRange: null });
    };

    // ─── Xem chi tiết ─────────────────────────────────────────
    const handleViewDetail = (record) => {
        setSelectedOrder(record);
        setIsDetailModalVisible(true);
    };

    // ─── Mở modal cập nhật trạng thái ─────────────────────────
    const handleEdit = (record) => {
        setSelectedOrder(record);
        form.setFieldsValue({ status: record.status });
        setIsEditModalVisible(true);
    };

    // ─── Cập nhật trạng thái ──────────────────────────────────
    const handleSubmitStatus = async (values) => {
        try {
            await updateOrderStatus(selectedOrder._id, values.status);
            message.success('Cập nhật trạng thái thành công');
            setIsEditModalVisible(false);
            fetchOrders();
        } catch {
            message.error('Có lỗi xảy ra');
        }
    };

    // ─── Hủy đơn ──────────────────────────────────────────────
    const handleCancel = async (id) => {
        try {
            await cancelOrder(id);
            message.success('Đã hủy đơn hàng');
            fetchOrders();
        } catch {
            message.error('Lỗi khi hủy đơn hàng');
        }
    };

    // ─── In hóa đơn ───────────────────────────────────────────
    const handlePrintInvoice = (record) => {
        setPrintOrder(record);
        setTimeout(() => {
            window.print();
        }, 300); // Đợi DOM render xong mới gọi lệnh in
    };

    // ─── Columns ──────────────────────────────────────────────
    const columns = [
        {
            title: 'Mã Đơn',
            key: 'orderCode',
            render: (_, r) => (
                <span className="font-bold text-primary text-xs">{r.orderCode || `#${r._id.slice(-6).toUpperCase()}`}</span>
            ),
            renderText: (_, r) => r.orderCode || r._id.slice(-6).toUpperCase()
        },
        {
            title: 'Khách hàng',
            key: 'buyer',
            render: (_, r) => (
                <div>
                    <p className="font-semibold text-on-surface text-sm">{r.buyerId?.fullName || r.buyerName || '—'}</p>
                    <p className="text-xs text-on-surface-variant">{r.buyerId?.email || '—'}</p>
                    <p className="text-xs text-on-surface-variant">{r.buyerId?.phone || r.buyerPhone || ''}</p>
                </div>
            ),
            renderText: (_, r) => r.buyerId?.fullName || r.buyerName || '—'
        },
        {
            title: 'Số điện thoại',
            key: 'phone',
            renderText: (_, r) => r.buyerId?.phone || r.buyerPhone || '—'
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'total',
            render: (v) => <span className="text-primary font-bold text-sm">{formatMoney(v)}</span>,
            renderText: (v) => v
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentMethod',
            key: 'payment',
            render: (m) => {
                const cfg = PAYMENT_CONFIG[m] || { color: 'default', label: m };
                return <Tag color={cfg.color}>{cfg.label}</Tag>;
            },
            renderText: (m) => PAYMENT_CONFIG[m]?.label || m
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (s) => {
                const cfg = STATUS_CONFIG[s] || { color: 'default', label: s };
                return <Badge color={cfg.color} text={<span className="text-xs font-medium">{cfg.label}</span>} />;
            },
            renderText: (s) => STATUS_CONFIG[s]?.label || s
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'date',
            render: (d) => <span className="text-xs">{d ? new Date(d).toLocaleDateString('vi-VN') : '—'}</span>,
            renderText: (d) => new Date(d).toLocaleDateString('vi-VN')
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <div className="flex gap-1">
                    {hasPerm('orders_view') && (
                        <Button
                            type="link"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(record)}
                            className="p-1"
                            title="Xem chi tiết"
                        />
                    )}
                    {hasPerm('orders_edit') && (
                        <Button
                            type="link"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            className="p-1"
                            title="Cập nhật trạng thái"
                        />
                    )}
                    {hasPerm('orders_delete') && record.status !== 'cancelled' && record.status !== 'delivered' && (
                        <Popconfirm
                            title="Hủy đơn hàng?"
                            description="Xác nhận bạn muốn hủy đơn hàng này."
                            onConfirm={() => handleCancel(record._id)}
                            okText="Hủy đơn"
                            cancelText="Giữ lại"
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                type="link"
                                size="small"
                                icon={<StopOutlined />}
                                danger
                                className="p-1"
                                title="Hủy đơn"
                            />
                        </Popconfirm>
                    )}
                    {hasPerm('orders_view') && ['paid', 'processing', 'shipped', 'delivered'].includes(record.status) && (
                        <Button
                            type="link"
                            size="small"
                            icon={<PrinterOutlined />}
                            onClick={() => handlePrintInvoice(record)}
                            className="p-1 text-teal-600 hover:text-teal-800"
                            title="In hóa đơn"
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="font-notoSerif text-2xl font-bold text-on-surface">Quản lý Đơn hàng</h2>
                    <p className="text-sm text-on-surface-variant">Tổng cộng <strong>{orders.length}</strong> đơn hàng</p>
                </div>
                <div className="flex gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                        const count = orders.filter(o => o.status === key).length;
                        if (count === 0) return null;
                        return (
                            <Tag key={key} color={cfg.color} className="text-xs">
                                {cfg.label}: {count}
                            </Tag>
                        );
                    })}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-surface-container-low p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-end border border-outline-variant/10">
                <div className="flex-1 min-w-[280px]">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Lọc theo ngày đặt</p>
                    <RangePicker
                        format="DD/MM/YYYY"
                        value={filters.dateRange}
                        onChange={(dates) => handleFilterChange('dateRange', dates)}
                        className="w-full"
                        placeholder={['Từ ngày', 'Đến ngày']}
                    />
                </div>

                <div className="w-48">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Lọc trạng thái</p>
                    <Select
                        placeholder="Tất cả trạng thái"
                        className="w-full"
                        allowClear
                        value={filters.status}
                        onChange={(val) => handleFilterChange('status', val)}
                    >
                        {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                            <Select.Option key={val} value={val}>
                                <Badge color={cfg.color} text={cfg.label} />
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                <Button onClick={resetFilters} className="mb-0.5">Đặt lại</Button>
                
                <Button 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    onClick={() => exportToCSV(orders, columns.filter(c => c.key !== 'action' && c.key !== 'items'), 'DanhSachDonHang')} 
                    className="mb-0.5 bg-green-600 hover:bg-green-700"
                >
                    Xuất CSV
                </Button>
            </div>

            <Table
                dataSource={orders}
                columns={columns}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 15 }}
            />

            {/* Modal Cập nhật trạng thái */}
            <Modal
                title={
                    <div>
                        <p className="font-notoSerif font-bold text-lg">Cập nhật trạng thái</p>
                        <p className="text-xs text-on-surface-variant font-normal">
                            Đơn {selectedOrder?.orderCode ? `#${selectedOrder.orderCode}` : `#${selectedOrder?._id?.slice(-6).toUpperCase()}`}
                        </p>
                    </div>
                }
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
                width={400}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmitStatus} className="mt-4">
                    <Form.Item name="status" label="Trạng thái đơn hàng">
                        <Select>
                            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                                <Select.Option key={val} value={val}>
                                    <Tag color={cfg.color}>{cfg.label}</Tag>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setIsEditModalVisible(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" className="bg-primary">Lưu thay đổi</Button>
                    </div>
                </Form>
            </Modal>

            {/* Modal Xem chi tiết */}
            <Modal
                title={
                    <p className="font-notoSerif font-bold text-lg">
                        Chi tiết đơn hàng {selectedOrder?.orderCode ? `#${selectedOrder.orderCode}` : `#${selectedOrder?._id?.slice(-6).toUpperCase()}`}
                    </p>
                }
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={<Button onClick={() => setIsDetailModalVisible(false)}>Đóng</Button>}
                width={640}
            >
                {selectedOrder && (
                    <div className="space-y-4">
                        <Descriptions column={2} size="small" bordered>
                            <Descriptions.Item label="Khách hàng" span={2}>
                                <strong>{selectedOrder.buyerId?.fullName || selectedOrder.buyerName}</strong>
                                <br />{selectedOrder.buyerId?.email}
                                <br />{selectedOrder.buyerId?.phone || selectedOrder.buyerPhone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ giao" span={2}>
                                {selectedOrder.shippingAddress}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={STATUS_CONFIG[selectedOrder.status]?.color}>
                                    {STATUS_CONFIG[selectedOrder.status]?.label}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thanh toán">
                                <Tag color={PAYMENT_CONFIG[selectedOrder.paymentMethod]?.color}>
                                    {PAYMENT_CONFIG[selectedOrder.paymentMethod]?.label}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền hàng">
                                {formatMoney(selectedOrder.totalAmount - (selectedOrder.shippingFee || 0))}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phí vận chuyển">
                                {formatMoney(selectedOrder.shippingFee)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng thanh toán" span={2}>
                                <strong className="text-primary text-base">{formatMoney(selectedOrder.totalAmount)}</strong>
                            </Descriptions.Item>
                        </Descriptions>

                        <div>
                            <p className="font-bold text-sm uppercase tracking-wider text-on-surface-variant mb-2">
                                Danh sách sản phẩm ({selectedOrder.items?.length})
                            </p>
                            <div className="space-y-2">
                                {selectedOrder.items?.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-surface-container rounded-lg">
                                        {item.productImage ? (
                                            <img src={item.productImage} alt="" className="w-12 h-14 object-cover rounded" />
                                        ) : (
                                            <div className="w-12 h-14 bg-surface-container-high rounded flex items-center justify-center text-outline">
                                                <span className="material-symbols-outlined text-sm">checkroom</span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-on-surface">
                                                {item.productId?.title || 'Sản phẩm'}
                                            </p>
                                            <p className="text-xs text-on-surface-variant">
                                                Số lượng: {item.quantity} · Đơn giá: {formatMoney(item.priceAtSale)}
                                            </p>
                                        </div>
                                        <p className="font-bold text-primary text-sm">
                                            {formatMoney(item.quantity * item.priceAtSale)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Template Hóa đơn (Chỉ hiển thị khi in) */}
            <style>
                {`
                    @media print {
                        body * { visibility: hidden; }
                        #printable-invoice, #printable-invoice * { visibility: visible; }
                        #printable-invoice {
                            position: absolute; left: 0; top: 0; width: 100%;
                            padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                            color: #000; background: #fff;
                        }
                        .print-hide { display: none !important; }
                        /* Xóa margin/padding mặc định khi in */
                        @page { margin: 15mm; }
                    }
                    /* Ẩn trên màn hình thường */
                    @media screen {
                        #printable-invoice { display: none; }
                    }
                `}
            </style>

            {printOrder && createPortal(
                <div id="printable-invoice">
                    <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-6">
                        <div>
                            <h1 className="text-4xl font-bold font-serif mb-2">ATELIER</h1>
                            <p className="text-sm">123 Đường Sư Vạn Hạnh, Phường 12, Quận 10</p>
                            <p className="text-sm">TP. Hồ Chí Minh, Việt Nam</p>
                            <p className="text-sm">SĐT: 090 123 4567</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold mb-2 uppercase tracking-widest text-gray-800">Hóa Đơn</h2>
                            <p className="text-sm"><strong>Số HD:</strong> {printOrder.orderCode || `#${printOrder._id?.slice(-8).toUpperCase()}`}</p>
                            <p className="text-sm"><strong>Ngày:</strong> {new Date().toLocaleDateString('vi-VN')}</p>
                        </div>
                    </div>

                    <div className="mb-8 flex justify-between">
                        <div>
                            <h3 className="font-bold uppercase tracking-wider text-sm mb-2 border-b border-gray-300 pb-1">Thông tin Khách hàng</h3>
                            <p className="text-sm"><strong>Họ Tên:</strong> {printOrder.buyerId?.fullName || printOrder.buyerName}</p>
                            <p className="text-sm"><strong>Điện thoại:</strong> {printOrder.buyerId?.phone || printOrder.buyerPhone}</p>
                            <p className="text-sm"><strong>Email:</strong> {printOrder.buyerId?.email || 'Không cung cấp'}</p>
                            <p className="text-sm mt-2 max-w-xs"><strong>Địa chỉ giao:</strong><br/>{printOrder.shippingAddress}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-bold uppercase tracking-wider text-sm mb-2 border-b border-gray-300 pb-1 text-right">Chi tiết Thanh toán</h3>
                            <p className="text-sm"><strong>Phương thức:</strong> {PAYMENT_CONFIG[printOrder.paymentMethod]?.label || printOrder.paymentMethod}</p>
                            <p className="text-sm"><strong>Trạng thái ĐH:</strong> {STATUS_CONFIG[printOrder.status]?.label || printOrder.status}</p>
                            <p className="text-sm mt-2">Đơn hàng đã được thanh toán.</p>
                        </div>
                    </div>

                    <table className="w-full mb-8 border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-y border-black">
                                <th className="py-2 px-2 text-left text-sm font-bold w-12">STT</th>
                                <th className="py-2 px-2 text-left text-sm font-bold">Tên sản phẩm</th>
                                <th className="py-2 px-2 text-center text-sm font-bold w-20">SL</th>
                                <th className="py-2 px-2 text-right text-sm font-bold w-32">Đơn giá</th>
                                <th className="py-2 px-2 text-right text-sm font-bold w-32">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {printOrder.items?.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-200">
                                    <td className="py-3 px-2 text-sm">{idx + 1}</td>
                                    <td className="py-3 px-2 text-sm">
                                        <p className="font-medium">{item.productId?.title || 'Sản phẩm ' + (idx + 1)}</p>
                                        {(item.productId?.size || item.productId?.color) && (
                                            <p className="text-xs text-gray-500">
                                                {item.productId?.size && `Size: ${item.productId.size} `}
                                                {item.productId?.color && `Màu: ${item.productId.color}`}
                                            </p>
                                        )}
                                    </td>
                                    <td className="py-3 px-2 text-center text-sm">{item.quantity}</td>
                                    <td className="py-3 px-2 text-right text-sm">{formatMoney(item.priceAtSale)}</td>
                                    <td className="py-3 px-2 text-right text-sm">{formatMoney(item.quantity * item.priceAtSale)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end mb-16">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Tạm tính:</span>
                                <span>{formatMoney(printOrder.totalAmount - (printOrder.shippingFee || 0))}</span>
                            </div>
                            <div className="flex justify-between text-sm border-b border-gray-300 pb-2">
                                <span>Phí giao hàng:</span>
                                <span>{formatMoney(printOrder.shippingFee || 0)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2">
                                <span>Tổng Thanh Toán:</span>
                                <span>{formatMoney(printOrder.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-12 pt-8 border-t border-dashed border-gray-400">
                        <p className="font-bold italic mb-1">Cảm ơn Quý khách đã mua sắm tại Atelier!</p>
                        <p className="text-xs text-gray-600">Việc bạn lựa chọn thời trang tái sinh là một đóng góp tuyệt vời cho hành tinh của chúng ta.</p>
                        <p className="text-xs text-gray-600 mt-2">Hỗ trợ khách hàng: atelier.support@example.com</p>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default OrdersManagement;
