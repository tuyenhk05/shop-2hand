import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import { forgotPassword, resetPassword } from '../../services/client/changePassword';

const ChangePassword = () => {
    const { email: reduxEmail } = useSelector((state) => state.auth);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: reduxEmail || '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOTP = async (e) => {
        if (e) e.preventDefault();
        if (!formData.email) return message.error('Vui lòng nhập email');

        setLoading(true);
        try {
            const data = await forgotPassword({ email: formData.email });

            if (data.success) {
                message.success('Đã gửi mã OTP đến email của bạn!');
                setStep(2);
            } else {
                message.error(data.message);
            }
        } catch (error) {
            message.error('Lỗi kết nối đến máy chủ');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!formData.otp || !formData.newPassword) return message.error('Vui lòng điền đầy đủ thông tin');
        if (formData.newPassword !== formData.confirmPassword) return message.error('Mật khẩu xác nhận không khớp');

        setLoading(true);
        try {
            const data = await resetPassword({
                email: formData.email,
                otp: formData.otp,
                newPassword: formData.newPassword
            });

            if (data.success) {
                message.success('Đổi mật khẩu thành công!');
                setFormData({ ...formData, otp: '', newPassword: '', confirmPassword: '' });
                setStep(1);
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
        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
            <h3 className="font-notoSerif text-xl font-bold text-on-surface mb-4">Thay đổi mật khẩu</h3>
            
            {step === 1 && (
                <form onSubmit={handleSendOTP} className="space-y-5">
                    <p className="text-on-surface-variant text-sm">
                        Nhập email của bạn để nhận mã OTP xác nhận thay đổi mật khẩu.
                    </p>
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

            {step === 2 && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                    <p className="text-on-surface-variant text-sm">
                        Mã OTP đã được gửi đến <strong>{formData.email}</strong>.
                    </p>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Mã OTP (6 chữ số)</label>
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
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex-1 py-3 bg-surface-container-highest text-on-surface-variant rounded-lg font-bold text-sm"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-3 bg-primary text-on-primary rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ChangePassword;
