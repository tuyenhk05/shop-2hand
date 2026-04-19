import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, message, Tag, Descriptions, Popconfirm, Badge } from 'antd';
import { EyeOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';
import { getAllOrders, updateOrderStatus, cancelOrder } from '../../services/admin/orders.service.jsx';

const API = 'http://localhost:3001';

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
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [form] = Form.useForm();

    // ─── Fetch ────────────────────────────────────────────────
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await getAllOrders();
            if (res.success) setOrders(res.data);
        } catch {
            message.error('Lỗi khi tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

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

    // ─── Columns ──────────────────────────────────────────────
    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: '_id',
            key: 'id',
            width: 90,
            render: (id) => (
                <span className="font-mono text-xs font-bold bg-surface-container px-2 py-1 rounded">
                    #{id?.slice(-6).toUpperCase()}
                </span>
            )
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
            )
        },
        {
            title: 'Sản phẩm',
            key: 'items',
            render: (_, r) => (
                <div className="space-y-1">
                    {r.items?.slice(0, 2).map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                            {item.productImage && (
                                <img src={item.productImage} alt="" className="w-8 h-10 object-cover rounded flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                                <p className="text-xs font-medium line-clamp-1">{item.productId?.title || 'Sản phẩm'}</p>
                                <p className="text-xs text-on-surface-variant">x{item.quantity} · {formatMoney(item.priceAtSale)}</p>
                            </div>
                        </div>
                    ))}
                    {r.items?.length > 2 && (
                        <p className="text-xs text-primary font-medium">+{r.items.length - 2} sản phẩm khác</p>
                    )}
                </div>
            )
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'total',
            render: (v) => <span className="text-primary font-bold text-sm">{formatMoney(v)}</span>
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentMethod',
            key: 'payment',
            render: (m) => {
                const cfg = PAYMENT_CONFIG[m] || { color: 'default', label: m };
                return <Tag color={cfg.color}>{cfg.label}</Tag>;
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (s) => {
                const cfg = STATUS_CONFIG[s] || { color: 'default', label: s };
                return <Badge color={cfg.color} text={<span className="text-xs font-medium">{cfg.label}</span>} />;
            }
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'date',
            render: (d) => <span className="text-xs">{d ? new Date(d).toLocaleDateString('vi-VN') : '—'}</span>
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <div className="flex gap-1">
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(record)}
                        className="p-1"
                        title="Xem chi tiết"
                    />
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        className="p-1"
                        title="Cập nhật trạng thái"
                    />
                    {record.status !== 'cancelled' && record.status !== 'delivered' && (
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
                            Đơn #{selectedOrder?._id?.slice(-6).toUpperCase()}
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
                        Chi tiết đơn hàng #{selectedOrder?._id?.slice(-6).toUpperCase()}
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
        </div>
    );
};

export default OrdersManagement;
