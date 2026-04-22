import React, { useState, useRef, useEffect } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProtectedRoute from '../../components/checkLogin/ProtectedRoute';
// Thiết lập các hàm mô phỏng (mock) để chạy độc lập trong môi trường preview
// Removed local mock useNavigate to use the one from react-router-dom
import useScrollToTop from '../../hooks/useScrollToTop';
import AnimateWhenVisible from '../../helpers/animationScroll';
import { createConsignmentApi } from '../../services/consignment.service';
import { getAllCategories } from '../../services/category.service';
import { getAllBrands } from '../../services/brand.service';
import { getCookie } from '../../helpers/cookie';

const Consignment = () => {
    useScrollToTop();
    const navigate = useNavigate();

    // States quản lý luồng ký gửi
    const [step, setStep] = useState(1);

    // States lưu trữ thông tin thực tế từ người dùng
    const [uploadedFiles, setUploadedFiles] = useState([]); // Lưu file thật để gửi API
    const [previewUrls, setPreviewUrls] = useState([]); // Lưu URL tạm để hiển thị trên UI
    
    // Detailed fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [expectedPrice, setExpectedPrice] = useState('');
    const [condition, setCondition] = useState('excellent');
    const [categoryId, setCategoryId] = useState('');
    const [brandId, setBrandId] = useState('');
    const [gender, setGender] = useState('unisex');
    const [size, setSize] = useState('');
    const [color, setColor] = useState('');
    const [material, setMaterial] = useState('');

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Ref để trigger thẻ input file bị ẩn
    const fileInputRef = useRef(null);

    const userId = useSelector((state) => state.auth.userId);

    // Fetch data for dropdowns
    useEffect(() => {
        const fetchData = async () => {
            const [catRes, brandRes] = await Promise.all([
                getAllCategories(),
                getAllBrands()
            ]);
            if (catRes.success) setCategories(catRes.data || []);
            if (brandRes.success) setBrands(brandRes.data || []);
        };
        fetchData();
    }, []);

    // Dọn dẹp URL tạm thời khi component unmount để tránh rò rỉ bộ nhớ
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    // Xử lý khi người dùng chọn file
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Lưu file thật
        setUploadedFiles(prev => [...prev, ...files]);

        // Tạo URL xem trước cho các ảnh vừa chọn
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviews]);

        // Reset giá trị của input để có thể chọn lại cùng 1 file nếu cần
        e.target.value = '';
    };

    // Mở cửa sổ chọn file
    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    // Xóa ảnh đã chọn
    const handleRemoveImage = (indexToRemove) => {
        setUploadedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
        setPreviewUrls(prev => {
            const newUrls = prev.filter((_, index) => index !== indexToRemove);
            // Giải phóng bộ nhớ cho URL bị xóa
            URL.revokeObjectURL(prev[indexToRemove]);
            return newUrls;
        });
    };

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            submitConsignment();
        }
    };

    const submitConsignment = async () => {
        if (!title || !description || !categoryId || uploadedFiles.length === 0) {
            alert('Vui lòng điền đầy đủ thông tin (Tên, Mô tả, Danh mục) và tải ảnh.');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('condition', condition);
            formData.append('expectedPrice', expectedPrice || 0);
            formData.append('categoryId', categoryId);
            formData.append('brandId', brandId);
            formData.append('gender', gender);
            formData.append('size', size);
            formData.append('color', color);
            formData.append('material', material);
            
            uploadedFiles.forEach(file => {
                formData.append('images', file);
            });

            const res = await createConsignmentApi(formData);

            if (res && res.success) {
                message.success('Yêu cầu ký gửi đã được gửi thành công!');
                navigate('/dashboard', { state: { activeTab: 'consignor' } });
            } else {
                message.error('Lưu yêu cầu thất bại: ' + (res.message || 'Lỗi không xác định'));
            }
        } catch (error) {
            console.error("Lỗi gửi ký gửi", error);
            message.error('Có lỗi xảy ra kết nối server.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ProtectedRoute>
            <main className="flex-grow pt-32 pb-32 px-4 md:px-8 max-w-7xl mx-auto w-full font-manrope">
                {/* Progress Header */}
                <AnimateWhenVisible direction="fade" className="mb-12 text-center">
                    <h1 className="font-notoSerif text-4xl md:text-5xl font-bold tracking-tighter text-primary mb-4">Gửi Yêu cầu Ký gửi</h1>
                    <p className="text-on-surface-variant max-w-2xl mx-auto">
                        Bắt đầu bằng việc cung cấp hình ảnh chi tiết và thông tin tình trạng sản phẩm. Đội ngũ chuyên gia của chúng tôi sẽ thẩm định và gửi báo giá chính xác nhất đến bạn.
                    </p>
                </AnimateWhenVisible>

                {/* Stepper Component */}
                <AnimateWhenVisible direction="fadeInUp" className="mb-16 max-w-2xl mx-auto">
                    <div className="relative h-1 w-full bg-surface-container-high rounded-full overflow-hidden mb-6">
                        <div className={`absolute top-0 left-0 h-full bg-primary transition-all duration-700 ease-in-out`} style={{ width: `${(step / 3) * 100}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                        <span className={step >= 1 ? 'text-primary' : 'opacity-50'}>01 Hình ảnh & Tình trạng</span>
                        <span className={step >= 2 ? 'text-primary' : 'opacity-50'}>02 Thông tin chi tiết</span>
                        <span className={step >= 3 ? 'text-primary' : 'opacity-50'}>03 Xác nhận & Gửi kiện</span>
                    </div>
                </AnimateWhenVisible>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left Column: Form nhập liệu */}
                    <div className="lg:col-span-8 space-y-8">
                        {step === 1 && (
                            <AnimateWhenVisible direction="fadeInUp">
                                <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
                                    <div className="mb-8">
                                        <h2 className="font-notoSerif text-2xl font-bold mb-2">Hình ảnh sản phẩm</h2>
                                        <p className="text-sm text-on-surface-variant">Vui lòng tải lên các góc độ khác nhau: mặt trước, mặt sau, góc cạnh, nhãn mác thương hiệu và mã code (nếu có) để chúng tôi định giá tốt nhất.</p>
                                    </div>

                                    {/* Upload Zone */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        {/* Render danh sách ảnh đã chọn */}
                                        {previewUrls.map((imgUrl, index) => (
                                            <div key={index} className="aspect-square rounded-xl bg-surface-variant overflow-hidden relative group">
                                                <img alt={`Preview ${index}`} className="w-full h-full object-cover" src={imgUrl} />
                                                <div
                                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                    onClick={() => handleRemoveImage(index)}
                                                >
                                                    <span className="material-symbols-outlined text-white bg-error/80 rounded-full p-2">delete</span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Nút Upload và Input ẩn */}
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        {previewUrls.length < 8 && (
                                            <div
                                                onClick={handleUploadClick}
                                                className="aspect-square border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center text-center transition-colors hover:bg-surface-container-low cursor-pointer group"
                                            >
                                                <span className="material-symbols-outlined text-3xl text-primary mb-2 group-hover:scale-110 transition-transform">add_photo_alternate</span>
                                                <span className="text-xs font-medium text-on-surface-variant">Thêm ảnh</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Form Inputs */}
                                    <div className="space-y-4 pt-6 border-t border-outline-variant/20">
                                        <h2 className="font-notoSerif text-xl font-bold mb-4">Tình trạng hiện tại</h2>
                                        <div className="space-y-2">
                                            <select
                                                value={condition}
                                                onChange={(e) => setCondition(e.target.value)}
                                                className="w-full md:w-1/2 bg-surface-container-highest border-none rounded-xl py-4 px-5 text-on-surface focus:ring-1 focus:ring-primary/50 outline-none transition-all cursor-pointer"
                                            >
                                                <option value="perfect">Hoàn hảo (Mới tinh, chưa từng sử dụng)</option>
                                                <option value="excellent">Tuyệt vời (Sử dụng rất ít, không có vết xước rõ ràng)</option>
                                                <option value="very_good">Rất tốt (Sử dụng nhẹ, có vài vết xước hoặc mòn nhỏ)</option>
                                                <option value="good">Tốt (Sử dụng thường xuyên, có dấu hiệu mòn rõ rệt)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </AnimateWhenVisible>
                        )}

                        {step === 2 && (
                            <AnimateWhenVisible direction="fadeInUp">
                                <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10 space-y-6">
                                    <h2 className="font-notoSerif text-2xl font-bold mb-6">Thông tin chi tiết</h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-on-surface mb-2">Tên sản phẩm *</label>
                                            <input 
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="Ví dụ: Túi Chanel Boy Size M Black"
                                                className="w-full bg-surface-container-highest border-none rounded-xl py-4 px-5 text-on-surface focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-on-surface mb-2">Mô tả sản phẩm *</label>
                                            <textarea 
                                                rows={4}
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Mô tả về tình trạng chi tiết, phụ kiện đi kèm..."
                                                className="w-full bg-surface-container-highest border-none rounded-xl py-4 px-5 text-on-surface focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-on-surface mb-2">Danh mục *</label>
                                            <select 
                                                value={categoryId}
                                                onChange={(e) => setCategoryId(e.target.value)}
                                                className="w-full bg-surface-container-highest border-none rounded-xl py-4 px-5 text-on-surface focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                            >
                                                <option value="">Chọn danh mục</option>
                                                {categories.map(cat => (
                                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-on-surface mb-2">Thương hiệu</label>
                                            <select 
                                                value={brandId}
                                                onChange={(e) => setBrandId(e.target.value)}
                                                className="w-full bg-surface-container-highest border-none rounded-xl py-4 px-5 text-on-surface focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                            >
                                                <option value="">Chọn thương hiệu (nếu có)</option>
                                                {brands.map(brand => (
                                                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-on-surface mb-2">Giới tính</label>
                                            <select 
                                                value={gender}
                                                onChange={(e) => setGender(e.target.value)}
                                                className="w-full bg-surface-container-highest border-none rounded-xl py-4 px-5 text-on-surface focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                            >
                                                <option value="male">Nam</option>
                                                <option value="female">Nữ</option>
                                                <option value="unisex">Unisex</option>
                                                <option value="kids">Trẻ em</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-on-surface mb-2">Kích cỡ (Size)</label>
                                            <input 
                                                type="text"
                                                value={size}
                                                onChange={(e) => setSize(e.target.value)}
                                                placeholder="S, M, L, 38, 40..."
                                                className="w-full bg-surface-container-highest border-none rounded-xl py-4 px-5 text-on-surface focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-on-surface mb-2">Màu sắc</label>
                                            <input 
                                                type="text"
                                                value={color}
                                                onChange={(e) => setColor(e.target.value)}
                                                placeholder="Đen, Trắng, Đỏ..."
                                                className="w-full bg-surface-container-highest border-none rounded-xl py-4 px-5 text-on-surface focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-on-surface mb-2">Chất liệu</label>
                                            <input 
                                                type="text"
                                                value={material}
                                                onChange={(e) => setMaterial(e.target.value)}
                                                placeholder="Cotton, Lụa, Da..."
                                                className="w-full bg-surface-container-highest border-none rounded-xl py-4 px-5 text-on-surface focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-on-surface mb-2">Giá bạn kỳ vọng (VNĐ) *</label>
                                            <input 
                                                type="number"
                                                value={expectedPrice}
                                                onChange={(e) => setExpectedPrice(e.target.value)}
                                                placeholder="Ví dụ: 5000000"
                                                className="w-full bg-surface-container-highest border-none rounded-xl py-4 px-5 text-on-surface focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                            />
                                            <p className="text-[10px] text-on-surface-variant mt-2 italic">* Đây là mức giá bạn mong muốn nhận được. Shop sẽ thẩm định và đưa báo giá cuối cùng.</p>
                                        </div>
                                    </div>
                                </div>
                            </AnimateWhenVisible>
                        )}

                        {step === 3 && (
                            <AnimateWhenVisible direction="fadeInUp">
                                <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
                                    <h2 className="font-notoSerif text-2xl font-bold mb-6 text-center">Xác nhận thông tin</h2>
                                    
                                    <div className="space-y-6">
                                        <div className="flex gap-4 p-4 bg-surface-container-low rounded-xl">
                                            <img src={previewUrls[0]} className="w-20 h-24 object-cover rounded-lg shadow-sm" alt="main" />
                                            <div>
                                                <h3 className="font-bold text-lg">{title || 'Chưa đặt tên'}</h3>
                                                <p className="text-sm text-on-surface-variant line-clamp-1">{description || 'Chưa có mô tả'}</p>
                                                <p className="text-xs font-bold text-primary mt-2">Giá kỳ vọng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(expectedPrice || 0)}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="p-4 rounded-xl border border-outline-variant/20">
                                                <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Danh mục</p>
                                                <p className="text-sm font-bold">{categories.find(c => c._id === categoryId)?.name || 'N/A'}</p>
                                            </div>
                                            <div className="p-4 rounded-xl border border-outline-variant/20">
                                                <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Thương hiệu</p>
                                                <p className="text-sm font-bold">{brands.find(b => b._id === brandId)?.name || 'N/A'}</p>
                                            </div>
                                            <div className="p-4 rounded-xl border border-outline-variant/20">
                                                <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Tình trạng</p>
                                                <p className="text-sm font-bold">
                                                    {condition === 'perfect' ? 'Hoàn hảo' : condition === 'excellent' ? 'Tuyệt vời' : condition === 'very_good' ? 'Rất tốt' : 'Tốt'}
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-xl border border-outline-variant/20">
                                                <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Giới tính</p>
                                                <p className="text-sm font-bold uppercase">{gender}</p>
                                            </div>
                                            <div className="p-4 rounded-xl border border-outline-variant/20">
                                                <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Size / Màu</p>
                                                <p className="text-sm font-bold">{size || 'N/A'} / {color || 'N/A'}</p>
                                            </div>
                                            <div className="p-4 rounded-xl border border-outline-variant/20">
                                                <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Hình ảnh</p>
                                                <p className="text-sm font-bold">{uploadedFiles.length} tập tin đã tải</p>
                                            </div>
                                        </div>

                                        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                                            <p className="text-sm leading-relaxed text-on-surface-variant text-center">
                                                Khi nhấn <strong>Hoàn tất</strong>, yêu cầu của bạn sẽ được gửi tới đội ngũ thẩm định. Chúng tôi sẽ phản hồi lại mức giá đề xuất trong vòng 24h qua trang Dashboard.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </AnimateWhenVisible>
                        )}
                    </div>

                    {/* Right Column: Information & Summary Sidebar */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
                        <AnimateWhenVisible direction="slideFromRight">
                            <div className="bg-surface-container-low rounded-2xl p-8 border border-white/50 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full z-0"></div>

                                <h3 className="font-notoSerif text-xl font-bold mb-6 relative z-10">Tiến trình Ký gửi</h3>

                                <div className="space-y-6 relative z-10">
                                    {/* Trạng thái số lượng ảnh */}
                                    <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
                                        <span className="text-sm text-on-surface-variant">Hình ảnh tải lên</span>
                                        <span className="font-bold text-primary">{previewUrls.length} ảnh</span>
                                    </div>

                                    {/* Thông tin quy trình */}
                                    <div className="bg-surface-container-highest/50 p-5 rounded-xl">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Quy trình thẩm định</h4>
                                        <ul className="space-y-3 text-sm text-on-surface-variant">
                                            <li className="flex gap-3">
                                                <span className="material-symbols-outlined text-primary text-[18px]">photo_camera</span>
                                                Cung cấp hình ảnh và mô tả tình trạng.
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="material-symbols-outlined text-primary text-[18px]">price_check</span>
                                                Nhận báo giá dự kiến từ chuyên gia trong 24h.
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="material-symbols-outlined text-primary text-[18px]">local_shipping</span>
                                                Gửi sản phẩm đến trung tâm để xác thực vật lý.
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-8 relative z-10">
                                    <button
                                        onClick={handleNext}
                                        disabled={previewUrls.length === 0 || submitting}
                                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md ${previewUrls.length > 0 && !submitting ? 'bg-primary text-white hover:bg-primary-container active:scale-95' : 'bg-surface-variant text-on-surface-variant/40 cursor-not-allowed'}`}
                                    >
                                        {submitting ? 'Đang gửi...' : (step === 3 ? 'Hoàn tất Ký gửi' : 'Tiếp tục Bước tiếp theo')}
                                    </button>
                                    {previewUrls.length === 0 && step === 1 && (
                                        <p className="text-center text-[10px] text-error mt-3">* Vui lòng tải lên ít nhất 1 ảnh để tiếp tục</p>
                                    )}
                                    {step > 1 && !submitting && (
                                        <button onClick={() => setStep(step - 1)} className="w-full mt-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors">Quay lại</button>
                                    )}
                                </div>
                            </div>
                        </AnimateWhenVisible>

                        {/* Assistance Card */}
                        <AnimateWhenVisible direction="fadeInUp">
                            <div className="bg-[#f0ddc3] rounded-2xl p-6 flex gap-4 items-center">
                                <span className="material-symbols-outlined text-secondary text-2xl">support_agent</span>
                                <div>
                                    <p className="text-sm font-bold text-on-secondary-container">Cần Hỗ trợ?</p>
                                    <p className="text-xs text-on-secondary-container/80 mt-1">Liên hệ với chuyên viên của chúng tôi qua Hotline nếu bạn gặp khó khăn khi upload ảnh.</p>
                                </div>
                            </div>
                        </AnimateWhenVisible>
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
};

export default Consignment;