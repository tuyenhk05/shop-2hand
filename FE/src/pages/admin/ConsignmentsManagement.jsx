import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Table, Tag, Button, Modal, Form, Input, Select, message, Space, Typography, Image } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { getAllConsignments, updateConsignmentStatus, convertToProductApi } from '../../services/admin/consignments.service.jsx';
import { exportToCSV } from '../../untils/exportCSV';
import Loading from '../../components/loading/loading';

const { Title, Text } = Typography;

const ConsignmentsManagement = () => {
    const { role } = useSelector((state) => state.auth);
    const hasPerm = (perm) => role?.permissions?.includes('all') || role?.permissions?.includes(perm);

    const [consignments, setConsignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedConsignment, setSelectedConsignment] = useState(null);
    const [form] = Form.useForm();

    const fetchConsignments = async () => {
        setLoading(true);
        try {
            const res = await getAllConsignments();
            if (res.success) setConsignments(res.data);
        } catch {
            message.error('Lỗi khi tải danh sách ký gửi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConsignments();
    }, []);

    const pendingConsignments = consignments.filter(c => c.status === 'pending' || c.status === 'valued' || c.status === 'approved' || c.status === 'received');
    const rejectedConsignments = consignments.filter(c => c.status === 'rejected');
    const completedConsignments = consignments.filter(c => c.status === 'completed');

    const handleUpdateStatus = async (values) => {
        try {
            const res = await updateConsignmentStatus(selectedConsignment._id, values);
            if (res.success) {
                message.success('Cập nhật trạng thái thành công');
                setIsModalVisible(false);
                fetchConsignments();
            }
        } catch {
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const handleConvertToProduct = async (id) => {
        try {
            message.loading({ content: 'Đang xử lý đăng bán...', key: 'convert_loading' });
            const res = await convertToProductApi(id);
            if (res.success) {
                message.success({ content: 'Đã tạo sản phẩm và đăng bán thành công!', key: 'convert_loading' });
                fetchConsignments();
            } else {
                message.error({ content: res.message || 'Lỗi khi đăng bán', key: 'convert_loading' });
            }
        } catch (error) {
            message.error({ content: 'Lỗi kết nối server', key: 'convert_loading' });
        }
    };

    const columns = [
        {
            title: 'Mã Ký Gửi',
            key: 'code',
            render: (_, r) => <span className="font-mono text-xs font-bold text-primary">{r.consignmentCode || r._id.slice(-6).toUpperCase()}</span>,
            renderText: (_, r) => r.consignmentCode || r._id.slice(-6).toUpperCase()
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
            ),
            renderText: (user) => user?.fullName || '—'
        },
        {
            title: 'Sản phẩm',
            key: 'productName',
            render: (_, record) => (
                <div>
                    <p className="font-semibold">{record.title}</p>
                    <p className="text-xs">Loại: {record.categoryId?.name || 'N/A'}</p>
                    <p className="text-xs">Tình trạng: {record.condition}</p>
                    <p className="text-xs text-primary font-bold">Kỳ vọng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.expectedPrice)}</p>
                </div>
            ),
            renderText: (_, record) => record.title
        },
        {
            title: 'Danh mục',
            key: 'category',
            renderText: (_, record) => record.categoryId?.name || 'N/A'
        },
        {
            title: 'Giá kỳ vọng',
            dataIndex: 'expectedPrice',
            key: 'price',
            renderText: (v) => v
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'photos',
            key: 'photos',
            render: (photos) => photos && photos.length > 0 ? (
                <Image src={photos[0]} alt="img" className="w-16 h-16 object-cover rounded shadow-sm" width={64} height={64} />
            ) : 'N/A'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const config = {
                    valued: { color: 'blue', text: 'Đã báo giá' },
                    approved: { color: 'orange', text: 'Chờ nhận hàng' },
                    received: { color: 'green', text: 'Đã nhận & QC OK' },
                    rejected: { color: 'red', text: 'Đã hủy' },
                    completed: { color: 'cyan', text: 'Đã lên kệ' },
                    pending: { color: 'gold', text: 'Chờ xử lý' }
                };
                const cfg = config[status] || config.pending;
                return <Tag color={cfg.color}>{cfg.text}</Tag>;
            },
            renderText: (status) => {
                const texts = {
                    valued: 'Đã báo giá',
                    approved: 'Chờ nhận hàng',
                    received: 'Đã nhận & QC OK',
                    rejected: 'Đã hủy',
                    completed: 'Đã lên kệ',
                    pending: 'Chờ xử lý'
                };
                return texts[status] || 'Chờ xử lý';
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <div className="flex gap-2 flex-col items-start">
                    {hasPerm('consignments_edit') && (
                        <Button type="link" size="small" onClick={() => {
                            setSelectedConsignment(record);
                            setIsModalVisible(true);
                            form.setFieldsValue({ status: record.status, expectedPrice: record.expectedPrice, adminNotes: record.adminNotes });
                        }} className="p-0">Cập nhật & Check</Button>
                    )}
                    
                    {record.status === 'received' && hasPerm('consignments_edit') && (
                        <Button 
                            type="primary" 
                            size="small" 
                            className="bg-green-600 hover:bg-green-700 text-white border-none"
                            onClick={() => handleConvertToProduct(record._id)}
                        >
                            Thêm vào kho
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    if (loading && consignments.length === 0) return <Loading fullScreen={true} text="Đang tải danh sách ký gửi..." />;

    return (
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="font-notoSerif text-2xl font-bold text-on-surface">Quản lý Yêu cầu Ký gửi</h2>
                    <p className="text-sm text-on-surface-variant">Xử lý các đề xuất ký gửi từ người dùng</p>
                </div>
                <Button 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    onClick={() => exportToCSV(consignments, columns.filter(c => c.key !== 'action' && c.key !== 'photos'), 'DanhSachKyGui')} 
                    className="bg-green-600 hover:bg-green-700"
                >
                    Xuất CSV
                </Button>
            </div>

            {/* Section 1: Yêu cầu Ký gửi đang xử lý */}
            <div className="mb-8 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                <h3 className="font-notoSerif text-lg font-bold text-on-surface mb-3">Yêu cầu Ký gửi đang xử lý</h3>
                <Table 
                    dataSource={pendingConsignments} 
                    columns={columns} 
                    rowKey="_id" 
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                    className="w-full"
                />
            </div>

            {/* Section 2: Yêu cầu Đã hủy / Từ chối */}
            <div className="mb-8 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                <h3 className="font-notoSerif text-lg font-bold text-on-surface mb-3">Yêu cầu Đã hủy / Từ chối</h3>
                <Table 
                    dataSource={rejectedConsignments} 
                    columns={columns} 
                    rowKey="_id" 
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                    className="w-full"
                />
            </div>

            {/* Section 3: Yêu cầu Đã hoàn tất / Lên kệ */}
            <div className="mb-6 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                <h3 className="font-notoSerif text-lg font-bold text-on-surface mb-3">Yêu cầu Đã hoàn tất / Lên kệ</h3>
                <Table 
                    dataSource={completedConsignments} 
                    columns={columns} 
                    rowKey="_id" 
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                    className="w-full"
                />
            </div>

            <Modal
                title={"Chi tiết & Cập nhật Yêu cầu Ký gửi"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedConsignment && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-outline-variant/10">
                        {/* Ảnh gallery */}
                        <div>
                            <Text strong className="block mb-4">Hình ảnh chi tiết ({selectedConsignment.photos?.length || 0})</Text>
                            <Image.PreviewGroup>
                                <div className="grid grid-cols-3 gap-2">
                                    {selectedConsignment.photos?.map((img, idx) => (
                                        <Image 
                                            key={idx} 
                                            src={img} 
                                            className="aspect-square object-cover rounded-lg border border-outline-variant/10" 
                                        />
                                    ))}
                                </div>
                            </Image.PreviewGroup>
                        </div>

                        {/* Thông tin chi tiết */}
                        <div className="space-y-4">
                            <Title level={4} className="m-0 text-primary">{selectedConsignment.title}</Title>
                            
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <Text type="secondary">Danh mục:</Text>
                                <Text strong>{selectedConsignment.categoryId?.name || 'N/A'}</Text>
                                
                                <Text type="secondary">Thương hiệu:</Text>
                                <Text strong>{selectedConsignment.brandId?.name || 'N/A'}</Text>
                                
                                <Text type="secondary">Giới tính:</Text>
                                <Text strong className="uppercase">{selectedConsignment.gender}</Text>

                                <Text type="secondary">Size:</Text>
                                <Text strong>{selectedConsignment.size || 'N/A'}</Text>

                                <Text type="secondary">Màu sắc:</Text>
                                <Text strong>{selectedConsignment.color || 'N/A'}</Text>

                                <Text type="secondary">Chất liệu:</Text>
                                <Text strong>{selectedConsignment.material || 'N/A'}</Text>

                                <Text type="secondary">Tình trạng:</Text>
                                <Text strong>{selectedConsignment.condition}</Text>

                                <Text type="secondary">Giá kỳ vọng:</Text>
                                <Text strong className="text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedConsignment.expectedPrice)}</Text>
                            </div>

                            <div className="mt-4 pt-4 border-t border-dashed border-outline-variant/20">
                                <Text type="secondary" className="block mb-1">Mô tả từ khách hàng:</Text>
                                <div className="p-3 bg-surface-container-low rounded-lg text-sm italic">
                                    {selectedConsignment.description}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <Form form={form} layout="vertical" onFinish={handleUpdateStatus}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item name="status" label="Trạng thái xử lý">
                            <Select options={[
                                { label: 'Chờ định giá', value: 'pending' },
                                { label: 'Đã báo giá (Chờ khách chốt)', value: 'valued' },
                                { label: 'Khách đã chốt (Chờ nhận hàng)', value: 'approved' },
                                { label: 'Đã nhận hàng & Đạt chất lượng (Sẵn sàng đăng bán)', value: 'received' },
                                { label: 'Đã đăng bán (Hoàn tất)', value: 'completed' },
                                { label: 'Từ chối / Hủy', value: 'rejected' }
                            ]} />
                        </Form.Item>
                        <Form.Item name="expectedPrice" label="Giá Shop đề xuất (VNĐ)">
                            <Input type="number" placeholder="Nhập giá tiền định giá..." />
                        </Form.Item>
                    </div>
                    <Form.Item name="adminNotes" label="Ghi chú nội bộ (Khách không thấy)">
                        <Input.TextArea rows={3} placeholder="Ghi chú về tình trạng thật sự, lý do từ chối..." />
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
