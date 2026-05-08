import React from 'react';
import AnimateWhenVisible from '../../helpers/animationScroll';
import useScrollToTop from '../../hooks/useScrollToTop';

const About = () => {
    useScrollToTop();

    return (
        <div className="bg-[#fef9f7] font-manrope selection:bg-primary selection:text-white">
            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000" 
                        alt="Atelier Hero" 
                        className="w-full h-full object-cover opacity-20 scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#fef9f7]/50 via-transparent to-[#fef9f7]"></div>
                </div>

                <div className="relative z-10 max-w-4xl px-6 text-center">
                    <AnimateWhenVisible direction="fadeInUp">
                        <span className="text-xs font-bold uppercase tracking-[0.4em] text-primary mb-6 block">Kể từ năm 2024</span>
                        <h1 className="font-notoSerif text-5xl md:text-7xl font-bold tracking-tighter text-on-surface mb-8 leading-[1.1]">
                            Định nghĩa lại <br/> <span className="italic text-primary">Thời trang Tuần hoàn.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                            Atelier ra đời với sứ mệnh mang lại sức sống mới cho những món đồ xa xỉ, kiến tạo một tương lai nơi sự sang trọng và tính bền vững luôn song hành.
                        </p>
                    </AnimateWhenVisible>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <AnimateWhenVisible direction="slideFromLeft">
                        <div className="relative">
                            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                                <img 
                                    src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1500" 
                                    alt="Philosophy" 
                                    className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                                />
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
                        </div>
                    </AnimateWhenVisible>

                    <div className="space-y-10">
                        <AnimateWhenVisible direction="fadeInUp">
                            <h2 className="font-notoSerif text-4xl font-bold tracking-tight text-on-surface">Triết lý của chúng tôi</h2>
                            <div className="w-20 h-1 bg-primary"></div>
                        </AnimateWhenVisible>

                        <AnimateWhenVisible direction="fadeInUp" delay={200}>
                            <p className="text-lg text-on-surface-variant leading-relaxed">
                                Chúng tôi tin rằng mỗi món đồ thời trang đều mang trong mình một câu chuyện. Thay vì để những câu chuyện ấy kết thúc trong quên lãng, Atelier tạo ra một hệ sinh thái để chúng được kể tiếp bởi những chủ nhân mới.
                            </p>
                            <p className="text-lg text-on-surface-variant leading-relaxed mt-6">
                                Bằng cách kết nối người bán (Consignors) và người mua (Curators), chúng tôi giảm thiểu tác động tiêu cực của ngành thời trang nhanh lên môi trường, đồng thời tôn vinh giá trị của những món đồ thủ công tinh xảo và bền bỉ với thời gian.
                            </p>
                        </AnimateWhenVisible>

                        <div className="grid grid-cols-2 gap-8 pt-8">
                            <AnimateWhenVisible direction="fadeInUp" delay={400}>
                                <div className="text-center p-6 bg-white rounded-2xl border border-outline-variant/10 shadow-sm">
                                    <h3 className="font-notoSerif text-3xl font-bold text-primary mb-2">10k+</h3>
                                    <p className="text-xs uppercase font-bold tracking-widest text-on-surface-variant">Sản phẩm tuần hoàn</p>
                                </div>
                            </AnimateWhenVisible>
                            <AnimateWhenVisible direction="fadeInUp" delay={500}>
                                <div className="text-center p-6 bg-white rounded-2xl border border-outline-variant/10 shadow-sm">
                                    <h3 className="font-notoSerif text-3xl font-bold text-primary mb-2">50k+</h3>
                                    <p className="text-xs uppercase font-bold tracking-widest text-on-surface-variant">Khách hàng tin tưởng</p>
                                </div>
                            </AnimateWhenVisible>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-32 bg-surface-container-low">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <AnimateWhenVisible direction="fade" className="text-center mb-20">
                        <h2 className="font-notoSerif text-4xl font-bold tracking-tight text-on-surface mb-4">Giá trị cốt lõi</h2>
                        <p className="text-on-surface-variant uppercase tracking-widest text-xs font-bold">Cam kết của chúng tôi với cộng đồng</p>
                    </AnimateWhenVisible>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: 'verified',
                                title: 'Tính Minh bạch',
                                desc: 'Mọi sản phẩm tại Atelier đều trải qua quy trình kiểm định nghiêm ngặt để đảm bảo 100% tính nguyên bản và chất lượng thực tế.'
                            },
                            {
                                icon: 'eco',
                                title: 'Sự Bền vững',
                                desc: 'Chúng tôi ưu tiên tối đa hóa vòng đời sản phẩm, giảm thiểu rác thải thời trang và thúc đẩy lối sống tiêu dùng có ý thức.'
                            },
                            {
                                icon: 'auto_awesome',
                                title: 'Sự Tuyển chọn',
                                desc: 'Đội ngũ chuyên gia của chúng tôi chọn lọc từng món đồ dựa trên gu thẩm mỹ vượt thời gian và tình trạng hoàn hảo.'
                            }
                        ].map((item, i) => (
                            <AnimateWhenVisible key={i} direction="fadeInUp" delay={i * 200}>
                                <div className="bg-white p-10 rounded-[2rem] border border-outline-variant/10 shadow-sm hover:shadow-xl transition-all group h-full">
                                    <span className="material-symbols-outlined text-4xl text-primary mb-6 block group-hover:scale-110 transition-transform">{item.icon}</span>
                                    <h3 className="font-notoSerif text-2xl font-bold mb-4">{item.title}</h3>
                                    <p className="text-on-surface-variant leading-relaxed">{item.desc}</p>
                                </div>
                            </AnimateWhenVisible>
                        ))}
                    </div>
                </div>
            </section>

            {/* Join Us CTA */}
            <section className="py-32 relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <AnimateWhenVisible direction="fade">
                        <h2 className="font-notoSerif text-4xl md:text-5xl font-bold mb-8">Bắt đầu hành trình tuần hoàn cùng Atelier.</h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="px-10 py-5 bg-primary text-white font-bold rounded-2xl shadow-lg hover:bg-primary-container transition-all active:scale-95">Khám phá Cửa hàng</button>
                            <button className="px-10 py-5 bg-white text-primary border-2 border-primary/20 font-bold rounded-2xl hover:bg-primary/5 transition-all active:scale-95">Ký gửi Sản phẩm</button>
                        </div>
                    </AnimateWhenVisible>
                </div>
            </section>
        </div>
    );
};

export default About;
