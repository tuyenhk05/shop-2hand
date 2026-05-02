import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { forgotPassword, resetPassword } from '../../services/client/changePassword';
import { SafeAreaView } from 'react-native-safe-area-context';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    setLoading(true);
    try {
      const data = await forgotPassword({ email: formData.email });

      if (data.success) {
        Alert.alert('Thành công', 'Đã gửi mã OTP đến email của bạn!');
        setStep(2);
      } else {
        Alert.alert('Lỗi', data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.otp || !formData.newPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      const data = await resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });

      if (data.success) {
        Alert.alert('Thành công', 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', [
          { text: 'OK', onPress: () => navigation.replace('Login') }
        ]);
      } else {
        Alert.alert('Lỗi', data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Quên mật khẩu?</Text>
              <Text style={styles.subtitle}>
                {step === 1
                  ? "Nhập email của bạn để nhận mã xác nhận đặt lại mật khẩu."
                  : "Nhập mã OTP gồm 6 chữ số vừa được gửi đến email của bạn."}
              </Text>
            </View>

            {step === 1 && (
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <TextInput
                    label="Email của bạn"
                    value={formData.email}
                    onChangeText={(text) => handleChange('email', text)}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    outlineColor="#E0E0E0"
                    activeOutlineColor="#FF8A65"
                  />
                </View>
                <Button
                  mode="contained"
                  onPress={handleSendOTP}
                  loading={loading}
                  disabled={loading}
                  style={styles.submitButton}
                  labelStyle={styles.submitButtonText}
                  buttonColor="#FF8A65"
                >
                  GỬI MÃ XÁC NHẬN
                </Button>
              </View>
            )}

            {step === 2 && (
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <TextInput
                    label="Mã OTP"
                    value={formData.otp}
                    onChangeText={(text) => handleChange('otp', text)}
                    mode="outlined"
                    maxLength={6}
                    keyboardType="number-pad"
                    style={[styles.input, styles.otpInput]}
                    outlineColor="#E0E0E0"
                    activeOutlineColor="#FF8A65"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <TextInput
                    label="Mật khẩu mới"
                    value={formData.newPassword}
                    onChangeText={(text) => handleChange('newPassword', text)}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    outlineColor="#E0E0E0"
                    activeOutlineColor="#FF8A65"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <TextInput
                    label="Xác nhận mật khẩu mới"
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleChange('confirmPassword', text)}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    outlineColor="#E0E0E0"
                    activeOutlineColor="#FF8A65"
                  />
                </View>
                <Button
                  mode="contained"
                  onPress={handleResetPassword}
                  loading={loading}
                  disabled={loading}
                  style={styles.submitButton}
                  labelStyle={styles.submitButtonText}
                  buttonColor="#FF8A65"
                >
                  ĐẶT LẠI MẬT KHẨU
                </Button>
                <TouchableOpacity onPress={() => setStep(1)} style={styles.resendButton}>
                  <Text style={styles.resendText}>Gửi lại mã</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Quay lại trang đăng nhập</Text>
            </TouchableOpacity>
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
    justifyContent: 'center',
    padding: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fafafa',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 20,
    letterSpacing: 8,
    fontWeight: 'bold',
  },
  submitButton: {
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonText: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendText: {
    color: '#FF8A65',
    fontWeight: '600',
    fontSize: 14,
  },
  backButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  backButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ForgotPasswordScreen;
