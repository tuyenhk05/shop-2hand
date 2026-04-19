import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Checkbox, message } from 'antd';
import { getAllRoles, createRole, updateRole, deleteRole } from '../../services/admin/roles.service.jsx';

const RolesManagement = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [form] = Form.useForm();

    const permissionOptions = [
        { label: 'Toàn quyền (Admin)', value: 'all' },
        { label: 'Xem Danh mục', value: 'categories_view' },
        { label: 'Sửa Danh mục', value: 'categories_edit' },
        { label: 'Xem Sản phẩm', value: 'products_view' },
        { label: 'Sửa Sản phẩm', value: 'products_edit' },
        { label: 'Xem Người dùng', value: 'users_view' },
        { label: 'Sửa Người dùng', value: 'users_edit' },
        { label: 'Quản lý Đơn hàng', value: 'orders_view' },
        { label: 'Quản lý Ký gửi', value: 'consignments_view' },
        { label: 'Quản lý Phân quyền', value: 'roles_view' },
    ];

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const res = await getAllRoles();
            if (res.success) setRoles(res.data);
        } catch {
            message.error('Lỗi khi tải danh sách quyền');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleAdd = () => {
        setEditingRole(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingRole(record);
        form.setFieldsValue({
            title: record.title,
            description: record.description,
            permissions: record.permissions || []
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await deleteRole(id);
            message.success('Xóa nhóm quyền thành công');
            fetchRoles();
        } catch {
            message.error('Lỗi khi xóa nhóm quyền');
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (editingRole) {
                await updateRole(editingRole._id, values);
                message.success('Cập nhật thành công');
            } else {
                await createRole(values);
                message.success('Thêm mới thành công');
            }
            setIsModalVisible(false);
            fetchRoles();
        } catch {
            message.error('Có lỗi xảy ra');
        }
    };

    const columns = [
        {
            title: 'Tên nhóm quyền',
            dataIndex: 'title',
            key: 'title',
            className: 'font-semibold',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Quyền hạn',
            dataIndex: 'permissions',
            key: 'permissions',
            render: (permissions) => {
                if(permissions.includes('all')) return <span className="text-error font-bold block">Thao tác toàn quyền</span>;
                return permissions.length + ' quyền';
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
                    {/* KHÔNG CHO PHÉP XÓA QUẢN TRỊ VIÊN MẶC ĐỊNH */}
                    {record.title !== 'Quản trị viên' && record.title !== 'Khách hàng' && (
                        <Button type="link" danger onClick={() => handleDelete(record._id)}>Xóa</Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="font-notoSerif text-2xl font-bold text-on-surface">Quản lý Phân quyền</h2>
                    <p className="text-sm text-on-surface-variant">Thiết lập nhóm quyền và giới hạn truy cập cho từng bộ phận</p>
                </div>
                <Button type="primary" className="bg-primary hover:bg-primary/90" size="large" onClick={handleAdd}>
                    + Thêm nhóm quyền
                </Button>
            </div>

            <Table 
                dataSource={roles} 
                columns={columns} 
                rowKey="_id" 
                loading={loading}
                pagination={false}
                className="w-full"
            />

            <Modal
                title={editingRole ? "Sửa nhóm quyền" : "Thêm nhóm quyền"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="title" label="Tên nhóm quyền" rules={[{ required: true, message: 'Nhập tên nhóm!' }]}>
                        <Input disabled={editingRole?.title === 'Quản trị viên' || editingRole?.title === 'Khách hàng'} />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input />
                    </Form.Item>
                    {!(editingRole?.title === 'Quản trị viên') && (
                        <Form.Item name="permissions" label="Chọn quyền hạn">
                            <Checkbox.Group options={permissionOptions} className="flex flex-col gap-2" />
                        </Form.Item>
                    )}
                    <Form.Item className="mb-0 text-right">
                        <Button onClick={() => setIsModalVisible(false)} className="mr-2">Hủy</Button>
                        <Button type="primary" htmlType="submit" className="bg-primary">Lưu</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RolesManagement;
