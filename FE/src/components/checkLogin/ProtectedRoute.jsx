import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AnimateWhenVisible from '../../helpers/animationScroll';

const ProtectedRoute = ({ children }) => {
    const isLogin = useSelector((state) => state.auth.isLogin);
    const navigate = useNavigate();

    if (!isLogin) {
        return (
            <main className="max-w-7xl mx-auto px-6 pt-40 pb-40 font-manrope text-center">
                <AnimateWhenVisible direction="fade">
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-primary">lock</span>
                        </div>
                        <h1 className="font-notoSerif font-black text-3xl tracking-tight">
                            Bạn cần đăng nhập để xem trang này
                        </h1>
                        <p className="text-on-surface-variant max-w-md mx-auto">
                            Vui lòng đăng nhập để truy cập vào nội dung này.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-primary text-on-primary px-10 py-3 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95 shadow-lg"
                        >
                            Đăng nhập ngay
                        </button>
                    </div>
                </AnimateWhenVisible>
            </main>
        );
    }

    // Nếu đã login, trả về nội dung của trang đó (children)
    return children;
};

export default ProtectedRoute;