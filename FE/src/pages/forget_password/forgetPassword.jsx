import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { message } from 'antd';
import AnimateWhenVisible from "../../helpers/animationScroll";
import useScrollToTop from "../../hooks/useScrollToTop";

const ForgotPassword = () => {
    useScrollToTop();
    const navigate = useNavigate();

    // Quản lý các bước: 1 (Nhập Email), 2 (Nhập OTP & Pass mới)
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Gửi yêu cầu lấy mã OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!formData.email) return message.error('Vui lòng nhập email');

        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await response.json();

            if (data.success) {
                message.success('Đã gửi mã OTP đến email của bạn!');
                setStep(2); // Chuyển sang bước nhập OTP
            } else {
                message.error(data.message);
            }
        } catch (error) {
            message.error('Lỗi kết nối đến máy chủ');
        } finally {
            setLoading(false);
        }
    };

    // Xác nhận đổi mật khẩu
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!formData.otp || !formData.newPassword) return message.error('Vui lòng điền đầy đủ thông tin');
        if (formData.newPassword !== formData.confirmPassword) return message.error('Mật khẩu xác nhận không khớp');

        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    otp: formData.otp,
                    newPassword: formData.newPassword
                })
            });
            const data = await response.json();

            if (data.success) {
                message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
                navigate('/login'); // Đá về trang đăng nhập
            } else {
                message.error(data.message);
            }
        } catch (error) {
            message.error('Lỗi kết nối đến máy chủ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fef9f7] flex items-center justify-center p-4">
            <AnimateWhenVisible direction="fadeInUp">
                <div className="bg-surface-container-lowest p-8 md:p-12 rounded-2xl shadow-lg border border-outline-variant/20 max-w-md w-full">
                    <div className="text-center mb-8">
                        <h1 className="font-headline text-3xl font-bold text-on-surface mb-2">
                            Quên mật khẩu?
                        </h1>
                        <p className="text-on-surface-variant text-sm">
                            {step === 1
                                ? "Nhập email của bạn để nhận mã xác nhận đặt lại mật khẩu."
                                : "Nhập mã OTP gồm 6 chữ số vừa được gửi đến email của bạn."}
                        </p>
                    </div>

                    {/* BƯỚC 1: NHẬP EMAIL */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Email của bạn</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@atelier.com"
                                    className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                                {loading ? 'ĐANG GỬI...' : 'GỬI MÃ XÁC NHẬN'}
                            </button>
                        </form>
                    )}

                    {/* BƯỚC 2: NHẬP OTP & MẬT KHẨU MỚI */}
                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Mã OTP</label>
                                <input
                                    type="text"
                                    name="otp"
                                    maxLength="6"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    placeholder="123456"
                                    className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-center tracking-[0.5em] font-bold text-lg"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Xác nhận mật khẩu mới</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                                {loading ? 'ĐANG XỬ LÝ...' : 'ĐẶT LẠI MẬT KHẨU'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full py-2 text-primary font-semibold text-sm hover:underline"
                            >
                                Gửi lại mã
                            </button>
                        </form>
                    )}

                    <div className="text-center pt-6">
                        <Link to="/login" className="text-on-surface-variant text-sm font-semibold hover:text-primary transition-colors">
                            ← Quay lại trang đăng nhập
                        </Link>
                    </div>
                </div>
            </AnimateWhenVisible>
        </div>
    );
};

export default ForgotPassword;