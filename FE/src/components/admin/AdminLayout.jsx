import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../action/auth';
import { message } from 'antd';

const AdminLayout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { fullName,role } = useSelector((state) => state.auth);

    // Basic protective logic, but typically you'd wrap this with a PrivateRoute
    // For now if they reach here, we assume PrivateRoute has validated them, or we do a lazy check

    const handleLogout = () => {
        dispatch(logout());
        message.success('Đăng xuất thành công');
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen font-manrope bg-surface text-on-surface">
            {/* SideNavBar */}
            <aside className="bg-[#f6f3ee] text-primary text-sm font-medium tracking-wide h-screen w-64 fixed left-0 top-0 z-40 flex flex-col py-8 px-4 gap-y-6">
                <div className="px-2 mb-4">
                    <h2 onClick={() => navigate('/')} className="cursor-pointer font-notoSerif italic text-2xl text-primary font-bold">Ethos Archive</h2>
                    <div className="mt-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center font-bold text-surface-variant">
                            {fullName ? fullName[0].toUpperCase() : 'A'}
                        </div>
                        <div>
                            <p className="font-bold text-on-surface line-clamp-1">{fullName || 'Admin User'}</p>
                            <p className="text-xs text-on-surface-variant line-clamp-1">{role?.title || 'Management Tier'}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavLink to="/admin" end className={({ isActive }) => `flex items-center gap-3 py-3 px-4 transition-all duration-200 ease-in-out hover:bg-surface-container hover:text-primary rounded-xl ${isActive ? 'text-primary font-bold border-r-2 border-primary bg-primary-fixed/20' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined">dashboard</span>
                        Dashboard
                    </NavLink>
                    <NavLink to="/admin/products" className={({ isActive }) => `flex items-center gap-3 py-3 px-4 transition-all duration-200 ease-in-out hover:bg-surface-container hover:text-primary rounded-xl ${isActive ? 'text-primary font-bold border-r-2 border-primary bg-primary-fixed/20' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined">inventory_2</span>
                        Inventory
                    </NavLink>
                    <NavLink to="/admin/categories" className={({ isActive }) => `flex items-center gap-3 py-3 px-4 transition-all duration-200 ease-in-out hover:bg-surface-container hover:text-primary rounded-xl ${isActive ? 'text-primary font-bold border-r-2 border-primary bg-primary-fixed/20' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined">category</span>
                        Categories
                    </NavLink>
                    <NavLink to="/admin/orders" className={({ isActive }) => `flex items-center gap-3 py-3 px-4 transition-all duration-200 ease-in-out hover:bg-surface-container hover:text-primary rounded-xl ${isActive ? 'text-primary font-bold border-r-2 border-primary bg-primary-fixed/20' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined">receipt_long</span>
                        Orders
                    </NavLink>
                    <NavLink to="/admin/consignments" className={({ isActive }) => `flex items-center gap-3 py-3 px-4 transition-all duration-200 ease-in-out hover:bg-surface-container hover:text-primary rounded-xl ${isActive ? 'text-primary font-bold border-r-2 border-primary bg-primary-fixed/20' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined">handshake</span>
                        Consignments
                    </NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => `flex items-center gap-3 py-3 px-4 transition-all duration-200 ease-in-out hover:bg-surface-container hover:text-primary rounded-xl ${isActive ? 'text-primary font-bold border-r-2 border-primary bg-primary-fixed/20' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined">group</span>
                        Users
                    </NavLink>
                    <NavLink to="/admin/roles" className={({ isActive }) => `flex items-center gap-3 py-3 px-4 transition-all duration-200 ease-in-out hover:bg-surface-container hover:text-primary rounded-xl ${isActive ? 'text-primary font-bold border-r-2 border-primary bg-primary-fixed/20' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined">security</span>
                        Roles
                    </NavLink>
                </nav>

                <div className="mt-auto pt-6 space-y-4">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-surface-container-high text-on-surface-variant hover:text-error rounded-xl font-bold transition-all active:scale-[0.98]">
                        <span className="material-symbols-outlined">logout</span> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content Canvas */}
            <main className="flex-1 ml-64 p-8 bg-surface min-h-screen">
                <header className="flex justify-between items-center w-full mb-12 sticky top-0 bg-surface/80 backdrop-blur-md z-30 py-4">
                    <div>
                        <h1 className="font-notoSerif text-4xl font-semibold tracking-tight text-primary">Atelier Portal</h1>
                        <p className="text-on-surface-variant mt-1 text-sm">Trung tâm quản lý chuyên biệt</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">notifications</span>
                            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
                            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors" title="Trở về trang khách">storefront</span>
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
