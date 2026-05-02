import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postRegister } from '../../services/client/register';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native';

const imageRegister = require('../../../assets/images/image_register.png');
const logo = require('../../../assets/images/logo.png');

const RegisterScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLogin);

  useEffect(() => {
    if (isLoggedIn) {
      navigation.replace('Home');
    }
  }, [isLoggedIn, navigation]);

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

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (submitError) setSubmitError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Họ tên phải từ 3 ký tự trở lên';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Vui lòng nhập ngày sinh';
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

  const handleSubmit = async () => {
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
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth // Adding this to the payload if needed, although original only sent others. Wait, original FE didn't send dateOfBirth? "dateOfBirth: formData.dateOfBirth" was missing in original postRegister payload. I'll include it just in case.
      });

      if (data?.success) {
        await AsyncStorage.setItem('token', data.data.token);
        Alert.alert('Thành công', 'Đăng ký thành công!', [
          { text: 'OK', onPress: () => navigation.replace('Login') }
        ]);
      } else {
        const errorMsg = data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        setSubmitError(errorMsg);
        Alert.alert('Lỗi', errorMsg);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError('Có lỗi xảy ra. Vui lòng thử lại.');
      Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleGoogleLoginMock = () => {
    Alert.alert("Google Login", "Tính năng đăng nhập Google cần cấu hình Firebase/Expo Auth Session.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.formContainer}>
            <Image source={imageRegister} style={styles.bannerImage} resizeMode="cover" />
            <Text style={styles.title}>Gia nhập Cộng đồng Atelier.</Text>
            <Text style={styles.subtitle}>Bắt đầu hành trình tiêu dùng bền vững và khám phá những món đồ di sản được tuyển chọn.</Text>

            {submitError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{submitError}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <TextInput
                label="Họ và tên"
                value={formData.fullName}
                onChangeText={(text) => handleChange('fullName', text)}
                mode="outlined"
                error={!!errors.fullName}
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#FF8A65"
              />
              {errors.fullName ? <Text style={styles.helperText}>{errors.fullName}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                label="Ngày sinh (YYYY-MM-DD)"
                value={formData.dateOfBirth}
                onChangeText={(text) => handleChange('dateOfBirth', text)}
                mode="outlined"
                error={!!errors.dateOfBirth}
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#FF8A65"
              />
              {errors.dateOfBirth ? <Text style={styles.helperText}>{errors.dateOfBirth}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                label="Số điện thoại"
                value={formData.phone}
                onChangeText={(text) => handleChange('phone', text)}
                mode="outlined"
                keyboardType="phone-pad"
                error={!!errors.phone}
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#FF8A65"
              />
              {errors.phone ? <Text style={styles.helperText}>{errors.phone}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#FF8A65"
              />
              {errors.email ? <Text style={styles.helperText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                label="Mật khẩu"
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                mode="outlined"
                secureTextEntry={!passwordVisibility.password}
                right={<TextInput.Icon icon={passwordVisibility.password ? "eye-off" : "eye"} onPress={() => togglePasswordVisibility('password')} />}
                error={!!errors.password}
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#FF8A65"
              />
              {errors.password ? <Text style={styles.helperText}>{errors.password}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                label="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
                mode="outlined"
                secureTextEntry={!passwordVisibility.confirmPassword}
                right={<TextInput.Icon icon={passwordVisibility.confirmPassword ? "eye-off" : "eye"} onPress={() => togglePasswordVisibility('confirmPassword')} />}
                error={!!errors.confirmPassword}
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#FF8A65"
              />
              {errors.confirmPassword ? <Text style={styles.helperText}>{errors.confirmPassword}</Text> : null}
            </View>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                Bằng cách tạo tài khoản, bạn đồng ý với{' '}
                <Text style={styles.linkText}>Điều khoản dịch vụ</Text> và{' '}
                <Text style={styles.linkText}>Chính sách bảo mật</Text>
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
              labelStyle={styles.submitButtonText}
              buttonColor="#FF8A65"
            >
              ĐĂNG KÝ NGAY
            </Button>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>HOẶC TIẾP TỤC VỚI</Text>
              <View style={styles.divider} />
            </View>

            <Button
              mode="outlined"
              icon="google"
              onPress={handleGoogleLoginMock}
              style={styles.googleButton}
              textColor="#333"
            >
              GOOGLE
            </Button>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Bạn đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f7',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  logo: {
    width: 120,
    height: 40,
  },
  bannerImage: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    marginBottom: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#FDECEA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F5C6CB',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
  },
  helperText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  termsContainer: {
    marginVertical: 16,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  linkText: {
    color: '#FF8A65',
    fontWeight: 'bold',
  },
  submitButton: {
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 24,
  },
  submitButtonText: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  googleButton: {
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 6,
    marginBottom: 32,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  loginText: {
    color: '#FF8A65',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
