import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Checkbox, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postLogin } from '../../services/client/login';
import { checkLogin } from '../../actions/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import image from assets
const imageLogin = require('../../../assets/images/image_login.png');
const logo = require('../../../assets/images/logo.png');

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isLoggedIn = useSelector((state) => state.auth.isLogin);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigation.replace('Main');
    }
  }, [isLoggedIn, navigation]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (submitError) setSubmitError('');
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

  const handleSubmit = async () => {
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
        await AsyncStorage.setItem('token', data.data.token);
        await AsyncStorage.setItem('user', JSON.stringify({
          id: data.data.id,
          fullName: data.data.fullName,
          email: data.data.email,
          phone: data.data.phone
        }));
        await AsyncStorage.setItem('role', data.data.role);
        
        dispatch(checkLogin(data.data));

        if (rememberMe) {
          await AsyncStorage.setItem('rememberMe', formData.email);
        }

        const destination = data.data.role === 'admin' ? 'Dashboard' : 'Main';
        Alert.alert('Thành công', 'Đăng nhập thành công!', [
          { text: 'OK', onPress: () => navigation.replace(destination) }
        ]);
      } else {
        const errorMsg = data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
        setSubmitError(errorMsg);
        Alert.alert('Lỗi', errorMsg);
      }
    } catch (error) {
      console.error('Login error:', error);
      setSubmitError('Có lỗi xảy ra. Vui lòng thử lại.');
      Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginMock = () => {
    Alert.alert("Google Login", "Tính năng đăng nhập Google cần cấu hình Firebase/Expo Auth Session.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.formContainer}>
            <Image source={imageLogin} style={styles.bannerImage} resizeMode="cover" />
            <Text style={styles.title}>Chào mừng trở lại.</Text>
            <Text style={styles.subtitle}>Đăng nhập vào tài khoản Atelier của bạn.</Text>

            {submitError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{submitError}</Text>
              </View>
            ) : null}

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
                secureTextEntry={!passwordVisibility}
                right={<TextInput.Icon icon={passwordVisibility ? "eye-off" : "eye"} onPress={() => setPasswordVisibility(!passwordVisibility)} />}
                error={!!errors.password}
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#FF8A65"
              />
              {errors.password ? <Text style={styles.helperText}>{errors.password}</Text> : null}
            </View>

            <View style={styles.optionsRow}>
              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={rememberMe ? 'checked' : 'unchecked'}
                  onPress={() => setRememberMe(!rememberMe)}
                  color="#FF8A65"
                />
                <Text style={styles.checkboxLabel}>Ghi nhớ tôi</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
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
              ĐĂNG NHẬP
            </Button>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>HOẶC</Text>
              <View style={styles.divider} />
            </View>

            <Button
              mode="outlined"
              icon="google"
              onPress={handleGoogleLoginMock}
              style={styles.googleButton}
              textColor="#333"
            >
              ĐĂNG NHẬP VỚI GOOGLE
            </Button>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Bạn chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerText}>Đăng ký ngay</Text>
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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
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
    marginBottom: 16,
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8, // Adjust for checkbox default padding
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#666',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8A65',
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
    letterSpacing: 2,
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
  registerText: {
    color: '#FF8A65',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
