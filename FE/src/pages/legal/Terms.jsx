import React from 'react';
import AnimateWhenVisible from '../../helpers/animationScroll';
import useScrollToTop from '../../hooks/useScrollToTop';

const Terms = () => {
    useScrollToTop();

    return (
        <div className="bg-white font-manrope selection:bg-primary selection:text-white pb-32">
            {/* Header */}
            <section className="pt-32 pb-20 px-6 md:px-12 bg-surface-container-lowest border-b border-outline-variant/10">
                <div className="max-w-4xl mx-auto">
                    <AnimateWhenVisible direction="fadeInUp">
                        <h1 className="font-notoSerif text-5xl md:text-6xl font-bold mb-6">Điều khoản Dịch vụ</h1>
                        <p className="text-on-surface-variant text-lg">Cập nhật lần cuối: 08 Tháng 5, 2024</p>
                    </AnimateWhenVisible>
                </div>
            </section>

            {/* Content */}
            <section className="pt-20 px-6 md:px-12 max-w-4xl mx-auto">
                <AnimateWhenVisible direction="fade" className="prose prose-lg max-w-none text-on-surface-variant leading-relaxed space-y-12">
                    <div>
                        <h2 className="font-notoSerif text-3xl font-bold text-on-surface mb-6">1. Chấp nhận điều khoản</h2>
                        <p>
                            Bằng cách truy cập và sử dụng dịch vụ của Atelier, bạn đồng ý tuân thủ và chịu sự ràng buộc bởi các Điều khoản dịch vụ này. Nếu bạn không đồng ý với bất kỳ phần nào, vui lòng ngừng sử dụng dịch vụ của chúng tôi.
                        </p>
                    </div>

                    <div>
                        <h2 className="font-notoSerif text-3xl font-bold text-on-surface mb-6">2. Sử dụng dịch vụ</h2>
                        <p>
                            Bạn cam kết cung cấp thông tin chính xác và đầy đủ khi đăng ký tài khoản. Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình và mọi hoạt động diễn ra dưới tài khoản đó.
                        </p>
                    </div>

                    <div>
                        <h2 className="font-notoSerif text-3xl font-bold text-on-surface mb-6">3. Quyền sở hữu trí tuệ</h2>
                        <p>
                            Tất cả nội dung trên website, bao gồm văn bản, hình ảnh, logo và mã nguồn, đều thuộc sở hữu của Atelier hoặc các đối tác cấp phép. Bạn không được phép sao chép hoặc sử dụng khi chưa có sự đồng ý bằng văn bản.
                        </p>
                    </div>

                    <div>
                        <h2 className="font-notoSerif text-3xl font-bold text-on-surface mb-6">4. Chính sách Ký gửi & Bán hàng</h2>
                        <p>
                            Các sản phẩm ký gửi phải đảm bảo tính xác thực và chất lượng như mô tả. Atelier có quyền từ chối các sản phẩm không đáp ứng tiêu chuẩn kiểm định của chúng tôi.
                        </p>
                    </div>

                    <div>
                        <h2 className="font-notoSerif text-3xl font-bold text-on-surface mb-6">5. Giới hạn trách nhiệm</h2>
                        <p>
                            Atelier sẽ không chịu trách nhiệm cho bất kỳ thiệt hại gián tiếp, ngẫu nhiên hoặc đặc biệt nào phát sinh từ việc bạn sử dụng hoặc không thể sử dụng dịch vụ của chúng tôi.
                        </p>
                    </div>

                    <div className="bg-primary/5 p-10 rounded-3xl border border-primary/10">
                        <h2 className="font-notoSerif text-2xl font-bold text-primary mb-4">Thắc mắc về Điều khoản</h2>
                        <p className="text-on-surface mb-0">
                            Nếu bạn có bất kỳ câu hỏi nào về các Điều khoản này, vui lòng liên hệ với chúng tôi: <span className="font-bold underline">legal@atelier.example.com</span>
                        </p>
                    </div>
                </AnimateWhenVisible>
            </section>
        </div>
    );
};

export default Terms;
