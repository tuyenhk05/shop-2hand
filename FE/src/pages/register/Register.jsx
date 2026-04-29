/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { message } from 'antd';
import { postRegister } from "../../services/client/register";
import useScrollToTop from "../../hooks/useScrollToTop";
import AnimateWhenVisible from "../../helpers/animationScroll";
import imageRegister from "../../assets/images/image_register.png";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { socialLogin, handleGoogleLogin } from '../../services/client/social';
import { checkLogin } from "../../action/auth";


const Register = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isLoggedIn = useSelector((state) => state.auth.isLogin);
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn, navigate]);

    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [passwordVisibility, setPasswordVisibility] = useState({
        password: false,
        confirmPassword: false
    });

    // Initialize Facebook SDK
    useEffect(() => {
        window.fbAsyncInit = function () {
            FB.init({
                appId: import.meta.env.VITE_FACEBOOK_APP_ID,
                xfbml: true,
                version: 'v18.0'
            });
        };

        // Load the Facebook SDK script
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        if (submitError) {
            setSubmitError('');
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ tên';
        } else if (formData.fullName.trim().length < 3) {
            newErrors.fullName = 'Họ tên phải từ 3 ký tự trở lên';
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        } else {
            const phoneRegex = /^(0\d{9,10})$/;
            const cleanPhone = formData.phone.replace(/\D/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
            }
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Mật khẩu phải từ 8 ký tự trở lên';
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = 'Mật khẩu phải chứa ít nhất 1 ký tự hoa';
        } else if (!/[0-9]/.test(formData.password)) {
            newErrors.password = 'Mật khẩu phải chứa ít nhất 1 số';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu không khớp';
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
        setSubmitError('');

        try {
            const data = await postRegister({
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                phone: formData.phone.trim()
            });

            if (data?.success) {
                localStorage.setItem('token', data.data.token);

                message.success({
                    content: 'Đăng ký thành công!',
                    duration: 2,
                    onClose: () => {
                        navigate('/login');
                    }
                });
            } else {
                message.error(data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
                setSubmitError(data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            message.error('Có lỗi xảy ra. Vui lòng thử lại.');
            setSubmitError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setPasswordVisibility(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // ✅ Handle Google Login
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);

            // 1. Dùng helper để lấy ra object { token, provider }
            const authData = handleGoogleLogin(credentialResponse);

            if (!authData) {
                message.error('Không nhận được dữ liệu xác thực từ Google');
                return;
            }

            // 2. Gửi cục data đó xuống Backend thông qua hàm socialLogin
            const data = await socialLogin(authData.provider, authData.token);

            // 3. Xử lý kết quả Backend trả về
            if (data?.success) {
                localStorage.setItem('token', data.data.token);

                if (data.data.isNewUser) {
                    message.info('Vui lòng hoàn tất thông tin cá nhân');
                    sessionStorage.setItem('pendingUserData', JSON.stringify(data.data));
                    navigate('/complete-profile');
                } else {
                    message.success('Đăng nhập thành công!');

                    localStorage.setItem('user', JSON.stringify({
                        id: data.data.id,
                        fullName: data.data.fullName,
                        email: data.data.email,
                        phone: data.data.phone
                    }));
                    localStorage.setItem('role', data.data.role);

                    dispatch(checkLogin(data.data));
                    navigate('/');
                }

            } else {
                message.error(data?.message || 'Đăng nhập Google thất bại');
            }
        } catch (error) {
            console.error('Google login error:', error);
            message.error('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        message.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
    };


    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <div className="min-h-screen bg-surface flex flex-col">
                <div className="min-h-screen w-full bg-[#fef9f7] relative">
                    <div
                        className="absolute inset-0 z-0 pointer-events-none"
                        style={{
                            backgroundImage: `
        radial-gradient(circle at 20% 80%, rgba(255, 160, 146, 0.25) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 244, 228, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(255, 160, 146, 0.15) 0%, transparent 50%)`,
                        }}
                    />
                    <AnimateWhenVisible direction="fadeInUp" className="w-full">
                        <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4 md:px-6">
                            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-2xl bg-surface-container-low shadow-lg">
                                <div className="hidden lg:flex lg:col-span-5 relative overflow-hidden bg-gradient-to-br from-primary-container to-primary">
                                    <div className="absolute inset-0 opacity-30">
                                        <img
                                            className="w-full h-full object-cover"
                                            src={imageRegister}
                                            alt="Atelier Fabric"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary-container/80 to-transparent"></div>
                                    <div className="relative z-10 p-12 flex flex-col justify-end h-full text-white">
                                        <div className="space-y-6">
                                            <div className="w-12 h-1 bg-white/50 rounded-full"></div>
                                            <p className="font-headline text-3xl leading-snug tracking-tight font-semibold">
                                                "Thời trang bền vững không chỉ là một lựa chọn, đó là một di sản."
                                            </p>
                                            <p className="text-sm font-label uppercase tracking-widest text-white/80">
                                                The Conscious Collection
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-7 bg-surface-container-lowest p-6 md:p-12 lg:p-16 flex flex-col justify-center">
                                    <div className="max-w-md mx-auto w-full space-y-6">
                                        <div className="space-y-3 mb-8">
                                            <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-surface editorial-title">
                                                Gia nhập Cộng đồng Atelier.
                                            </h1>
                                            <p className="text-on-surface-variant leading-relaxed font-body text-sm">
                                                Bắt đầu hành trình tiêu dùng bền vững và khám phá những món đồ di sản được tuyển chọn.
                                            </p>
                                        </div>

                                        <form className="space-y-4" onSubmit={handleSubmit}>
                                            {submitError && (
                                                <div className="p-4 bg-error-container/20 border border-error/30 text-error rounded-lg text-sm font-medium">
                                                    {submitError}
                                                </div>
                                            )}

                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                                                    Họ và tên
                                                </label>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    placeholder="Nguyễn Văn A"
                                                    className={`w-full bg-surface-container-highest border rounded-lg px-4 py-3 text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${errors.fullName
                                                            ? 'border-error ring-2 ring-error/50 bg-error-container/10'
                                                            : 'border-outline-variant/30 hover:border-outline-variant/50'
                                                        }`}
                                                    required
                                                />
                                                {errors.fullName && (
                                                    <p className="text-xs text-error font-medium">{errors.fullName}</p>
                                                )}
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
                                                    className={`w-full bg-surface-container-highest border rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${errors.dateOfBirth
                                                            ? 'border-error ring-2 ring-error/50 bg-error-container/10'
                                                            : 'border-outline-variant/30 hover:border-outline-variant/50'
                                                        }`}
                                                    required
                                                />
                                                {errors.dateOfBirth && (
                                                    <p className="text-xs text-error font-medium">{errors.dateOfBirth}</p>
                                                )}
                                            </div>

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
                                                    className={`w-full bg-surface-container-highest border rounded-lg px-4 py-3 text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${errors.phone
                                                            ? 'border-error ring-2 ring-error/50 bg-error-container/10'
                                                            : 'border-outline-variant/30 hover:border-outline-variant/50'
                                                        }`}
                                                    required
                                                />
                                                {errors.phone && (
                                                    <p className="text-xs text-error font-medium">{errors.phone}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="example@atelier.com"
                                                        className={`w-full bg-surface-container-highest border rounded-lg px-4 py-3 text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${errors.email
                                                                ? 'border-error ring-2 ring-error/50 bg-error-container/10'
                                                                : 'border-outline-variant/30 hover:border-outline-variant/50'
                                                            }`}
                                                        required
                                                    />
                                                    {errors.email && (
                                                        <p className="text-xs text-error font-medium">{errors.email}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                                                        Mật khẩu
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={passwordVisibility.password ? 'text' : 'password'}
                                                            name="password"
                                                            value={formData.password}
                                                            onChange={handleChange}
                                                            placeholder="••••••••"
                                                            className={`w-full bg-surface-container-highest border rounded-lg px-4 py-3 text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${errors.password
                                                                    ? 'border-error ring-2 ring-error/50 bg-error-container/10'
                                                                    : 'border-outline-variant/30 hover:border-outline-variant/50'
                                                                }`}
                                                            required
                                                        />
                                                    </div>
                                                    {errors.password && (
                                                        <p className="text-xs text-error font-medium">{errors.password}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                                                    Xác nhận mật khẩu
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={passwordVisibility.confirmPassword ? 'text' : 'password'}
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        placeholder="••••••••"
                                                        className={`w-full bg-surface-container-highest border rounded-lg px-4 py-3 text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${errors.confirmPassword
                                                                ? 'border-error ring-2 ring-error/50 bg-error-container/10'
                                                                : 'border-outline-variant/30 hover:border-outline-variant/50'
                                                            }`}
                                                        required
                                                    />
                                                </div>
                                                {errors.confirmPassword && (
                                                    <p className="text-xs text-error font-medium">{errors.confirmPassword}</p>
                                                )}
                                            </div>

                                            <div className="pt-2 text-xs text-on-surface-variant leading-relaxed">
                                                <p>
                                                    Bằng cách tạo tài khoản, bạn đồng ý với{' '}
                                                    <a href="#" className="text-primary font-semibold hover:underline transition-colors">
                                                        Điều khoản dịch vụ
                                                    </a>
                                                    {' '}và{' '}
                                                    <a href="#" className="text-primary font-semibold hover:underline transition-colors">
                                                        Chính sách bảo mật
                                                    </a>
                                                </p>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="shadow-lg w-full py-3 bg-primary text-on-primary rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-300 mt-6"
                                            >
                                                {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ NGAY'}
                                            </button>
                                        </form>

                                        <div className="relative flex items-center py-4">
                                            <div className="flex-grow border-t border-outline-variant/30"></div>
                                            <span className="flex-shrink mx-4 text-xs font-semibold text-outline uppercase tracking-wider">
                                                Hoặc tiếp tục với
                                            </span>
                                            <div className="flex-grow border-t border-outline-variant/30"></div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <GoogleLogin
                                                onSuccess={handleGoogleSuccess}
                                                onError={handleGoogleError}
                                                render={(renderProps) => (
                                                    <button
                                                        type="button"
                                                        onClick={renderProps.onClick}
                                                        disabled={renderProps.disabled || loading}
                                                        className="flex items-center justify-center gap-2 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-semibold text-on-surface hover:bg-surface-container-low transition-all duration-300"
                                                    >
                                                        <img
                                                            className="w-5 h-5"
                                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpBXyTFZwosYROBxqLdbsvoq6iGBaGNj9gevPbqKtZUWU1FHSWatlDdwtQkc7jkkCloQ-J6kN80agH7uVO9QFvShQZZwWnR5-NFjoS-kWq7qESxkV6IAGSh8DqZg3CV8tU1AQpkXhc2CGizIH_0hvjoC-f9RQugAadz6ynISl3kQLNNR05CsaOgqZYYR7zqZJscacSaiujqHq1PctjkEB9mCWx287DujIfqmQvVK9kw4owlbZ0HzvOA2y8WQKVBmEHq1bCdkU1WCs"
                                                            alt="Google"
                                                        />
                                                        <span className="text-xs uppercase tracking-wider">Google</span>
                                                    </button>
                                                )}
                                            />


                                        </div>

                                        <div className="text-center pt-2">
                                            <p className="text-on-surface-variant text-sm">
                                                Bạn đã có tài khoản?{' '}
                                                <Link to="/login" className="text-primary font-bold hover:underline transition-colors">
                                                    Đăng nhập
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </AnimateWhenVisible>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default Register;