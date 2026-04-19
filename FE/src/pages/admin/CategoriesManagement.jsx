import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../services/admin/categories.service.jsx';

const CategoriesManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form] = Form.useForm();

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await getAllCategories();
            if (res.success) {
                setCategories(res.data);
            }
        } catch {
            message.error('Lỗi khi tải danh mục');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    // Hàm chuyển đổi danh sách phẳng thành cây (nếu muốn hiển thị nested trong Table)
    const buildCategoryTree = (flatList) => {
        const map = {};
        const roots = [];
        
        flatList.forEach(item => {
            map[item._id] = { ...item, key: item._id, children: [] };
        });

        flatList.forEach(item => {
            if (item.parent_id && map[item.parent_id._id || item.parent_id]) {
                map[item.parent_id._id || item.parent_id].children.push(map[item._id]);
            } else {
                roots.push(map[item._id]);
            }
        });

        // Xóa thuộc tính children nếu trống để Ant Design Table không hiện nút expand vô nghĩa
        const cleanup = (list) => {
            list.forEach(item => {
                if (item.children.length === 0) {
                    delete item.children;
                } else {
                    cleanup(item.children);
                }
            });
        };
        cleanup(roots);
        return roots;
    };

    const treeData = buildCategoryTree(categories);

    const handleAdd = () => {
        setEditingCategory(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingCategory(record);
        form.setFieldsValue({
            name: record.name,
            parent_id: record.parent_id?._id || record.parent_id || null
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteCategory(id);
            if (res.success) {
                message.success('Xóa thành công');
                fetchCategories();
            } else {
                message.error(res.message || 'Lỗi khi xóa');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const payload = { ...values };
            if (editingCategory) {
                await updateCategory(editingCategory._id, payload);
                message.success('Cập nhật thành công');
            } else {
                await createCategory(payload);
                message.success('Thêm mới thành công');
            }
            setIsModalVisible(false);
            fetchCategories();
        } catch {
            message.error('Có lỗi xảy ra');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'category_id',
            key: 'category_id',
            width: 80,
            render: (id) => <span className="font-mono text-xs font-bold text-gray-500">#{id}</span>
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            className: 'font-semibold',
        },
        {
            title: 'Đường dẫn (Slug)',
            dataIndex: 'slug',
            key: 'slug',
            render: (slug) => <code className="text-xs bg-gray-100 px-1 rounded">{slug}</code>
        },
        {
            title: 'Danh mục cha',
            dataIndex: 'parent_id',
            key: 'parent_name',
            render: (parent) => parent ? <Tag color="blue">{parent.name}</Tag> : <Tag color="default">Gốc</Tag>
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button 
                        type="link" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEdit(record)}
                        className="p-0"
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa danh mục này?"
                        description="Bạn có chắc chắn muốn xóa danh mục này không?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button 
                            type="link" 
                            danger 
                            icon={<DeleteOutlined />}
                            className="p-0"
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="font-notoSerif text-2xl font-bold text-on-surface">Quản lý Danh mục</h2>
                    <p className="text-sm text-on-surface-variant">Phân loại sản phẩm theo cấp bậc cha - con</p>
                </div>
                <Button 
                    type="primary" 
                    className="bg-primary hover:opacity-90 flex items-center" 
                    size="large" 
                    onClick={handleAdd}
                    icon={<PlusOutlined />}
                >
                    Thêm danh mục
                </Button>
            </div>

            <Table 
                dataSource={treeData} 
                columns={columns} 
                rowKey="_id" 
                loading={loading}
                pagination={{ pageSize: 20 }}
                className="w-full"
                expandable={{ defaultExpandAllRows: true }}
            />

            <Modal
                title={
                    <div className="border-b pb-3 mb-4">
                        <span className="font-notoSerif text-xl font-bold">
                            {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                        </span>
                    </div>
                }
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={500}
                centered
            >
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={handleSubmit} 
                    className="mt-4"
                >
                    <Form.Item 
                        name="name" 
                        label={<span className="font-bold">Tên danh mục</span>} 
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                    >
                        <Input placeholder="Ví dụ: Áo thun, Quần Jean..." size="large" />
                    </Form.Item>

                    <Form.Item 
                        name="parent_id" 
                        label={<span className="font-bold">Danh mục cha</span>}
                        tooltip="Để trống nếu đây là danh mục gốc"
                    >
                        <Select 
                            placeholder="Chọn danh mục cha" 
                            size="large"
                            allowClear
                            showSearch
                            optionFilterProp="children"
                        >
                            {categories
                                .filter(cat => !editingCategory || cat._id !== editingCategory._id) // Không cho chọn chính mình làm cha
                                .map(cat => (
                                    <Select.Option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </Select.Option>
                                ))
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item className="mb-0 mt-8 text-right bg-gray-50 p-4 -mx-6 -mb-6 rounded-b-lg">
                        <Space>
                            <Button onClick={() => setIsModalVisible(false)} size="large">Hủy</Button>
                            <Button type="primary" htmlType="submit" className="bg-primary" size="large">
                                {editingCategory ? "Cập nhật" : "Tạo mới"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoriesManagement;
