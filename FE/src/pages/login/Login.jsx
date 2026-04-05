import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { postLogin } from "../../services/login";
import AnimateWhenVisible from "../../helpers/animationScroll";
import useScrollToTop from "../../hooks/useScrollToTop";


const Login = () => {
    useScrollToTop();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(false);

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

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải từ 8 ký tự trở lên';
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
      const data = await postLogin({
        email: formData.email.trim(),
        password: formData.password
      });

      if (data?.success) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify({
              id: data.data.id,
              fullName: data.data.fullName,
              email: data.data.email,
              phone: data.data.phone
          }));
          localStorage.setItem('role', data.data.role);
        if (rememberMe) {
          localStorage.setItem('rememberMe', formData.email);
          }
          if (data.data.role === 'admin') {
              navigate('/admin/dashboard');
          } else {
        navigate('/home');

          }
      } else {
        setSubmitError(data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setSubmitError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility);
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    alert(`Chức năng đăng nhập qua ${provider} sẽ được kích hoạt sớm`);
  };

  return (
      <div className="min-h-screen bg-surface flex flex-col">

          <AnimateWhenVisible direction="slideFromRight">
              <div className="fixed bottom-8 right-8 hidden md:block">
                  <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-xl shadow-on-surface/5 ghost-border max-w-[280px]">
                      <div className="flex items-center gap-3 mb-4">
                          <svg
                              className="w-5 h-5 text-primary"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                          >
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                          </svg>
                          <span className="text-xs font-bold uppercase tracking-tighter text-on-surface-variant">
                              Tác động bền vững
                          </span>
                      </div>
                      <div className="space-y-4">
                          <input
                              type="range"
                              min="1"
                              max="10"
                              defaultValue="7"
                              className="w-full h-1.5 bg-primary-fixed rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                          <div className="flex justify-between items-end">
                              <div>
                                  <span className="block text-2xl font-headline font-bold text-primary">
                                      12.5kg
                                  </span>
                                  <span className="text-[10px] text-on-surface-variant uppercase font-medium">
                                      CO2 Tiết kiệm mỗi lần trao đổi
                                  </span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </AnimateWhenVisible>
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4 md:px-6 min-h-screen">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
          {/* Visual Column */}
          <AnimateWhenVisible direction="slideFromLeft">
            <div className="hidden lg:flex flex-col justify-center bg-surface-container-low p-12 relative overflow-hidden min-h-[500px]">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-container to-transparent"></div>
              <div className="relative z-10 space-y-8 max-w-md">
                <AnimateWhenVisible direction="fadeInUp" transition={{ duration: 0.8, ease: "easeInOut" }}>
                  <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl transform -rotate-1">
                    <img
                      alt="Interior Atelier"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0EJbLvthqwTjBxd13L78TCPJW0RHskdtpQYg4VU0xhyRxNQCScTXOWU47aqPkuxXww_NeLoEsmJUjMLl4VxK-d_ZVbM1PIr6puthN5mQEv_4HIl94abz9EIZPu0z4D5KRPn8NgsxspdvPDe-NToAkiiJ0nUohAizJbm8nUKkarIzVt61q5i1GurwYmpkLN1dMCoDxj-_YJMHcxi78LOk4lsE_epyt5cxLKRrzz43Rqc2wWiByNlvZbdWbUN81G7eaw0dZNA1G9SI"
                    />
                  </div>
                </AnimateWhenVisible>

                <AnimateWhenVisible direction="fadeInUp" transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}>
                  <div className="relative z-10 max-w-md">
                    <h2 className="font-headline text-4xl text-primary-fixed-variant leading-tight italic font-semibold">
                      Di sản được tái tạo.
                    </h2>
                    <p className="mt-4 text-on-surface-variant font-body leading-relaxed max-w-xs">
                      Nơi những món đồ cũ tìm thấy câu chuyện mới qua lăng kính của sự tinh tế và bền vững.
                    </p>
                  </div>
                </AnimateWhenVisible>
              </div>
            </div>
          </AnimateWhenVisible>

          {/* Form Column */}
          <AnimateWhenVisible direction="slideFromRight">
            <div className="flex items-center justify-center p-6 md:p-12 lg:p-24 bg-surface">
              <div className="w-full max-w-[420px] space-y-10">
                {/* Heading */}
                <AnimateWhenVisible direction="fadeInDown" transition={{ duration: 0.8, ease: "easeInOut" }}>
                  <div className="space-y-3">
                    <h1 className="font-headline text-4xl font-bold text-on-background editorial-title">
                      Chào mừng trở lại.
                    </h1>
                    <p className="text-on-surface-variant font-body">
                      Đăng nhập vào tài khoản Atelier của bạn.
                    </p>
                  </div>
                </AnimateWhenVisible>

                {/* Form */}
                <AnimateWhenVisible direction="fadeInUp" transition={{ duration: 1, delay: 0.1, ease: "easeInOut" }}>
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Error Alert */}
                    {submitError && (
                      <div className="p-4 bg-error-container/20 border border-error/30 text-error rounded-lg text-sm font-medium">
                        {submitError}
                      </div>
                    )}

                    <div className="space-y-5">
                      {/* Email Input */}
                      <div className="space-y-2">
                        <label
                          className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                          htmlFor="email"
                        >
                          Email
                        </label>
                        <div className="relative">
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@atelier.com"
                            className={`w-full bg-surface-container-highest border rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all duration-300 placeholder:text-outline/50 ${
                              errors.email
                                ? 'border-error ring-2 ring-error/50 bg-error-container/10'
                                : 'border-outline-variant/30 hover:border-outline-variant/50'
                            }`}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-xs text-error font-medium">{errors.email}</p>
                        )}
                      </div>

                      {/* Password Input */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label
                            className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                            htmlFor="password"
                          >
                            Mật khẩu
                          </label>
                        </div>
                        <div className="relative">
                          <input
                            id="password"
                            name="password"
                            type={passwordVisibility ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className={`w-full bg-surface-container-highest border rounded-xl px-5 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all duration-300 placeholder:text-outline/50 ${
                              errors.password
                                ? 'border-error ring-2 ring-error/50 bg-error-container/10'
                                : 'border-outline-variant/30 hover:border-outline-variant/50'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                          >
                            {passwordVisibility ? (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-xs text-error font-medium">{errors.password}</p>
                        )}
                      </div>
                    </div>

                    {/* Options */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary transition-all cursor-pointer accent-primary"
                        />
                        <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                          Ghi nhớ tôi
                        </span>
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-sm font-semibold text-primary hover:underline transition-all"
                      >
                        Quên mật khẩu?
                      </Link>
                    </div>

                    {/* Main Action */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold tracking-widest text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg shadow-primary/10"
                    >
                      {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
                    </button>
                  </form>
                </AnimateWhenVisible>

                {/* Divider */}
                <AnimateWhenVisible direction="fade" transition={{ duration: 0.8, ease: "easeInOut" }}>
                  <div className="relative flex items-center py-4">
                    <div className="flex-grow border-t border-outline-variant/30"></div>
                    <span className="flex-shrink mx-4 text-xs font-bold text-outline uppercase tracking-[0.2em]">
                      Hoặc
                    </span>
                    <div className="flex-grow border-t border-outline-variant/30"></div>
                  </div>
                </AnimateWhenVisible>

                {/* Social Logins */}
                <AnimateWhenVisible direction="fadeInUp" transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}>
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('google')}
                      className="flex items-center justify-center gap-2 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-semibold text-on-surface hover:bg-surface-container-low transition-all duration-300"
                    >
                      <img
                        className="w-5 h-5"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpBXyTFZwosYROBxqLdbsvoq6iGBaGNj9gevPbqKtZUWU1FHSWatlDdwtQkc7jkkCloQ-J6kN80agH7uVO9QFvShQZZwWnR5-NFjoS-kWq7qESxkV6IAGSh8DqZg3CV8tU1AQpkXhc2CGizIH_0hvjoC-f9RQugAadz6ynISl3kQLNNR05CsaOgqZYYR7zqZJscacSaiujqHq1PctjkEB9mCWx287DujIfqmQvVK9kw4owlbZ0HzvOA2y8WQKVBmEHq1bCdkU1WCs"
                        alt="Google"
                      />
                      <span className="text-xs uppercase tracking-wider">Google</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('facebook')}
                      className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span className="text-xs uppercase tracking-wider">Facebook</span>
                    </button>
                  </div>
                </AnimateWhenVisible>

                {/* Footer Link */}
                <AnimateWhenVisible direction="fadeInUp" transition={{ duration: 1, delay: 0.3, ease: "easeInOut" }}>
                  <div className="text-center pt-4">
                    <p className="text-on-surface-variant text-sm">
                      Bạn chưa có tài khoản?{' '}
                      <Link
                        to="/register"
                        className="text-primary font-bold hover:underline transition-colors ml-1"
                      >
                        Đăng ký ngay
                      </Link>
                    </p>
                  </div>
                </AnimateWhenVisible>
              </div>
            </div>
          </AnimateWhenVisible>
        </div>
      </main>

      {/* Eco-Impact Slider */}
     
    </div>
  );
};

export default Login;