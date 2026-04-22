import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Table, Button, Modal, Form, Input, Select, message, Tag, InputNumber, Upload, Space, Popconfirm
} from 'antd';
import { UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllProducts, getProductById, createProduct, updateProduct, updateProductStatus, deleteProduct, deleteProductImage } from '../../services/admin/products.service.jsx';
import { getAllCategories } from '../../services/admin/categories.service.jsx';
import { adminGet } from '../../untils/adminRequest.jsx';

const { TextArea, Search } = Input;

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
    const { role } = useSelector((state) => state.auth);
    const hasPerm = (perm) => role?.permissions?.includes('all') || role?.permissions?.includes(perm);

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

    // ─── Filter State ──────────────────────────────────────────
    const [filters, setFilters] = useState({
        q: '',
        status: undefined,
        categoryId: undefined,
        minPrice: undefined,
        maxPrice: undefined
    });

    // ─── Fetch ───────────────────────────────────────────────
    const fetchData = async (currentFilters = filters) => {
        try {
            setLoading(true);
            
            // Lọc bỏ các filter undefined/empty để gửi lên API
            const params = {};
            if (currentFilters.q) params.q = currentFilters.q;
            if (currentFilters.status) params.status = currentFilters.status;
            if (currentFilters.categoryId) params.categoryId = currentFilters.categoryId;
            if (currentFilters.minPrice) params.minPrice = currentFilters.minPrice;
            if (currentFilters.maxPrice) params.maxPrice = currentFilters.maxPrice;

            const [prodRes, catRes, brandRes] = await Promise.all([
                getAllProducts(params),
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

    // Trigger fetch khi filter (trừ search q) thay đổi trực tiếp
    useEffect(() => {
        fetchData();
    }, [filters.status, filters.categoryId, filters.minPrice, filters.maxPrice]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.q]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleResetFilters = () => {
        setFilters({
            q: '',
            status: undefined,
            categoryId: undefined,
            minPrice: undefined,
            maxPrice: undefined
        });
    };

    // ─── Mở modal Thêm ────────────────────────────────────────
    const handleAdd = () => {
        setEditingProduct(null);
        setUploadedImages([]);
        setExistingImages([]);
        setIsModalVisible(true);
    };

    // ─── Mở modal Sửa ─────────────────────────────────────────
    const handleEdit = async (record) => {
        setEditingProduct(record);
        setUploadedImages([]);

        // Lấy danh sách ảnh hiện tại (vẫn giữ ở đây để load async)
        try {
            const res = await getProductById(record._id);
            if (res.success) setExistingImages(res.data.images || []);
        } catch { setExistingImages([]); }

        setIsModalVisible(true);
    };

    // ─── Đồng bộ Form khi Modal mở ─────────────────────────────
    useEffect(() => {
        if (isModalVisible) {
            if (editingProduct) {
                form.setFieldsValue({
                    title: editingProduct.title,
                    description: editingProduct.description,
                    price: editingProduct.price,
                    originalPrice: editingProduct.originalPrice,
                    condition: editingProduct.condition,
                    size: editingProduct.size,
                    color: editingProduct.color,
                    material: editingProduct.material,
                    gender: editingProduct.gender,
                    stock: editingProduct.stock,
                    status: editingProduct.status,
                    listingType: editingProduct.listingType,
                    categoryId: editingProduct.categoryId?._id || editingProduct.categoryId,
                    brandId: editingProduct.brandId?._id || editingProduct.brandId,
                });
            } else {
                form.resetFields();
            }
        }
    }, [isModalVisible, editingProduct, form]);

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
                    // Nếu là brandId và đang dùng mode="tags", lấy phần tử đầu tiên
                    if (key === 'brandId' && Array.isArray(val)) {
                        formData.append(key, val[0]);
                    } else {
                        formData.append(key, val);
                    }
                }
            });

            // Thêm ảnh mới
            uploadedImages.forEach(({ file }) => {
                formData.append('images', file);
            });

            let res;
            if (editingProduct) {
                res = await updateProduct(editingProduct._id, formData);
            } else {
                res = await createProduct(formData);
            }

            if (res.success) {
                message.success(editingProduct ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm mới thành công!');
                setUploadedImages([]);
                setExistingImages([]);
                setIsModalVisible(false);
                fetchData();
            } else {
                message.error(res.message || 'Có lỗi xảy ra khi lưu sản phẩm');
            }
        } catch (error) {
            console.error('Submit error:', error);
            message.error('Lỗi kết nối server');
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
                        <Select.Option key={val} value={val}>
                            <Tag color={cfg.color} className="m-0">{cfg.label}</Tag>
                        </Select.Option>
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
                    {hasPerm('products_edit') && (
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            className="text-primary p-0"
                        />
                    )}
                    {hasPerm('products_delete') && (
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
                    )}
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
                {hasPerm('products_edit') && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        size="large"
                        className="bg-primary"
                    >
                        Thêm sản phẩm
                    </Button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="bg-surface-container-low p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-end border border-outline-variant/10">
                <div className="flex-1 min-w-[240px]">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Tìm kiếm</p>
                    <Search
                        placeholder="Tên sản phẩm hoặc mô tả..."
                        allowClear
                        value={filters.q}
                        onChange={(e) => handleFilterChange('q', e.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="w-36">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Trạng thái</p>
                    <Select
                        placeholder="Tất cả"
                        className="w-full"
                        allowClear
                        value={filters.status}
                        onChange={(val) => handleFilterChange('status', val)}
                    >
                        {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                            <Select.Option key={val} value={val}>{cfg.label}</Select.Option>
                        ))}
                    </Select>
                </div>

                <div className="w-44">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Danh mục</p>
                    <Select
                        placeholder="Tất cả danh mục"
                        className="w-full"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        value={filters.categoryId}
                        onChange={(val) => handleFilterChange('categoryId', val)}
                    >
                        {categories.map(c => (
                            <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>
                        ))}
                    </Select>
                </div>

                <div className="w-64">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Khoảng giá (VNĐ)</p>
                    <Space.Compact className="w-full">
                        <InputNumber
                            placeholder="Từ"
                            className="w-full"
                            min={0}
                            value={filters.minPrice}
                            onChange={(val) => handleFilterChange('minPrice', val)}
                            formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={v => v.replace(/,/g, '')}
                        />
                        <InputNumber
                            placeholder="Đến"
                            className="w-full"
                            min={0}
                            value={filters.maxPrice}
                            onChange={(val) => handleFilterChange('maxPrice', val)}
                            formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={v => v.replace(/,/g, '')}
                        />
                    </Space.Compact>
                </div>

                <Button onClick={handleResetFilters} className="mb-0.5">Đặt lại</Button>
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
                destroyOnHidden
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
                                {categories.map(c => <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>)}
                            </Select>
                        </Form.Item>

                        {/* Thương hiệu */}
                        <Form.Item label="Thương hiệu" name="brandId">
                            <Select 
                                placeholder="Chọn hoặc nhập thương hiệu mới" 
                                showSearch 
                                mode="tags"
                                maxCount={1}
                                optionFilterProp="children" 
                                allowClear
                            >
                                {brands.map(b => <Select.Option key={b._id} value={b._id}>{b.name}</Select.Option>)}
                            </Select>
                        </Form.Item>

                        {/* Tình trạng */}
                        <Form.Item label="Tình trạng" name="condition" rules={[{ required: true, message: 'Chọn tình trạng' }]}>
                            <Select placeholder="Chọn tình trạng">
                                {CONDITION_OPTIONS.map(o => <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>)}
                            </Select>
                        </Form.Item>

                        {/* Giới tính */}
                        <Form.Item label="Giới tính" name="gender">
                            <Select placeholder="Chọn giới tính">
                                <Select.Option value="male">Nam</Select.Option>
                                <Select.Option value="female">Nữ</Select.Option>
                                <Select.Option value="unisex">Unisex</Select.Option>
                                <Select.Option value="kids">Trẻ em</Select.Option>
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
                                <Select.Option value="direct_sale">Bán trực tiếp</Select.Option>
                                <Select.Option value="consignment">Ký gửi</Select.Option>
                                <Select.Option value="buyback">Mua lại</Select.Option>
                            </Select>
                        </Form.Item>

                        {/* Trạng thái */}
                        <Form.Item label="Trạng thái" name="status">
                            <Select>
                                {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                                    <Select.Option key={val} value={val}>{cfg.label}</Select.Option>
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
