import React from 'react';
import AnimateWhenVisible from '../../helpers/animationScroll';
import useScrollToTop from '../../hooks/useScrollToTop';

const Privacy = () => {
    useScrollToTop();

    return (
        <div className="bg-white font-manrope selection:bg-primary selection:text-white pb-32">
            {/* Header */}
            <section className="pt-32 pb-20 px-6 md:px-12 bg-surface-container-lowest border-b border-outline-variant/10">
                <div className="max-w-4xl mx-auto">
                    <AnimateWhenVisible direction="fadeInUp">
                        <h1 className="font-notoSerif text-5xl md:text-6xl font-bold mb-6">Chính sách Bảo mật</h1>
                        <p className="text-on-surface-variant text-lg">Cập nhật lần cuối: 08 Tháng 5, 2024</p>
                    </AnimateWhenVisible>
                </div>
            </section>

            {/* Content */}
            <section className="pt-20 px-6 md:px-12 max-w-4xl mx-auto">
                <AnimateWhenVisible direction="fade" className="prose prose-lg max-w-none text-on-surface-variant leading-relaxed space-y-12">
                    <div>
                        <h2 className="font-notoSerif text-3xl font-bold text-on-surface mb-6">1. Giới thiệu</h2>
                        <p>
                            Tại Atelier, chúng tôi coi trọng sự riêng tư của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi bạn truy cập trang web và sử dụng dịch vụ của chúng tôi.
                        </p>
                    </div>

                    <div>
                        <h2 className="font-notoSerif text-3xl font-bold text-on-surface mb-6">2. Thông tin chúng tôi thu thập</h2>
                        <p>Chúng tôi có thể thu thập các loại thông tin sau:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>Thông tin định danh cá nhân (Tên, email, số điện thoại, địa chỉ giao hàng).</li>
                            <li>Thông tin thanh toán (Được xử lý an toàn qua cổng thanh toán đối tác).</li>
                            <li>Dữ liệu duyệt web và hành vi sử dụng trên hệ thống.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="font-notoSerif text-3xl font-bold text-on-surface mb-6">3. Cách chúng tôi sử dụng thông tin</h2>
                        <p>Thông tin của bạn được sử dụng để:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>Xử lý đơn hàng và cung cấp dịch vụ khách hàng.</li>
                            <li>Cải thiện trải nghiệm người dùng và tối ưu hóa website.</li>
                            <li>Gửi các thông tin cập nhật, chương trình khuyến mãi (nếu bạn đăng ký).</li>
                            <li>Ngăn chặn các hoạt động gian lận và đảm bảo an ninh hệ thống.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="font-notoSerif text-3xl font-bold text-on-surface mb-6">4. Bảo mật dữ liệu</h2>
                        <p>
                            Chúng tôi triển khai các biện pháp an ninh kỹ thuật và tổ chức để bảo vệ dữ liệu cá nhân của bạn khỏi sự truy cập trái phép, mất mát hoặc thay đổi. Tất cả dữ liệu nhạy cảm đều được mã hóa trong quá trình truyền tải.
                        </p>
                    </div>

                    <div className="bg-primary/5 p-10 rounded-3xl border border-primary/10">
                        <h2 className="font-notoSerif text-2xl font-bold text-primary mb-4">Liên hệ chúng tôi</h2>
                        <p className="text-on-surface mb-0">
                            Nếu bạn có bất kỳ câu hỏi nào về Chính sách bảo mật này, vui lòng liên hệ với chúng tôi qua email: <span className="font-bold underline">privacy@atelier.example.com</span>
                        </p>
                    </div>
                </AnimateWhenVisible>
            </section>
        </div>
    );
};

export default Privacy;
