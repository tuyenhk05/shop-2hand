import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import useScrollToTop from "../../hooks/useScrollToTop";
import AnimateWhenVisible from "../../helpers/animationScroll";
import { useSelector } from 'react-redux';
const CompleteProfile = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        phone: '',
        dateOfBirth: ''
    });
    const [errors, setErrors] = useState({});

    // Kiểm tra xem user có được phép vào trang này không
    useEffect(() => {
        const pendingData = sessionStorage.getItem('pendingUserData');
        const token = localStorage.getItem('token');

        if (!pendingData || !token) {
            message.warning('Vui lòng đăng nhập để tiếp tục');
            navigate('/login');
            return;
        }
        if (user) {
            navigate('/');
            return;
        }

        setUserData(JSON.parse(pendingData));
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        } else {
            const phoneRegex = /^(0\d{9,10})$/;
            const cleanPhone = formData.phone.replace(/\D/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
            }
        }
        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            console.log(import.meta.env.VITE_API_URL);

            // Gọi API cập nhật thông tin
            const response = await fetch(`${apiUrl}/auth/complete-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Gửi token lên để xác thực
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data?.success) {
                message.success('Cập nhật thông tin thành công!');
                sessionStorage.removeItem('pendingUserData'); // Xóa data tạm
                navigate('/'); // Chuyển về trang chủ
            } else {
                message.error(data?.message || 'Cập nhật thất bại. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            message.error('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (!userData) return null; // Tránh render nháy trước khi redirect

    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 bg-[#fef9f7]">
            <AnimateWhenVisible direction="fadeInUp" className="w-full max-w-md">
                <div className="bg-surface-container-lowest p-8 md:p-10 rounded-2xl shadow-lg border border-outline-variant/20">
                    <div className="text-center mb-8 space-y-3">
                        <div className="flex justify-center mb-4">
                            {userData.avatar ? (
                                <img src={userData.avatar} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-primary/20 object-cover" />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                    {userData.fullName?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <h1 className="font-headline text-2xl font-bold text-on-surface">
                            Chào mừng, {userData.fullName}!
                        </h1>
                        <p className="text-on-surface-variant text-sm">
                            Vui lòng bổ sung một số thông tin để hoàn tất việc tạo tài khoản và trải nghiệm tốt nhất.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="0901 234 567"
                                className={`w-full bg-surface-container-highest border rounded-lg px-4 py-3 text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${errors.phone ? 'border-error ring-2 ring-error/50' : 'border-outline-variant/30 hover:border-outline-variant/50'
                                    }`}
                            />
                            {errors.phone && <p className="text-xs text-error font-medium">{errors.phone}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                                Ngày sinh
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className={`w-full bg-surface-container-highest border rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${errors.dateOfBirth ? 'border-error ring-2 ring-error/50' : 'border-outline-variant/30 hover:border-outline-variant/50'
                                    }`}
                            />
                            {errors.dateOfBirth && <p className="text-xs text-error font-medium">{errors.dateOfBirth}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mt-6 shadow-md"
                        >
                            {loading ? 'ĐANG XỬ LÝ...' : 'HOÀN TẤT ĐĂNG KÝ'}
                        </button>
                    </form>
                </div>
            </AnimateWhenVisible>
        </div>
    );
};

export default CompleteProfile;