import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimateWhenVisible from '../../helpers/animationScroll';
import useScrollToTop from '../../hooks/useScrollToTop';
import { message } from 'antd';

const Support = () => {
    useScrollToTop();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.message) {
            message.warning('Vui lòng điền đầy đủ các thông tin bắt buộc.');
            return;
        }

        const adminEmail = 'huynhkimtuyenphuyen@gmail.com';
        const mailtoLink = `mailto:${adminEmail}?subject=${encodeURIComponent(formData.subject || 'Yêu cầu hỗ trợ từ Atelier')}&body=${encodeURIComponent(`Họ tên: ${formData.name}\nEmail: ${formData.email}\n\nNội dung:\n${formData.message}`)}`;
        
        window.location.href = mailtoLink;
        message.success('Đang mở ứng dụng email để gửi yêu cầu...');
        
        // Reset form after a short delay
        setTimeout(() => {
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 1000);
    };

    const faqCategories = [
        {
            title: 'Mua hàng & Thanh toán',
            icon: 'payments',
            items: ['Phương thức thanh toán', 'Xác thực đơn hàng', 'Bảo mật thông tin']
        },
        {
            title: 'Vận chuyển & Giao hàng',
            icon: 'local_shipping',
            items: ['Thời gian giao hàng', 'Phí vận chuyển', 'Theo dõi đơn hàng']
        },
        {
            title: 'Đổi trả & Hoàn tiền',
            icon: 'assignment_return',
            items: ['Chính sách đổi trả', 'Quy trình hoàn tiền', 'Sản phẩm lỗi']
        },
        {
            title: 'Ký gửi Sản phẩm',
            icon: 'storefront',
            items: ['Quy trình ký gửi', 'Thanh toán ký gửi', 'Thẩm định chất lượng']
        }
    ];

    return (
        <div className="bg-[#fef9f7] font-manrope">
            {/* Hero Section */}
            <section className="pt-24 pb-20 px-6 md:px-12 bg-primary text-white text-center">
                <div className="max-w-4xl mx-auto">
                    <AnimateWhenVisible direction="fadeInUp">
                        <h1 className="font-notoSerif text-5xl md:text-6xl font-bold mb-6">Chúng tôi có thể giúp gì cho bạn?</h1>
                        <p className="text-lg opacity-80 max-w-2xl mx-auto">
                            Kết nối trực tiếp với đội ngũ chăm sóc khách hàng của Atelier để được hỗ trợ tốt nhất.
                        </p>
                    </AnimateWhenVisible>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AnimateWhenVisible direction="fadeInUp" delay={100}>
                        <div 
                            onClick={() => navigate('/chat')}
                            className="bg-white p-8 rounded-3xl shadow-lg border border-outline-variant/10 flex flex-col items-center text-center group cursor-pointer hover:-translate-y-2 transition-all"
                        >
                            <span className="material-symbols-outlined text-4xl text-primary mb-4 p-4 bg-primary/5 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">forum</span>
                            <h3 className="font-bold text-lg mb-2">Chat trực tiếp</h3>
                            <p className="text-sm text-on-surface-variant">Trao đổi trực tiếp với nhân viên hỗ trợ ngay bây giờ.</p>
                        </div>
                    </AnimateWhenVisible>

                    <AnimateWhenVisible direction="fadeInUp" delay={200}>
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-outline-variant/10 flex flex-col items-center text-center group cursor-pointer hover:-translate-y-2 transition-all">
                            <span className="material-symbols-outlined text-4xl text-primary mb-4 p-4 bg-primary/5 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">mail</span>
                            <h3 className="font-bold text-lg mb-2">Gửi Email</h3>
                            <p className="text-sm text-on-surface-variant">Gửi yêu cầu qua email và nhận phản hồi trong 24h.</p>
                        </div>
                    </AnimateWhenVisible>

                    <AnimateWhenVisible direction="fadeInUp" delay={300}>
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-outline-variant/10 flex flex-col items-center text-center group cursor-pointer hover:-translate-y-2 transition-all">
                            <span className="material-symbols-outlined text-4xl text-primary mb-4 p-4 bg-primary/5 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">call</span>
                            <h3 className="font-bold text-lg mb-2">Hotline 24/7</h3>
                            <p className="text-sm text-on-surface-variant">Gọi ngay 1900 6789 để được hỗ trợ khẩn cấp.</p>
                        </div>
                    </AnimateWhenVisible>
                </div>
            </section>

            {/* FAQ Categories */}
            <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
                <AnimateWhenVisible direction="fade" className="text-center mb-16">
                    <h2 className="font-notoSerif text-3xl font-bold mb-4">Câu hỏi thường gặp</h2>
                    <p className="text-on-surface-variant uppercase tracking-widest text-[10px] font-black">Khám phá theo chủ đề</p>
                </AnimateWhenVisible>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {faqCategories.map((cat, i) => (
                        <AnimateWhenVisible key={i} direction="fadeInUp" delay={i * 100}>
                            <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 h-full">
                                <span className="material-symbols-outlined text-3xl text-primary mb-6">{cat.icon}</span>
                                <h3 className="font-bold text-lg mb-6">{cat.title}</h3>
                                <ul className="space-y-4">
                                    {cat.items.map((item, idx) => (
                                        <li key={idx} className="text-sm text-on-surface-variant hover:text-primary cursor-pointer flex items-center justify-between group">
                                            {item}
                                            <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </AnimateWhenVisible>
                    ))}
                </div>
            </section>

            {/* Contact Form CTA */}
            <section className="py-32 bg-white border-t border-outline-variant/10">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <AnimateWhenVisible direction="slideFromLeft">
                        <h2 className="font-notoSerif text-4xl font-bold mb-6">Vẫn chưa tìm thấy điều bạn cần?</h2>
                        <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
                            Hãy để lại lời nhắn, đội ngũ chuyên gia của Atelier sẽ liên hệ và giải đáp mọi thắc mắc của bạn sớm nhất có thể.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-on-surface">
                                <span className="material-symbols-outlined text-primary">schedule</span>
                                <span className="font-bold text-sm">Thời gian làm việc: 08:00 - 22:00 hàng ngày</span>
                            </div>
                            <div className="flex items-center gap-4 text-on-surface">
                                <span className="material-symbols-outlined text-primary">location_on</span>
                                <span className="font-bold text-sm">123 Đường Sư Vạn Hạnh, Quận 10, TP. HCM</span>
                            </div>
                        </div>
                    </AnimateWhenVisible>

                    <AnimateWhenVisible direction="fadeInUp">
                        <div className="bg-surface-container-low p-10 rounded-[2.5rem] shadow-xl border border-outline-variant/10">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Họ và tên" 
                                        className="w-full bg-white rounded-xl px-5 py-4 outline-none border border-outline-variant/20 focus:border-primary transition-all" 
                                    />
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Email" 
                                        className="w-full bg-white rounded-xl px-5 py-4 outline-none border border-outline-variant/20 focus:border-primary transition-all" 
                                    />
                                </div>
                                <input 
                                    type="text" 
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    placeholder="Chủ đề" 
                                    className="w-full bg-white rounded-xl px-5 py-4 outline-none border border-outline-variant/20 focus:border-primary transition-all" 
                                />
                                <textarea 
                                    rows={4} 
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Nội dung lời nhắn..." 
                                    className="w-full bg-white rounded-xl px-5 py-4 outline-none border border-outline-variant/20 focus:border-primary transition-all resize-none"
                                ></textarea>
                                <button type="submit" className="w-full bg-primary text-white font-bold py-5 rounded-xl hover:bg-primary-container transition-all active:scale-[0.98]">Gửi yêu cầu</button>
                            </form>
                        </div>
                    </AnimateWhenVisible>
                </div>
            </section>
        </div>
    );
};

export default Support;
