import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postLogin } from '../../services/client/login';
import { useDispatch, useSelector } from 'react-redux';
import { checkLogin } from '../../action/auth';
import { message } from 'antd';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { isLogin, role } = useSelector(state => state.auth);

    // Auto redirect if already admin
    useEffect(() => {
        if (isLogin && role && role.permissions && (role.permissions.includes('all') || role.permissions.length > 0)) {
            navigate('/admin');
        }
    }, [isLogin, role, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const res = await postLogin({ email, password });
            if (res && res.success) {
                const userRole = res.data.role;
                if (!userRole || !userRole.permissions || userRole.permissions.length === 0) {
                    message.error('Bạn không có quyền truy cập hệ thống quản trị.');
                    return;
                }
                
                dispatch(checkLogin(res.data));
                
                // Lưu vào localStorage để authReducer lấy lại sau khi F5
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: res.data.id,
                    fullName: res.data.fullName,
                    email: res.data.email,
                    phone: res.data.phone
                }));
                // Đối với admin role là object nên parse lại JSON string
                localStorage.setItem('role', JSON.stringify(res.data.role));

                message.success('Đăng nhập Quản trị viên thành công!');
                navigate('/admin');
            } else {
                message.error(res.message || 'Đăng nhập thất bại.');
            }
        } catch (error) {
            message.error('Lỗi hệ thống. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex flex-col justify-center items-center font-manrope px-4">
            <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-outline-variant/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl translate-x-10 translate-y-[-20px]"></div>
                
                <div className="relative z-10 text-center mb-8">
                    <h1 className="font-notoSerif italic text-3xl text-primary font-bold mb-2">Ethos Archive</h1>
                    <p className="text-sm text-on-surface-variant font-medium tracking-widest uppercase">Management Portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Email Quản trị</label>
                        <input 
                            type="email" 
                            required
                            className="w-full px-4 py-3 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary text-sm transition-all" 
                            placeholder="admin@ethos.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Mật khẩu</label>
                        <input 
                            type="password" 
                            required
                            className="w-full px-4 py-3 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary text-sm transition-all" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-primary text-white font-bold py-4 rounded-xl text-sm uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 mt-4 group relative overflow-hidden"
                    >
                        <span className="relative z-10">{isLoading ? 'Đang xác thực...' : 'Truy cập Hệ thống'}</span>
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </button>
                    
                    <div className="text-center mt-6">
                        <button type="button" onClick={() => navigate('/')} className="text-xs text-on-surface-variant hover:text-primary transition-colors hover:underline">
                            &larr; Trở về Trang Khách
                        </button>
                    </div>
                </form>
            </div>
            
            <p className="mt-8 text-xs text-outline font-medium tracking-widest uppercase">
                Ethos Internal System © 2026
            </p>
        </div>
    );
};

export default AdminLogin;
