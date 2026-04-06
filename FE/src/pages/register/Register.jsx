    import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { message } from 'antd';
import { postRegister } from "../../services/register"; 
import useScrollToTop from "../../hooks/useScrollToTop";
import AnimateWhenVisible from "../../helpers/animationScroll";

const Register = () => {
    useScrollToTop();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    confirmPassword: false});

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
      // Import postRegister service      
      const data = await postRegister({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone.trim()
      });

      if (data?.success) {
        localStorage.setItem('token', data.data.token);
        
        // Hiển thị thông báo thành công
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

  const handleSocialRegister = (provider) => {
    console.log(`Register with ${provider}`);
    alert(`Chức năng đăng ký qua ${provider} sẽ được kích hoạt sớm`);
  };

  return (
      <div className="min-h-screen bg-surface flex flex-col">
          {/* Visual Side */}              <AnimateWhenVisible direction="fadeInUp" className="w-full">

          <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4 md:px-6">

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-2xl bg-surface-container-low shadow-lg">

          <div className="hidden lg:flex lg:col-span-5 relative overflow-hidden bg-gradient-to-br from-primary-container to-primary">
            <div className="absolute inset-0 opacity-30">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCHfgKkjFz2K3maWH8mG7IZkIdDbtahgZKoCzsw5LrkIYGy61s8iIKeuxK8ywqcRNMU7wIfAOKHDmBGgBbzsq5ZJMlRKWDwiwd08M4NFQLg9k20DBIjQvq74GLLTaeuh9Nr6wzOeZtQWTLnsx_Uu4pQKVjgb9RMFEFhqLEumEpYYe_DdnkQd9BGO8Plve1E8c359GtiyzMr-ZvD4DQY5LoPmi-zTzHwTVWX0pO72q6loODFvTrOt9uLs64AfHmnR95cub5yjQr3RU"
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
          {/* Form Side */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-6 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full space-y-6">
              {/* Header */}
              <div className="space-y-3 mb-8">
                <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-surface editorial-title">
                  Gia nhập Cộng đồng Atelier.
                </h1>
                <p className="text-on-surface-variant leading-relaxed font-body text-sm">
                  Bắt đầu hành trình tiêu dùng bền vững và khám phá những món đồ di sản được tuyển chọn.
                </p>
              </div>

              {/* Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Error Alert */}
                {submitError && (
                  <div className="p-4 bg-error-container/20 border border-error/30 text-error rounded-lg text-sm font-medium">
                    {submitError}
                  </div>
                )}

                {/* Full Name */}
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
                    className={`w-full bg-surface-container-highest border rounded-lg px-4 py-3 text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
                      errors.fullName
                        ? 'border-error ring-2 ring-error/50 bg-error-container/10'
                        : 'border-outline-variant/30 hover:border-outline-variant/50'
                    }`}
                    required
                  />
                  {errors.fullName && (
                    <p className="text-xs text-error font-medium">{errors.fullName}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`w-full bg-surface-container-highest border rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
                      errors.dateOfBirth
                        ? 'border-error ring-2 ring-error/50 bg-error-container/10'
                        : 'border-outline-variant/30 hover:border-outline-variant/50'
                    }`}
                    required
                  />
                  {errors.dateOfBirth && (
                    <p className="text-xs text-error font-medium">{errors.dateOfBirth}</p>
                  )}
                </div>

                {/* Phone */}
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
                    className={`w-full bg-surface-container-highest border rounded-lg px-4 py-3 text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
                      errors.phone
                        ? 'border-error ring-2 ring-error/50 bg-error-container/10'
                        : 'border-outline-variant/30 hover:border-outline-variant/50'
                    }`}
                    required
                  />
                  {errors.phone && (
                    <p className="text-xs text-error font-medium">{errors.phone}</p>
                  )}
                </div>

                {/* Email and Password Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
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
                      className={`w-full bg-surface-container-highest border rounded-lg px-4 py-3 text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
                        errors.email
                          ? 'border-error ring-2 ring-error/50 bg-error-container/10'
                          : 'border-outline-variant/30 hover:border-outline-variant/50'
                      }`}
                      required
                    />
                    {errors.email && (
                      <p className="text-xs text-error font-medium">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
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
                        className={`w-full bg-surface-container-highest border rounded-lg px-4 py-3 pr-10 text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
                          errors.password
                            ? 'border-error ring-2 ring-error/50 bg-error-container/10'
                            : 'border-outline-variant/30 hover:border-outline-variant/50'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('password')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {passwordVisibility.password ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          )}
                        </svg>
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-error font-medium">{errors.password}</p>
                    )}
                  </div>
                </div>

                {/* Confirm Password */}
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
                      className={`w-full bg-surface-container-highest border rounded-lg px-4 py-3 pr-10 text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
                        errors.confirmPassword
                          ? 'border-error ring-2 ring-error/50 bg-error-container/10'
                          : 'border-outline-variant/30 hover:border-outline-variant/50'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {passwordVisibility.confirmPassword ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        )}
                      </svg>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-error font-medium">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms & Privacy */}
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-300 mt-6"
                >
                  {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ NGAY'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-outline-variant/30"></div>
                <span className="flex-shrink mx-4 text-xs font-semibold text-outline uppercase tracking-wider">
                  Hoặc tiếp tục với
                </span>
                <div className="flex-grow border-t border-outline-variant/30"></div>
              </div>

              {/* Social Register */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialRegister('google')}
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
                  onClick={() => handleSocialRegister('facebook')}
                  className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-xs uppercase tracking-wider">Facebook</span>
                </button>
              </div>

              {/* Footer Link */}
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

      </div >
     
  );
};

export default Register;