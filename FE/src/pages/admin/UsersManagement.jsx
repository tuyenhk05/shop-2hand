import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Table, Button, Modal, Form, Select, Switch, message, Tag } from 'antd';
import { getAllUsers, updateUser, deleteUser } from '../../services/admin/users.service.jsx';
import { getAllRoles } from '../../services/admin/roles.service.jsx';

const UsersManagement = () => {
    const { role } = useSelector((state) => state.auth);
    const hasPerm = (perm) => role?.permissions?.includes('all') || role?.permissions?.includes(perm);

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, rolesRes] = await Promise.all([
                getAllUsers(),
                getAllRoles()
            ]);
            if (usersRes.success) setUsers(usersRes.data);
            if (rolesRes.success) setRoles(rolesRes.data);
        } catch {
            message.error('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleEdit = (record) => {
        setEditingUser(record);
        form.setFieldsValue({
            role: record.role ? record.role._id : null,
            isActive: record.isActive
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await deleteUser(id);
            message.success('Đã xóa/khóa người dùng');
            fetchData();
        } catch {
            message.error('Lỗi khi xóa người dùng');
        }
    };

    const handleSubmit = async (values) => {
        try {
            await updateUser(editingUser._id, values);
            message.success('Cập nhật người dùng thành công');
            setIsModalVisible(false);
            fetchData();
        } catch {
            message.error('Có lỗi xảy ra khi cập nhật');
        }
    };

    const columns = [
        {
            title: 'Khách hàng',
            key: 'user',
            render: (_, record) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-highest flex items-center justify-center font-bold text-primary">
                        {record.avatar ? <img src={record.avatar} alt="avatar" className="w-full h-full object-cover"/> : record.fullName[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="font-notoSerif font-bold text-on-surface">{record.fullName}</p>
                        <p className="text-xs text-on-surface-variant font-medium">{record.email}</p>
                    </div>
                </div>
            )
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role?.title === 'Quản trị viên' ? 'red' : 'blue'}>
                    {role ? role.title : 'Chưa phân quyền'}
                </Tag>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'default'}>
                    {isActive ? 'Hoạt động' : 'Đã khóa'}
                </Tag>
            )
        },
        {
            title: 'Ngày tham gia',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('vi-VN')
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <div className="flex gap-2">
                    {hasPerm('users_edit') && (
                        <Button type="link" onClick={() => handleEdit(record)}>Phân quyền</Button>
                    )}
                    {hasPerm('users_delete') && record.role?.title !== 'Quản trị viên' && (
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
                    <h2 className="font-notoSerif text-2xl font-bold text-on-surface">Khách hàng & Phân quyền</h2>
                    <p className="text-sm text-on-surface-variant">Quản lý tài khoản và phân quyền quản trị cho nhân sự</p>
                </div>
            </div>

            <Table 
                dataSource={users} 
                columns={columns} 
                rowKey="_id" 
                loading={loading}
                pagination={{ pageSize: 15 }}
                className="w-full"
            />

            <Modal
                title={"Cập nhật quyền và trạng thái"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <div className="mb-4">
                        <p className="font-bold">{editingUser?.fullName}</p>
                        <p className="text-sm text-gray-500">{editingUser?.email}</p>
                    </div>
                    <Form.Item name="role" label="Nhóm quyền" rules={[{ required: true, message: 'Vui lòng chọn nhóm quyền' }]}>
                        <Select options={roles.map(r => ({ label: r.title, value: r._id }))} />
                    </Form.Item>
                    <Form.Item name="isActive" label="Trạng thái tài khoản" valuePropName="checked">
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
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

export default UsersManagement;
