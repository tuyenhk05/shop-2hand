import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Table, Button, Modal, Form, Input, Checkbox, message } from 'antd';
import { getAllRoles, createRole, updateRole, deleteRole } from '../../services/admin/roles.service.jsx';

const RolesManagement = () => {
    const { role } = useSelector((state) => state.auth);
    const hasPerm = (perm) => role?.permissions?.includes('all') || role?.permissions?.includes(perm);

    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [form] = Form.useForm();

    const permissionOptions = [
        { label: 'Toàn quyền (Admin)', value: 'all' },
        
        { label: 'Xem Danh mục', value: 'categories_view' },
        { label: 'Thêm Danh mục', value: 'categories_create' },
        { label: 'Sửa Danh mục', value: 'categories_edit' },
        { label: 'Xóa Danh mục', value: 'categories_delete' },
        
        { label: 'Xem Sản phẩm', value: 'products_view' },
        { label: 'Thêm/Sửa Sản phẩm', value: 'products_edit' },
        { label: 'Xóa Sản phẩm', value: 'products_delete' },
        
        { label: 'Xem Người dùng', value: 'users_view' },
        { label: 'Sửa Người dùng', value: 'users_edit' },
        { label: 'Xóa Người dùng', value: 'users_delete' },
        
        { label: 'Xem Đơn hàng', value: 'orders_view' },
        { label: 'Cập nhật Đơn hàng', value: 'orders_edit' },
        { label: 'Hủy Đơn hàng', value: 'orders_delete' },
        
        { label: 'Xem Ký gửi', value: 'consignments_view' },
        { label: 'Cập nhật Ký gửi', value: 'consignments_edit' },
        { label: 'Xóa Ký gửi', value: 'consignments_delete' },
        
        { label: 'Xem Phân quyền', value: 'roles_view' },
        { label: 'Tạo Phân quyền', value: 'roles_create' },
        { label: 'Sửa Phân quyền', value: 'roles_edit' },
        { label: 'Xóa Phân quyền', value: 'roles_delete' },

        { label: 'Xem Chat Hỗ trợ KH', value: 'support_view' },
        { label: 'Trả lời Chat Hỗ trợ KH', value: 'support_reply' },
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
                    {hasPerm('roles_edit') && (
                        <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
                    )}
                    {/* KHÔNG CHO PHÉP XÓA QUẢN TRỊ VIÊN MẶC ĐỊNH */}
                    {hasPerm('roles_delete') && record.title !== 'Quản trị viên' && record.title !== 'Khách hàng' && (
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
                {hasPerm('roles_create') && (
                    <Button type="primary" className="bg-primary hover:bg-primary/90" size="large" onClick={handleAdd}>
                        + Thêm nhóm quyền
                    </Button>
                )}
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
