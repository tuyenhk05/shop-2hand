import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../action/auth';
import { message } from 'antd';

const AdminLayout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { fullName, role } = useSelector((state) => state.auth);

    const hasPerm = (perm) => role?.permissions?.includes('all') || role?.permissions?.includes(perm);

    const handleLogout = () => {
        dispatch(logout());
        message.success('Đăng xuất thành công');
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen font-manrope bg-surface text-on-surface">
            {/* SideNavBar */}
            <aside className="bg-[#f6f3ee] text-primary text-sm font-medium tracking-wide h-screen w-64 fixed left-0 top-0 z-40 flex flex-col py-8 px-4 gap-y-6 shadow-md">
                <div className="px-2 mb-4">
                    <h2 onClick={() => navigate('/')} className="cursor-pointer font-notoSerif italic text-2xl text-primary font-bold">Ethos Archive</h2>
                    <div className="mt-6 flex items-center gap-3">
                        <div>
                            <p className="font-bold text-on-surface line-clamp-1">{fullName || 'Quản trị viên'}</p>
                            <p className="text-xs text-on-surface-variant line-clamp-1">{role?.title || 'Ban quản trị'}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                    <NavLink to="/admin/dashboard" className={({ isActive }) => `flex items-center gap-3 py-3 px-4 transition-all duration-200 ease-in-out hover:bg-primary/10 hover:text-primary rounded-xl ${isActive ? 'text-primary font-bold bg-primary/10 border-r-4 border-primary' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined">dashboard</span>
                        Bảng điều khiển
                    </NavLink>
                    {hasPerm('products_view') && (
                        <NavLink to="/admin/products" className={({ isActive }) => `flex items-center gap-3 py-3 px-4 transition-all duration-200 ease-in-out hover:bg-primary/10 hover:text-primary rounded-xl ${isActive ? 'text-primary font-bold bg-primary/10 border-r-4 border-primary' : 'text-on-surface-variant'}`}>
                            <span className="material-symbols-outlined">inventory_2</span>
                            Sản phẩm
                        </NavLink>
                    )}
                    {hasPerm('categories_view') && (
                        <NavLink to="/admin/categories" className={({ isActive }) => `flex items-center gap-3 py-3 px-4 transition-all duration-200 ease-in-out hover:bg-primary/10 hover:text-primary rounded-xl ${isActive ? 'text-primary font-bold bg-primary/10 border-r-4 border-primary' : 'text-on-surface-variant'}`}>
                            <span className="material-symbols-outlined">category</span>
                            Danh mục
                        </NavLink>
                    )}
                    {hasPerm('orders_view') && (
                        <NavLink to="/admin/orders" className={({ isActive }) => `flex items-center gap-3 py-3 px-4 transition-all duration-200 ease-in-out hover:bg-primary/10 hover:text-primary rounded-xl ${isActive ? 'text-primary font-bold bg-primary/10 border-r-4 border-primary' : 'text-on-surface-variant'}`}>
                            <span className="material-symbols-outlined">receipt_long</span>
                            Đơn hàng
                        </NavLink>
                    )}
                    {hasPerm('consignments_view') && (
                        <NavLink to="/admin/consignments" className={({ isActive }) => `flex items-center gap-3 py-3 px-4 transition-all duration-200 ease-in-out hover:bg-primary/10 hover:text-primary rounded-xl ${isActive ? 'text-primary font-bold bg-primary/10 border-r-4 border-primary' : 'text-on-surface-variant'}`}>
                            <span className="material-symbols-outlined">handshake</span>
                            Ký gửi
                        </NavLink>
                    )}
                    {hasPerm('users_view') && (
                        <NavLink to="/admin/users" className={({ isActive }) => `flex items-center gap-3 py-3 px-4 transition-all duration-200 ease-in-out hover:bg-primary/10 hover:text-primary rounded-xl ${isActive ? 'text-primary font-bold bg-primary/10 border-r-4 border-primary' : 'text-on-surface-variant'}`}>
                            <span className="material-symbols-outlined">group</span>
                            Người dùng
                        </NavLink>
                    )}
                    {hasPerm('roles_view') && (
                        <NavLink to="/admin/roles" className={({ isActive }) => `flex items-center gap-3 py-3 px-4 transition-all duration-200 ease-in-out hover:bg-primary/10 hover:text-primary rounded-xl ${isActive ? 'text-primary font-bold bg-primary/10 border-r-4 border-primary' : 'text-on-surface-variant'}`}>
                            <span className="material-symbols-outlined">security</span>
                            Quyền hạn
                        </NavLink>
                    )}
                    
                    <div className="pt-4 mt-4 border-t border-outline-variant/10">
                        <NavLink to="/admin/settings" className={({ isActive }) => `flex items-center gap-3 py-3 px-4 transition-all duration-200 ease-in-out hover:bg-primary/10 hover:text-primary rounded-xl ${isActive ? 'text-primary font-bold bg-primary/10 border-r-4 border-primary' : 'text-on-surface-variant'}`}>
                            <span className="material-symbols-outlined">settings</span>
                            Cài đặt
                        </NavLink>
                    </div>
                </nav>

                <div className="mt-auto pt-6">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-surface-container-high text-on-surface-variant hover:text-error rounded-xl font-bold transition-all active:scale-[0.98]">
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
