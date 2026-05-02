import React, { useState, useEffect, useRef } from 'react';
import GlobalSearch from './GlobalSearch';
import Chatbot from '../chatbot/Chatbot';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { deleteCookie, getCookie } from '../../helpers/cookie';
import { useDispatch } from 'react-redux';
import { logout } from '../../action/auth';

const ClientLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // ─── Ẩn/hiện header khi scroll ─────────────────────────────
    const [headerVisible, setHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;
            const diff = currentY - lastScrollY.current;

            if (currentY < 60) {
                // Luôn hiện khi gần đầu trang
                setHeaderVisible(true);
            } else if (diff > 6) {
                // Cuộn xuống đủ nhiều → ẩn
                setHeaderVisible(false);
            } else if (diff < -6) {
                // Cuộn lên đủ nhiều → hiện
                setHeaderVisible(true);
            }

            lastScrollY.current = currentY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Kiểm tra trạng thái đăng nhập dựa vào token (chuẩn xác thực)
    const token = getCookie('token') || localStorage.getItem('token');
    const isLoggedIn = !!token;

    const handleLogout = () => {
        dispatch(logout());
        deleteCookie('token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        
        window.location.href = '/login';
    };

    // Determine active classes
    const getLinkClass = (path) => {
        const baseClass = "text-sm uppercase tracking-widest font-semibold transition-colors duration-300 pb-1";
        const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
        
        return isActive 
            ? `${baseClass} text-primary border-b-2 border-primary`
            : `${baseClass} text-on-surface-variant hover:text-primary`;
    };

    return (
        <div className="min-h-screen bg-[#fef9f7] text-on-surface font-body flex flex-col selection:bg-primary-fixed-dim selection:text-on-primary-fixed">

            {/* AI Chatbot */}
            <Chatbot />

            {/* ================= HEADER ================= */}
            <header
                className={`fixed top-0 left-0 w-full flex justify-between items-center px-6 md:px-12 py-4 bg-[#fef9f7]/80 backdrop-blur-xl border-b border-outline-variant/20 z-50 transition-all duration-300 ${
                    headerVisible ? 'translate-y-0 shadow-sm' : '-translate-y-full shadow-none'
                }`}
            >
                <div className="flex items-center gap-10">
                    <Link to="/" className="text-2xl font-bold font-headline text-primary-fixed-variant tracking-tighter italic">
                        Atelier.
                    </Link>

                    <nav className="hidden md:flex gap-8 items-center mt-1">
                        <Link to="/" className={getLinkClass('/')}>
                            Trang chủ
                        </Link>
                        <Link to="/products" className={getLinkClass('/products')}>
                            Sản phẩm
                        </Link>
                        <Link to="/sustain" className={getLinkClass('/sustain')}>
                            Bền vững
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search Bar */}
                    <GlobalSearch />

                    {/* Cart / Action Icon */}
                    <Link to="/cart" className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all">
                        <span className="material-symbols-outlined hover:scale-105 transition-transform" style={{ fontVariationSettings: "'wght' 300" }}>shopping_bag</span>
                    </Link>

                    {/* User: Hiện nút Đăng nhập nếu chưa login, Dropdown nếu đã login */}
                    {isLoggedIn ? (
                        <div className="relative group ml-1">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-container-highest border-2 border-primary/20 cursor-pointer hover:border-primary transition-all">
                                <img
                                    alt="User profile"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAScZlzI9muTqdiE7Ez2-M69S7cElal-RdSMNcXrDFSRwCoPVlZhuD1jFsRsOn5hvGBQPopcb5qoB0LMOmNdm1WgMCNUVeyu67C1G0u2Ghs7kXkcouFrCY_J0lzAq-LVjngPMsOmlnJNg-PcL50BZrw1BFNtQ1VBYKE6OGTvydt_gJqH1DgZ705W8uEwoORWWjdHiqWfEcyZykLCbz8b7rlnvI6N_my8L6yHDlw99pS2EnQMTsoWr7YfQEYHZACGVbZjinoZQK1158A"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 mt-2 w-52 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-2 z-50">
                                <div className="p-2 space-y-1">
                                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-on-surface hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">person</span>
                                        Hồ sơ Cá nhân
                                    </Link>
                                    <Link to="/history" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-on-surface hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                                        Lịch sử Mua hàng
                                    </Link>
                                    <Link to="/chat" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-on-surface hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">support_agent</span>
                                        Chat với Shop
                                    </Link>
                                    <Link to="/consignment" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-on-surface hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">storefront</span>
                                        Ký gửi Sản phẩm
                                    </Link>
                                    <div className="h-px bg-outline-variant/20 my-1"></div>
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-error hover:bg-error-container/20 rounded-lg transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">logout</span>
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="ml-1 flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-sm font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">login</span>
                            Đăng nhập
                        </Link>
                    )}
                </div>
            </header>

            {/* ================= MAIN CONTENT ================= */}
            {/* pt-20 để bù lại khoảng không gian bị chiếm bởi Header fixed (fixed position) */}
            <main className="flex-grow pt-20 flex flex-col">
                <Outlet />
            </main>

            {/* ================= FOOTER ================= */}
            <footer className="bg-surface-container-lowest border-t border-outline-variant/20 pt-16 pb-8 px-6 md:px-12 mt-auto">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">

                    {/* Brand & Newsletter */}
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-3xl font-bold font-headline text-primary-fixed-variant tracking-tighter italic mb-4">
                            Atelier.
                        </h2>
                        <p className="text-on-surface-variant font-body mb-6 max-w-sm leading-relaxed">
                            Cùng Atelier lan tỏa thông điệp thời trang bền vững và tiêu dùng có ý thức vì một tương lai tốt đẹp hơn.
                        </p>
                        <div className="flex flex-wrap gap-4 items-center">
                            <span className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20 text-xs font-bold uppercase tracking-widest">
                                <span className="material-symbols-outlined text-sm">eco</span>
                                Thời trang tuần hoàn
                            </span>
                            <span className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20 text-xs font-bold uppercase tracking-widest">
                                <span className="material-symbols-outlined text-sm">verified_user</span>
                                100% Chính hãng
                            </span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-headline text-lg font-bold mb-5 text-on-surface">Khám phá</h3>
                        <ul className="space-y-4 font-body text-on-surface-variant font-medium">
                            <li><Link to="/products" className="hover:text-primary transition-colors block w-fit">Cửa hàng Archive</Link></li>
                            <li><Link to="/sustain" className="hover:text-primary transition-colors block w-fit">Dấu chân sinh thái</Link></li>
                            <li><Link to="/about" className="hover:text-primary transition-colors block w-fit">Câu chuyện Atelier</Link></li>
                            <li><Link to="/journal" className="hover:text-primary transition-colors block w-fit">Tạp chí (Journal)</Link></li>
                        </ul>
                    </div>

                    {/* Customer Support */}
                    <div>
                        <h3 className="font-headline text-lg font-bold mb-5 text-on-surface">Hỗ trợ</h3>
                        <ul className="space-y-4 font-body text-on-surface-variant font-medium">
                            <li><Link to="/faq" className="hover:text-primary transition-colors block w-fit">Câu hỏi thường gặp</Link></li>
                            <li><Link to="/shipping" className="hover:text-primary transition-colors block w-fit">Vận chuyển & Đổi trả</Link></li>
                            <li><Link to="/authenticity" className="hover:text-primary transition-colors block w-fit">Xác thực sản phẩm</Link></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors block w-fit">Liên hệ chăm sóc</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Footer (Copyright & Legal) */}
                <div className="max-w-[1400px] mx-auto mt-16 pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-on-surface-variant font-medium">
                    <p>© 2026 Atelier Vintage. Tất cả quyền được bảo lưu.</p>

                    <div className="flex gap-8">
                        <Link to="/privacy" className="hover:text-primary transition-colors">Chính sách bảo mật</Link>
                        <Link to="/terms" className="hover:text-primary transition-colors">Điều khoản dịch vụ</Link>
                    </div>

                    {/* Social Icons Placeholder */}
                    <div className="flex gap-4 items-center">
                        <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-primary hover:text-on-primary transition-colors">
                            IG
                        </a>
                        <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-primary hover:text-on-primary transition-colors">
                            FB
                        </a>
                        <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-primary hover:text-on-primary transition-colors">
                            X
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ClientLayout;