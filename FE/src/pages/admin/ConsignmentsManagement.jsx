import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag } from 'antd';
import { getAllConsignments, updateConsignmentStatus } from '../../services/admin/consignments.service.jsx';

const ConsignmentsManagement = () => {
    const [consignments, setConsignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingConsignment, setEditingConsignment] = useState(null);
    const [form] = Form.useForm();

    const fetchConsignments = async () => {
        try {
            setLoading(true);
            const res = await getAllConsignments();
            if (res.success) setConsignments(res.data);
        } catch {
            message.error('Lỗi khi tải yêu cầu ký gửi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchConsignments(); }, []);

    const handleEdit = (record) => {
        setEditingConsignment(record);
        form.setFieldsValue({
            status: record.status,
            adminNotes: record.adminNotes
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await updateConsignmentStatus(id, { status: 'rejected' });
            message.success('Xóa thành công');
            fetchConsignments();
        } catch {
            message.error('Lỗi khi xóa');
        }
    };

    const handleSubmit = async (values) => {
        try {
            await updateConsignmentStatus(editingConsignment._id, values);
            message.success('Cập nhật trạng thái thành công');
            setIsModalVisible(false);
            fetchConsignments();
        } catch {
            message.error('Có lỗi xảy ra');
        }
    };

    const columns = [
        {
            title: 'Mã Ký Gửi',
            dataIndex: '_id',
            key: 'id',
            render: (id) => <span className="font-mono text-xs">{id.slice(-6).toUpperCase()}</span>
        },
        {
            title: 'Khách hàng',
            dataIndex: 'userId',
            key: 'user',
            render: (user) => (
                <div>
                    <p className="font-bold">{user?.fullName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
            )
        },
        {
            title: 'Sản phẩm',
            key: 'product',
            render: (_, record) => (
                <div>
                    <p className="font-semibold">{record.productName}</p>
                    <p className="text-xs">Loại: {record.productType}</p>
                    <p className="text-xs">Tình trạng: {record.condition}</p>
                    <p className="text-xs text-primary font-bold">Kỳ vọng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.expectedPrice)}</p>
                </div>
            )
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'images',
            key: 'images',
            render: (images) => images && images.length > 0 ? <img src={images[0]} alt="img" className="w-16 h-16 object-cover rounded" /> : 'N/A'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = {
                    'pending': 'orange',
                    'approved': 'blue',
                    'rejected': 'red',
                    'completed': 'green'
                };
                const labels = {
                    'pending': 'Chờ duyệt',
                    'approved': 'Đã duyệt',
                    'rejected': 'Từ chối',
                    'completed': 'Hoàn thành'
                };
                return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <div className="flex gap-2 flex-col items-start">
                    <Button type="link" onClick={() => handleEdit(record)} className="p-0">Cập nhật & Check</Button>
                    <Button type="link" danger onClick={() => handleDelete(record._id)} className="p-0">Xóa</Button>
                </div>
            ),
        },
    ];

    return (
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="font-notoSerif text-2xl font-bold text-on-surface">Quản lý Yêu cầu Ký gửi</h2>
                    <p className="text-sm text-on-surface-variant">Xử lý các đề xuất ký gửi từ người dùng</p>
                </div>
            </div>

            <Table 
                dataSource={consignments} 
                columns={columns} 
                rowKey="_id" 
                loading={loading}
                pagination={{ pageSize: 10 }}
                className="w-full"
            />

            <Modal
                title={"Cập nhật Yêu cầu Ký gửi"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="status" label="Trạng thái xử lý">
                        <Select options={[
                            { label: 'Chờ duyệt', value: 'pending' },
                            { label: 'Đã duyệt (Chờ nhận hàng)', value: 'approved' },
                            { label: 'Hoàn thành (Đã lên kệ)', value: 'completed' },
                            { label: 'Từ chối', value: 'rejected' }
                        ]} />
                    </Form.Item>
                    <Form.Item name="adminNotes" label="Ghi chú nội bộ (Khách không thấy)">
                        <Input.TextArea rows={4} placeholder="Ghi chú về tình trạng thật sự, lý do từ chối..." />
                    </Form.Item>
                    <Form.Item className="mb-0 text-right">
                        <Button onClick={() => setIsModalVisible(false)} className="mr-2">Hủy</Button>
                        <Button type="primary" htmlType="submit" className="bg-primary">Lưu thay đổi</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ConsignmentsManagement;
