import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimateWhenVisible from '../../helpers/animationScroll';
import useScrollToTop from '../../hooks/useScrollToTop';

const Sustain = () => {
    useScrollToTop();
    const navigate = useNavigate();

    return (
        <main className="pt-10 md:pt-24 pb-32">
            {/* Hero Section */}
            <AnimateWhenVisible direction="fadeInDown">
                <section className="px-6 md:px-12 lg:px-24 mb-24">
                    <div className="max-w-4xl">
                        <span className="font-manrope text-xs uppercase tracking-[0.3em] text-primary mb-6 block">Cam kết của chúng tôi</span>
                        <h1 className="font-notoSerif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-on-surface mb-8 leading-[0.9]">
                            Nghệ thuật <br />
                            <span className="italic text-primary">Xác thực</span>
                        </h1>
                        <p className="font-manrope text-lg md:text-xl text-on-surface-variant max-w-2xl leading-relaxed">
                            Mỗi sản phẩm đến với Atelier đều trải qua quy trình xác minh đa giai đoạn nghiêm ngặt. Chúng tôi không chỉ kiểm tra nhãn mác; chúng tôi bảo tồn giá trị tinh hoa của sự chế tác thủ công.
                        </p>
                    </div>
                </section>
            </AnimateWhenVisible>

            {/* Video/Visual Bento Grid */}
            <AnimateWhenVisible direction="fadeInUp">
                <section className="px-6 md:px-12 lg:px-24 mb-32">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Main Feature: The Expert Eye */}
                        <div className="md:col-span-8 bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm relative group">
                            <img className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105" alt="close-up of a specialist in white gloves examining the stitching of a vintage leather luxury handbag with a magnifying lens" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJeHNf5J1Lk3qDlDkHdtsf4UiJ_aSxitcwfkaxRqJ3UkCClLkUQz5qCWLa9lBz1Sc9CUC1dJVNUFHhr7V8a9RnpcweY4-x7Fh9Dv9FNozJB_EC2WokG4bb7ce3CztdmZuCpMdSc28iLTd5zSD-VXTWpfVVD-togdturE3dP3Mn8DC4WqBFAiMSCxMJKt7gFAgQpTa1Z2CVJdidtZ0XFIOoKpa0OqcxUzSeH2NJKJrd0y2Xtoe_qJs8FFbnqyJIWHXazIq0SfIkV2iH" />
                            <div className="absolute inset-0 bg-gradient-to-t from-on-background/60 to-transparent flex flex-col justify-end p-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="material-symbols-outlined text-white text-4xl" data-icon="play_circle" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                                    <span className="text-white font-manrope font-semibold tracking-widest uppercase text-xs">Xem: Quy trình Kiểm tra Từng đường kim</span>
                                </div>
                            </div>
                        </div>
                        {/* Secondary Feature: Microscopic Detail */}
                        <div className="md:col-span-4 bg-tertiary-container/10 rounded-xl p-8 flex flex-col justify-between">
                            <div>
                                <div className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block mb-6">Độ chính xác đã được chứng minh</div>
                                <h3 className="font-notoSerif text-3xl font-bold leading-tight mb-4">Xác minh Thủ công</h3>
                                <p className="font-manrope text-sm text-on-surface-variant leading-relaxed">Các chuyên gia của chúng tôi đánh giá mật độ vân, trọng lượng phần cứng và thành phần hóa học của thuốc nhuộm để đảm bảo từng sợi chỉ đều là hàng thật.</p>
                            </div>
                            <img className="w-full h-48 object-cover rounded-lg mt-8" alt="microscopic close up of high quality natural textile fibers showing intricate weave patterns" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCf1bFSwC1Df3N8bKNfsk_gFvuGl_5L-WxMp4wSoBF0C76VkhQdnbMfNrHtkEoUFpXYZ80q6qNtGbfmWcmeTGKrNreVh9m204zooKDDhOkmXQ63iZB0Jy38UKRg-g1nSJ4flIjjoSmpTYIwupQsMilAm9dXA4VJbe9DBt_RM8miUPFzqdAWaEnS7UJiFwdTDoQAMU7OIGUbjLubgkidqjYWzmYGSh7lTtqp9GmSurYJlgB_GVFDunP9WV0njbTG4HR0WJdpwSHJ3eR8" />
                        </div>
                    </div>
                </section>
            </AnimateWhenVisible>

            {/* Process Steps (Horizontal Scroll/Rhythm) */}
            <AnimateWhenVisible direction="fade">
                <section className="bg-surface-container-low py-24 mb-32">
                    <div className="px-6 md:px-12 lg:px-24">
                        <h2 className="font-notoSerif text-4xl font-bold mb-16 text-center">Hành trình Nguồn gốc</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {/* Step 1 */}
                            <div className="flex flex-col gap-6">
                                <div className="text-primary-container font-notoSerif text-6xl italic opacity-50">01</div>
                                <h4 className="font-manrope font-bold text-xl uppercase tracking-tighter">Tiếp nhận Giám định</h4>
                                <p className="text-on-surface-variant text-sm leading-relaxed">Khi đến nơi, mỗi món đồ sẽ được lập danh mục bằng hình ảnh độ phân giải cực cao, ghi lại mọi dấu vết, lớp phủ thời gian và mã định danh duy nhất.</p>
                            </div>
                            {/* Step 2 */}
                            <div className="flex flex-col gap-6">
                                <div className="text-primary-container font-notoSerif text-6xl italic opacity-50">02</div>
                                <h4 className="font-manrope font-bold text-xl uppercase tracking-tighter">Đánh giá Chuyên gia</h4>
                                <p className="text-on-surface-variant text-sm leading-relaxed">Các chuyên gia tận tâm cho từng danh mục (Đồ da, Lụa, Đồng hồ) đối chiếu sản phẩm với kho lưu trữ độc quyền của chúng tôi gồm hơn 50.000 mẫu tham chiếu.</p>
                            </div>
                            {/* Step 3 */}
                            <div className="flex flex-col gap-6">
                                <div className="text-primary-container font-notoSerif text-6xl italic opacity-50">03</div>
                                <h4 className="font-manrope font-bold text-xl uppercase tracking-tighter">Chứng nhận Kỹ thuật số</h4>
                                <p className="text-on-surface-variant text-sm leading-relaxed">Chứng nhận xác thực kỹ thuật số được hỗ trợ bởi blockchain sẽ được tạo ra, cung cấp bản ghi vĩnh viễn về nguồn gốc của món đồ.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </AnimateWhenVisible>

            {/* Impact / Trust Section */}
            <AnimateWhenVisible direction="slideFromLeft">
                <section className="px-6 md:px-12 lg:px-24 mb-32">
                    <div className="bg-primary text-on-primary rounded-3xl p-12 md:p-20 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
                        <div className="z-10 md:w-1/2">
                            <h2 className="font-notoSerif text-4xl md:text-5xl font-bold mb-8 leading-tight">Mua Đồ Cũ, <br />với Sự Tin Tưởng Tuyệt Đối.</h2>
                            <p className="font-manrope text-primary-fixed opacity-90 mb-10 leading-relaxed">Chúng tôi tin rằng trang phục bền vững nhất là trang phục đã tồn tại. Bằng cách đảm bảo tính xác thực 100%, chúng tôi xóa bỏ rào cản khỏi nền kinh tế tuần hoàn.</p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 bg-on-primary/10 px-4 py-2 rounded-full border border-on-primary/20">
                                    <span className="material-symbols-outlined text-sm" data-icon="verified_user">verified_user</span>
                                    <span className="text-xs font-manrope tracking-widest uppercase">Đảm bảo 100%</span>
                                </div>
                                <div className="flex items-center gap-2 bg-on-primary/10 px-4 py-2 rounded-full border border-on-primary/20">
                                    <span className="material-symbols-outlined text-sm" data-icon="eco">eco</span>
                                    <span className="text-xs font-manrope tracking-widest uppercase">Tác động Tuần hoàn</span>
                                </div>
                            </div>
                        </div>
                        {/* Eco Impact Slider Visualization */}
                        <div className="z-10 md:w-1/2 w-full bg-surface-container-lowest/10 backdrop-blur-md p-8 rounded-2xl border border-white/10">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest opacity-70 block mb-1">Tác động của bạn</span>
                                    <span className="font-notoSerif text-3xl font-bold">Đã tiết kiệm 12.4kg CO2</span>
                                </div>
                                <span className="material-symbols-outlined text-primary-fixed text-4xl" data-icon="psychology_alt">psychology_alt</span>
                            </div>
                            <div className="h-1.5 w-full bg-on-primary/20 rounded-full relative mb-4">
                                <div className="absolute top-0 left-0 h-full w-3/4 bg-primary-fixed rounded-full"></div>
                                <div className="absolute top-1/2 left-3/4 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-4 border-primary"></div>
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-center opacity-60">Xác thực đảm bảo chất lượng bền lâu.</p>
                        </div>
                        {/* Abstract Background Shape */}
                        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-primary-container rounded-full blur-3xl opacity-30"></div>
                    </div>
                </section>
            </AnimateWhenVisible>

            {/* Final CTA */}
            <AnimateWhenVisible direction="fadeInUp">
                <section className="text-center px-6 mb-12">
                    <h3 className="font-notoSerif text-3xl font-bold mb-8">Sẵn sàng xây dựng tủ đồ bền vững của bạn?</h3>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={() => navigate('/products')} className="bg-primary text-white font-manrope font-bold py-4 px-10 rounded-md transition-all active:scale-95 hover:bg-on-primary-fixed-variant">Xem Kho lưu trữ đã xác minh</button>
                        <button onClick={() => navigate('/consignment')} className="bg-secondary-container text-on-secondary-container font-manrope font-bold py-4 px-10 rounded-md transition-all active:scale-95">Bán cùng Atelier</button>
                    </div>
                </section>
            </AnimateWhenVisible>
        </main>
    );
};

export default Sustain;
