import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimateWhenVisible from '../../helpers/animationScroll';
import { createConsignmentApi } from '../../services/consignment.service';
import { getCookie } from '../../helpers/cookie';
import useScrollToTop from '../../hooks/useScrollToTop';

const Consignment = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [fileUploaded, setFileUploaded] = useState(false);
    const userId = getCookie('userId') || localStorage.getItem('userId') || '66bb1f9d506a73c1d51ab4cd';

    const handleUpload = () => {
        // Giả lập upload ảnh
        setTimeout(() => setFileUploaded(true), 500);
    }

    const nextStep = async () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            // Gửi API ký gửi
            try {
                const res = await createConsignmentApi({
                    userId: userId,
                    productName: "Túi Đeo Vai Nhỏ Gucci Jackie 1961",
                    expectedPrice: 34000000,
                    condition: "Tuyệt vời",
                    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDgJWym8WZkFa0jiS9r5izeyTjHXGpiRVQWH6goEjP4_tuKJkJNnkU0kAiu0TQ9DgLicLL9T4oLOyXniZIR1-YxGONL7YVnKsUSbToJfcQPtJbIH6cCfPolY4XMgdivsSyPws7eIJ3Z3xJ40WhxPQ3J3WENGm7Q2YKw5nSc2YmgLKOuk8E3ZigWEybWwVlO0jGX0fNCPt0ACWuZIiL5l4jzwVaO4TZ-TlIXytJWmC1kU_M1oviwuY8EK6OSPzTn4_LJF2HhcYixb1BB"]
                });
                if (res && res.success) {
                    alert('Yêu cầu ký gửi đã được gửi thành công!');
                    navigate('/dashboard');
                } else {
                    alert('Lưu yêu cầu thất bại');
                }
            } catch (error) {
                console.error("Lỗi gửi ký gửi", error);
            }
        }
    }

    return (
        <main className="flex-grow pt-32 pb-32 px-4 md:px-8 max-w-7xl mx-auto w-full font-manrope">
            {/* Progress Header */}
            <AnimateWhenVisible direction="fade" className="mb-12 text-center">
                <h1 className="font-notoSerif text-4xl md:text-5xl font-bold tracking-tighter text-primary mb-4">Ký gửi Sản phẩm của bạn</h1>
                <p className="text-on-surface-variant max-w-md mx-auto">
                    Biến những món đồ xa xỉ đã qua sử dụng của bạn thành những câu chuyện mới. Cổng thông tin hỗ trợ bởi AI của chúng tôi đảm bảo giá trị công bằng và dịch vụ hậu cần liền mạch.
                </p>
            </AnimateWhenVisible>

            {/* Stepper Component */}
            <AnimateWhenVisible direction="fadeInUp" className="mb-16 max-w-2xl mx-auto">
                <div className="relative h-1 w-full bg-surface-container-high rounded-full overflow-hidden mb-6">
                    <div className={`absolute top-0 left-0 h-full bg-primary transition-all duration-700 ease-in-out`} style={{width: `${(step / 3) * 100}%`}}></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                    <span className={step >= 1 ? 'text-primary' : 'opacity-50'}>01 Định danh</span>
                    <span className={step >= 2 ? 'text-primary' : 'opacity-50'}>02 Thông tin</span>
                    <span className={step >= 3 ? 'text-primary' : 'opacity-50'}>03 Gửi kiện</span>
                </div>
            </AnimateWhenVisible>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Left Column */}
                <div className="lg:col-span-7 space-y-8">
                    <AnimateWhenVisible direction="fadeInUp">
                        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="bg-primary-fixed text-on-primary-fixed p-3 rounded-full">
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                </div>
                                <div>
                                    <h2 className="font-notoSerif text-xl font-bold">Phân tích Hình ảnh bằng AI</h2>
                                    <p className="text-sm text-on-surface-variant">Tải lên ảnh rõ nét của nhãn mác và chi tiết sản phẩm.</p>
                                </div>
                            </div>

                            {/* Upload Zone */}
                            {!fileUploaded ? (
                                <div onClick={handleUpload} className="border-2 border-dashed border-outline-variant rounded-xl p-12 text-center hover:bg-surface-container-low transition-colors cursor-pointer group mb-8">
                                    <span className="material-symbols-outlined text-4xl text-primary mb-4 group-hover:scale-110 transition-transform">add_a_photo</span>
                                    <p className="font-medium text-on-surface">Nhấn để tải ảnh lên (hoặc kéo thả)</p>
                                    <p className="text-xs text-on-surface-variant mt-2">Hỗ trợ HEIC, JPG, PNG độ phân giải cao</p>
                                </div>
                            ) : (
                                <div className="bg-surface-container-low rounded-lg p-6 flex flex-col md:flex-row gap-6 items-center mb-8">
                                    <div className="w-24 h-24 rounded-lg bg-surface-variant overflow-hidden flex-shrink-0 relative group">
                                        <img alt="Detected Item" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgJWym8WZkFa0jiS9r5izeyTjHXGpiRVQWH6goEjP4_tuKJkJNnkU0kAiu0TQ9DgLicLL9T4oLOyXniZIR1-YxGONL7YVnKsUSbToJfcQPtJbIH6cCfPolY4XMgdivsSyPws7eIJ3Z3xJ40WhxPQ3J3WENGm7Q2YKw5nSc2YmgLKOuk8E3ZigWEybWwVlO0jGX0fNCPt0ACWuZIiL5l4jzwVaO4TZ-TlIXytJWmC1kU_M1oviwuY8EK6OSPzTn4_LJF2HhcYixb1BB" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setFileUploaded(false)}>
                                            <span className="material-symbols-outlined text-white">close</span>
                                        </div>
                                    </div>
                                    <div className="flex-grow space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="bg-tertiary-container text-on-tertiary-container text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">Khớp 98%</span>
                                            <span className="bg-primary-fixed text-on-primary-fixed text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">Đã Xác minh Thương hiệu</span>
                                        </div>
                                        <h3 className="font-notoSerif text-lg font-bold">Túi Đeo Vai Nhỏ Gucci Jackie 1961</h3>
                                        <div className="flex gap-4 text-sm text-on-surface-variant">
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">category</span> Túi xách</span>
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">palette</span> Xanh rêu xám</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Form Inputs */}
                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-500 ${fileUploaded ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Tình trạng</label>
                                    <select className="w-full bg-surface-container-highest border-none rounded-xl py-4 px-5 text-on-surface focus:ring-1 focus:ring-primary/50 outline-none">
                                        <option>Hoàn hảo (Chưa từng đeo)</option>
                                        <option>Tuyệt vời (Hiếm khi sử dụng)</option>
                                        <option>Rất tốt (Mòn nhẹ)</option>
                                        <option>Tốt (Mòn rõ rệt)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Phụ kiện đính kèm</label>
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-primary text-on-primary py-4 rounded-xl font-bold text-sm">Có Dustbag</button>
                                        <button className="flex-1 bg-surface-container-highest text-on-surface-variant py-4 rounded-xl font-bold text-sm">Không hộp</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AnimateWhenVisible>

                    {/* Assistance Card */}
                    <AnimateWhenVisible direction="fadeInUp">
                        <div className="bg-[#f0ddc3] rounded-2xl p-6 flex gap-4 items-center mb-8">
                            <span className="material-symbols-outlined text-secondary text-2xl">support_agent</span>
                            <div>
                                <p className="text-sm font-bold text-on-secondary-container">Cần Dịch vụ Lấy hàng Tận nơi?</p>
                                <p className="text-xs text-on-secondary-container/80 mt-1">Đội ngũ chuyên gia của chúng tôi có thể đến tận nơi với những bộ sưu tập giá trị cao.</p>
                            </div>
                        </div>
                    </AnimateWhenVisible>
                </div>

                {/* Right Column: Contextual Valuation Sidebar */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
                    <AnimateWhenVisible direction="slideFromRight">
                        <div className="bg-surface-container-low rounded-2xl p-8 border border-white/50 shadow-sm relative overflow-hidden">
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full"></div>
                            
                            <h3 className="font-notoSerif text-xl font-bold mb-6 relative z-10">Định giá Dự kiến</h3>
                            <div className="space-y-8 relative z-10">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm text-on-surface-variant">Biên độ giá</span>
                                        <span className="text-3xl font-bold text-primary">31.0M — 37.0M đ</span>
                                    </div>
                                    <div className="h-2 w-full bg-surface-container-high rounded-full relative mt-4">
                                        <div className="absolute left-[60%] top-[-4px] w-4 h-4 bg-primary border-[3px] border-white rounded-full shadow-sm"></div>
                                        <div className="h-full w-2/3 bg-primary-container/60 rounded-full"></div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary mt-1">trending_up</span>
                                        <div>
                                            <p className="text-sm font-bold">Nhu cầu Thị trường Cao</p>
                                            <p className="text-xs text-on-surface-variant mt-1">Mẫu túi này đang là xu hướng với giá trị bán lại tăng 15% trong quý này.</p>
                                        </div>
                                    </div>
                                    <div className="bg-surface-container-highest/50 p-4 rounded-xl mt-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tác động Sinh thái</span>
                                            <span className="bg-tertiary text-white text-[10px] px-2 py-0.5 rounded-full">Chứng nhận</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm shrink-0">
                                                <span className="material-symbols-outlined text-lg">eco</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">Tiết kiệm: 14.5kg CO2</p>
                                                <p className="text-xs text-on-surface-variant">Tương đương với việc trồng 2 cây xanh trồng trong đô thị.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button onClick={nextStep} disabled={!fileUploaded} className={`w-full mt-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md ${fileUploaded ? 'bg-primary text-white hover:bg-primary-container active:scale-95' : 'bg-surface-variant text-on-surface-variant/40 cursor-not-allowed'}`}>
                                {step === 3 ? 'Hoàn tất Ký gửi' : 'Tiếp tục bước Vận chuyển'}
                            </button>
                            <p className="text-center text-[9px] text-on-surface-variant uppercase tracking-widest mt-4">Giá cả dựa trên dữ liệu thị trường trực tiếp</p>
                        </div>
                    </AnimateWhenVisible>
                </div>
            </div>
        </main>
    );
};

export default Consignment;
