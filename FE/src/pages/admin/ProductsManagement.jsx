import React, { useState, useEffect } from 'react';
import {
    Table, Button, Modal, Form, Input, Select, message, Tag, InputNumber, Upload, Space, Popconfirm
} from 'antd';
import { UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllProducts, getProductById, createProduct, updateProduct, updateProductStatus, deleteProduct, deleteProductImage } from '../../services/admin/products.service.jsx';
import { getAllCategories } from '../../services/admin/categories.service.jsx';
import { adminGet } from '../../untils/adminRequest.jsx';

const { TextArea } = Input;

const STATUS_CONFIG = {
    draft: { color: 'default', label: 'Nháp' },
    pending: { color: 'orange', label: 'Chờ duyệt' },
    active: { color: 'green', label: 'Đang bán' },
    sold: { color: 'blue', label: 'Đã bán' },
    rejected: { color: 'red', label: 'Từ chối' },
    archived: { color: 'gray', label: 'Lưu kho' },
};

const CONDITION_OPTIONS = [
    { value: 'new', label: 'Mới' },
    { value: 'like_new', label: 'Như mới' },
    { value: 'good', label: 'Tốt' },
    { value: 'fair', label: 'Khá' },
    { value: 'poor', label: 'Cũ' },
];

const ProductsManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [uploadedImages, setUploadedImages] = useState([]); // [{file, preview}]
    const [existingImages, setExistingImages] = useState([]); // từ DB khi edit
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    // ─── Fetch ───────────────────────────────────────────────
    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes, brandRes] = await Promise.all([
                getAllProducts(),
                getAllCategories(),
                adminGet('/brands')
            ]);
            if (prodRes.success) setProducts(prodRes.data);
            if (catRes.success) setCategories(catRes.data);
            if (brandRes.success) setBrands(brandRes.data);
        } catch {
            message.error('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // ─── Mở modal Thêm ────────────────────────────────────────
    const handleAdd = () => {
        setEditingProduct(null);
        setUploadedImages([]);
        setExistingImages([]);
        form.resetFields();
        setIsModalVisible(true);
    };

    // ─── Mở modal Sửa ─────────────────────────────────────────
    const handleEdit = async (record) => {
        setEditingProduct(record);
        setUploadedImages([]);
        form.setFieldsValue({
            title: record.title,
            description: record.description,
            price: record.price,
            originalPrice: record.originalPrice,
            condition: record.condition,
            size: record.size,
            color: record.color,
            material: record.material,
            gender: record.gender,
            stock: record.stock,
            status: record.status,
            listingType: record.listingType,
            categoryId: record.categoryId?._id || record.categoryId,
            brandId: record.brandId?._id || record.brandId,
        });

        // Lấy danh sách ảnh hiện tại
        try {
            const res = await getProductById(record._id);
            if (res.success) setExistingImages(res.data.images || []);
        } catch { setExistingImages([]); }

        setIsModalVisible(true);
    };

    // ─── Xử lý file upload local (chưa gửi BE) ────────────────
    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) { message.error('Chỉ chấp nhận file ảnh!'); return false; }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) { message.error('Ảnh phải nhỏ hơn 5MB!'); return false; }

        const preview = URL.createObjectURL(file);
        setUploadedImages(prev => [...prev, { file, preview }]);
        return false; // Ngăn tự động upload của antd
    };

    const removeUploadedImage = (index) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = async (imageId) => {
        try {
            await deleteProductImage(imageId);
            setExistingImages(prev => prev.filter(img => img._id !== imageId));
            message.success('Đã xóa ảnh');
        } catch {
            message.error('Lỗi khi xóa ảnh');
        }
    };

    // ─── Submit form ──────────────────────────────────────────
    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            const formData = new FormData();

            // Thêm các trường dữ liệu
            Object.entries(values).forEach(([key, val]) => {
                if (val !== undefined && val !== null && val !== '') {
                    formData.append(key, val);
                }
            });

            // Thêm ảnh mới
            uploadedImages.forEach(({ file }) => {
                formData.append('images', file);
            });

            let res;
            if (editingProduct) {
                res = await updateProduct(editingProduct._id, formData);
                message.success('Cập nhật sản phẩm thành công!');
            } else {
                res = await createProduct(formData);
                message.success('Thêm sản phẩm mới thành công!');
            }

            setIsModalVisible(false);
            fetchData();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Xóa sản phẩm ─────────────────────────────────────────
    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            message.success('Đã xóa sản phẩm');
            fetchData();
        } catch {
            message.error('Lỗi khi xóa sản phẩm');
        }
    };

    // ─── Đổi trạng thái nhanh ─────────────────────────────────
    const handleStatusChange = async (id, status) => {
        try {
            await updateProductStatus(id, status);
            message.success('Cập nhật trạng thái thành công');
            fetchData();
        } catch {
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    // ─── Columns ──────────────────────────────────────────────
    const columns = [
        {
            title: 'Sản phẩm',
            key: 'product',
            width: 280,
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    {record.mainImage ? (
                        <img src={record.mainImage} alt={record.title} className="w-12 h-14 object-cover rounded-lg shadow-sm flex-shrink-0" />
                    ) : (
                        <div className="w-12 h-14 bg-surface-container rounded-lg flex items-center justify-center text-outline flex-shrink-0">
                            <span className="material-symbols-outlined text-sm">image</span>
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="font-semibold text-on-surface text-sm line-clamp-2 leading-tight">{record.title}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{record.condition && CONDITION_OPTIONS.find(c => c.value === record.condition)?.label}</p>
                    </div>
                </div>
            )
        },
        {
            title: 'Danh mục',
            key: 'category',
            render: (_, r) => r.categoryId?.name || 'N/A'
        },
        {
            title: 'Thương hiệu',
            key: 'brand',
            render: (_, r) => r.brandId?.name || 'N/A'
        },
        {
            title: 'Giá bán',
            dataIndex: 'price',
            key: 'price',
            render: (price) => price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price) : '—'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <Select
                    value={status}
                    onChange={(val) => handleStatusChange(record._id, val)}
                    style={{ width: 130 }}
                    size="small"
                >
                    {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                        <Option key={val} value={val}>
                            <Tag color={cfg.color} className="m-0">{cfg.label}</Tag>
                        </Option>
                    ))}
                </Select>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        className="text-primary p-0"
                    />
                    <Popconfirm
                        title="Xóa sản phẩm?"
                        description="Hành động này không thể hoàn tác và sẽ xóa tất cả ảnh."
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="link" icon={<DeleteOutlined />} danger className="p-0" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="font-notoSerif text-2xl font-bold text-on-surface">Quản lý Sản phẩm</h2>
                    <p className="text-sm text-on-surface-variant">Tổng cộng {products.length} sản phẩm</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    size="large"
                    className="bg-primary"
                >
                    Thêm sản phẩm
                </Button>
            </div>

            {/* Table */}
            <Table
                dataSource={products}
                columns={columns}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            {/* Modal Thêm / Sửa */}
            <Modal
                title={
                    <h3 className="font-notoSerif text-xl font-bold">
                        {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </h3>
                }
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={780}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
                    <div className="grid grid-cols-2 gap-x-4">
                        {/* Tên sản phẩm */}
                        <Form.Item
                            label="Tên sản phẩm"
                            name="title"
                            className="col-span-2"
                            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                        >
                            <Input placeholder="Áo len cashmere vintage..." />
                        </Form.Item>

                        {/* Mô tả */}
                        <Form.Item label="Mô tả" name="description" className="col-span-2">
                            <TextArea rows={3} placeholder="Mô tả chi tiết về sản phẩm..." />
                        </Form.Item>

                        {/* Giá bán */}
                        <Form.Item
                            label="Giá bán (VNĐ)"
                            name="price"
                            rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                        >
                            <InputNumber
                                className="w-full"
                                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={v => v.replace(/,/g, '')}
                                placeholder="350,000"
                                min={0}
                            />
                        </Form.Item>

                        {/* Giá gốc */}
                        <Form.Item label="Giá gốc (VNĐ)" name="originalPrice">
                            <InputNumber
                                className="w-full"
                                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={v => v.replace(/,/g, '')}
                                placeholder="700,000"
                                min={0}
                            />
                        </Form.Item>

                        {/* Danh mục */}
                        <Form.Item label="Danh mục" name="categoryId" rules={[{ required: true, message: 'Chọn danh mục' }]}>
                            <Select placeholder="Chọn danh mục" showSearch optionFilterProp="children">
                                {categories.map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
                            </Select>
                        </Form.Item>

                        {/* Thương hiệu */}
                        <Form.Item label="Thương hiệu" name="brandId">
                            <Select placeholder="Chọn thương hiệu" showSearch optionFilterProp="children" allowClear>
                                {brands.map(b => <Option key={b._id} value={b._id}>{b.name}</Option>)}
                            </Select>
                        </Form.Item>

                        {/* Tình trạng */}
                        <Form.Item label="Tình trạng" name="condition" rules={[{ required: true, message: 'Chọn tình trạng' }]}>
                            <Select placeholder="Chọn tình trạng">
                                {CONDITION_OPTIONS.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
                            </Select>
                        </Form.Item>

                        {/* Giới tính */}
                        <Form.Item label="Giới tính" name="gender">
                            <Select placeholder="Chọn giới tính">
                                <Option value="male">Nam</Option>
                                <Option value="female">Nữ</Option>
                                <Option value="unisex">Unisex</Option>
                                <Option value="kids">Trẻ em</Option>
                            </Select>
                        </Form.Item>

                        {/* Size */}
                        <Form.Item label="Size" name="size">
                            <Input placeholder="XS, S, M, L, XL, 38, 40..." />
                        </Form.Item>

                        {/* Màu sắc */}
                        <Form.Item label="Màu sắc" name="color">
                            <Input placeholder="Đen, Trắng, Xanh navy..." />
                        </Form.Item>

                        {/* Chất liệu */}
                        <Form.Item label="Chất liệu" name="material">
                            <Input placeholder="Cotton, Cashmere, Linen..." />
                        </Form.Item>

                        {/* Số lượng */}
                        <Form.Item label="Số lượng tồn kho" name="stock">
                            <InputNumber className="w-full" min={0} placeholder="1" />
                        </Form.Item>

                        {/* Loại niêm yết */}
                        <Form.Item label="Loại niêm yết" name="listingType">
                            <Select placeholder="Chọn loại">
                                <Option value="direct_sale">Bán trực tiếp</Option>
                                <Option value="consignment">Ký gửi</Option>
                                <Option value="buyback">Mua lại</Option>
                            </Select>
                        </Form.Item>

                        {/* Trạng thái */}
                        <Form.Item label="Trạng thái" name="status">
                            <Select>
                                {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                                    <Option key={val} value={val}>{cfg.label}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    {/* ─── Upload ảnh ─────────────────────────────── */}
                    <Form.Item label="Ảnh sản phẩm">
                        {/* Ảnh hiện tại (khi edit) */}
                        {existingImages.length > 0 && (
                            <div className="mb-3">
                                <p className="text-xs text-on-surface-variant mb-2 font-medium uppercase tracking-wider">Ảnh hiện tại</p>
                                <div className="flex flex-wrap gap-2">
                                    {existingImages.map(img => (
                                        <div key={img._id} className="relative group">
                                            <img
                                                src={img.imageUrl}
                                                alt="product"
                                                className="w-20 h-24 object-cover rounded-lg border border-outline-variant/20"
                                            />
                                            {img.isPrimary && (
                                                <span className="absolute top-1 left-1 bg-primary text-white text-[9px] px-1 rounded font-bold">CHÍNH</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(img._id)}
                                                className="absolute top-1 right-1 w-5 h-5 bg-error text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Ảnh mới chọn thêm */}
                        {uploadedImages.length > 0 && (
                            <div className="mb-3">
                                <p className="text-xs text-on-surface-variant mb-2 font-medium uppercase tracking-wider">Ảnh mới sẽ upload</p>
                                <div className="flex flex-wrap gap-2">
                                    {uploadedImages.map((img, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={img.preview}
                                                alt={`new-${index}`}
                                                className="w-20 h-24 object-cover rounded-lg border-2 border-primary/40"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeUploadedImage(index)}
                                                className="absolute top-1 right-1 w-5 h-5 bg-error text-white rounded-full text-xs flex items-center justify-center"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Upload
                            beforeUpload={beforeUpload}
                            multiple
                            accept="image/*"
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />} className="mt-1">
                                Chọn ảnh từ máy tính
                            </Button>
                        </Upload>
                        <p className="text-xs text-on-surface-variant mt-1">Ảnh đầu tiên sẽ là ảnh đại diện. Tối đa 10 ảnh, mỗi ảnh dưới 5MB.</p>
                    </Form.Item>

                    {/* Nút submit */}
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant/10">
                        <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            className="bg-primary"
                        >
                            {editingProduct ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductsManagement;
