import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../action/auth';
import { message } from 'antd';
import { getUnreadCountApi, connectSupportSocket } from '../../services/client/support.service';
import NotificationDropdown from '../layout/NotificationDropdown';

const AdminLayout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { fullName, role } = useSelector((state) => state.auth);

    const hasPerm = (perm) => role?.permissions?.includes('all') || role?.permissions?.includes(perm);

    const [unreadCount, setUnreadCount] = useState(0);
    const socketRef = useRef(null);

    // Load unread count and listen for socket updates
    useEffect(() => {
        if (!hasPerm('support_view')) return;

        const fetchUnread = async () => {
            try {
                const res = await getUnreadCountApi();
                if (res.success) setUnreadCount(res.count);
            } catch { /* silent */ }
        };

        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);

        // Socket real-time badge
        const socket = connectSupportSocket();
        socketRef.current = socket;
        socket.on('connect', () => socket.emit('admin_join'));
        if (socket.connected) socket.emit('admin_join');
        socket.on('unread_update', () => fetchUnread());

        return () => {
            clearInterval(interval);
            socket.off('unread_update');
            socket.off('connect');
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        message.success('Đăng xuất thành công');
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen font-manrope bg-surface text-on-surface">
            {/* SideNavBar */}
            <aside className="bg-[#4c6545] text-white text-sm font-medium tracking-wide h-screen w-64 fixed left-0 top-0 z-40 flex flex-col py-8 px-4 gap-y-6 shadow-md">
                <div className="px-2 mb-4">
                    <h2 onClick={() => navigate('/')} className="cursor-pointer font-notoSerif italic text-2xl text-white font-bold">Ethos Archive</h2>
                    <div className="mt-6 flex items-center gap-3">
                        <div>
                            <p className="font-bold text-white line-clamp-1">{fullName || 'Quản trị viên'}</p>
                            <p className="text-xs text-white/70 line-clamp-1">{role?.title || 'Ban quản trị'}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-4 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {/* Mục 1: TỔNG QUAN */}
                    <div>
                        <div className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-2 px-3">TỔNG QUAN</div>
                        <NavLink to="/admin/dashboard" className={({ isActive }) => `flex items-center gap-2.5 py-2 px-3 transition-all duration-200 ease-in-out hover:bg-white/10 hover:text-white rounded-md text-xs ${isActive ? 'text-white font-bold bg-white/20 border-r-4 border-white' : 'text-white/80'}`}>
                            <span className="material-symbols-outlined text-lg">dashboard</span>
                            Bảng điều khiển
                        </NavLink>
                    </div>

                    {/* Mục 2: BÁN HÀNG & SẢN PHẨM */}
                    <div>
                        <div className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-2 px-3">BÁN HÀNG & SẢN PHẨM</div>
                        <div className="space-y-1">
                            {hasPerm('products_view') && (
                                <NavLink to="/admin/products" className={({ isActive }) => `flex items-center gap-2.5 py-2 px-3 transition-all duration-200 ease-in-out hover:bg-white/10 hover:text-white rounded-md text-xs ${isActive ? 'text-white font-bold bg-white/20 border-r-4 border-white' : 'text-white/80'}`}>
                                    <span className="material-symbols-outlined text-lg">inventory_2</span>
                                    Sản phẩm
                                </NavLink>
                            )}
                            {hasPerm('categories_view') && (
                                <NavLink to="/admin/categories" className={({ isActive }) => `flex items-center gap-2.5 py-2 px-3 transition-all duration-200 ease-in-out hover:bg-white/10 hover:text-white rounded-md text-xs ${isActive ? 'text-white font-bold bg-white/20 border-r-4 border-white' : 'text-white/80'}`}>
                                    <span className="material-symbols-outlined text-lg">category</span>
                                    Danh mục
                                </NavLink>
                            )}
                            {hasPerm('orders_view') && (
                                <NavLink to="/admin/orders" className={({ isActive }) => `flex items-center gap-2.5 py-2 px-3 transition-all duration-200 ease-in-out hover:bg-white/10 hover:text-white rounded-md text-xs ${isActive ? 'text-white font-bold bg-white/20 border-r-4 border-white' : 'text-white/80'}`}>
                                    <span className="material-symbols-outlined text-lg">receipt_long</span>
                                    Đơn hàng
                                </NavLink>
                            )}
                            {hasPerm('consignments_view') && (
                                <NavLink to="/admin/consignments" className={({ isActive }) => `flex items-center gap-2.5 py-2 px-3 transition-all duration-200 ease-in-out hover:bg-white/10 hover:text-white rounded-md text-xs ${isActive ? 'text-white font-bold bg-white/20 border-r-4 border-white' : 'text-white/80'}`}>
                                    <span className="material-symbols-outlined text-lg">handshake</span>
                                    Ký gửi
                                </NavLink>
                            )}
                        </div>
                    </div>

                    {/* Mục 3: KHÁCH HÀNG & HỖ TRỢ */}
                    <div>
                        <div className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-2 px-3">KHÁCH HÀNG & HỖ TRỢ</div>
                        <div className="space-y-1">
                            {hasPerm('support_view') && (
                                <NavLink to="/admin/support" className={({ isActive }) => `flex items-center gap-2.5 py-2 px-3 transition-all duration-200 ease-in-out hover:bg-white/10 hover:text-white rounded-md text-xs ${isActive ? 'text-white font-bold bg-white/20 border-r-4 border-white' : 'text-white/80'}`}>
                                    <span className="material-symbols-outlined text-lg">support_agent</span>
                                    <span className="flex-1">Chăm sóc KH</span>
                                    {unreadCount > 0 && (
                                        <span className="bg-white text-[#4c6545] text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                            {unreadCount}
                                        </span>
                                    )}
                                </NavLink>
                            )}
                            {hasPerm('users_view') && (
                                <NavLink to="/admin/users" className={({ isActive }) => `flex items-center gap-2.5 py-2 px-3 transition-all duration-200 ease-in-out hover:bg-white/10 hover:text-white rounded-md text-xs ${isActive ? 'text-white font-bold bg-white/20 border-r-4 border-white' : 'text-white/80'}`}>
                                    <span className="material-symbols-outlined text-lg">group</span>
                                    Người dùng
                                </NavLink>
                            )}
                        </div>
                    </div>

                    {/* Mục 4: HỆ THỐNG */}
                    <div>
                        <div className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-2 px-3">HỆ THỐNG</div>
                        <div className="space-y-1">
                            {hasPerm('roles_view') && (
                                <NavLink to="/admin/roles" className={({ isActive }) => `flex items-center gap-2.5 py-2 px-3 transition-all duration-200 ease-in-out hover:bg-white/10 hover:text-white rounded-md text-xs ${isActive ? 'text-white font-bold bg-white/20 border-r-4 border-white' : 'text-white/80'}`}>
                                    <span className="material-symbols-outlined text-lg">security</span>
                                    Quyền hạn
                                </NavLink>
                            )}
                            <NavLink to="/admin/settings" className={({ isActive }) => `flex items-center gap-2.5 py-2 px-3 transition-all duration-200 ease-in-out hover:bg-white/10 hover:text-white rounded-md text-xs ${isActive ? 'text-white font-bold bg-white/20 border-r-4 border-white' : 'text-white/80'}`}>
                                <span className="material-symbols-outlined text-lg">settings</span>
                                Cài đặt
                            </NavLink>
                        </div>
                    </div>
                </nav>

                <div className="mt-auto pt-6">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 text-white hover:text-red-300 hover:bg-white/20 rounded-xl font-bold transition-all active:scale-[0.98]">
                        <span className="material-symbols-outlined">logout</span> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content Canvas */}
            <main className="flex-1 ml-64 p-8 bg-surface min-h-screen">
                <header className="flex justify-between items-center w-full mb-12 sticky top-0 bg-surface/80 backdrop-blur-md z-30 py-4">
                    <div>
                        <h1 className="font-notoSerif text-4xl font-semibold tracking-tight text-primary">Cổng Quản Trị</h1>
                        <p className="text-on-surface-variant mt-1 text-sm">Trung tâm quản lý chuyên biệt</p>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Notifications */}
                        <NotificationDropdown isAdmin={true} />

                        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
                            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors" title="Trở về trang khách">storefront</span>
                            <span className="text-sm font-medium text-on-surface-variant group-hover:text-primary hidden md:inline">Trang chủ</span>
                        </div>
                    </div>
                </header>

                <section className="bg-surface relative z-10 min-h-[70vh]">
                    <Outlet />
                </section>
            </main>
        </div>
    );
};

export default AdminLayout;
