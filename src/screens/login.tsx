import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, resendVerification } from '../services/auth'; // Pastikan resendVerification sudah dibuat
import { useNavigation } from '@react-navigation/native';

const GOLD = '#D4AF37';
const DARK_BG = '#111111';
const CARD_BG = '#1A1A1A';
const INPUT_BG = '#2A2A2A';
const BORDER_COLOR = '#3A3A3A';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // State khusus untuk email belum diverifikasi
  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const fadeAnim = useState(new Animated.Value(0))[0];
  const navigation = useNavigation<any>();

  // Proteksi: Kalau sudah login → langsung ke MainApp
  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      if (token && user) {
        navigation.replace('MainApp');
      }
    };
    checkLogin();
  }, [navigation]);

  const showModal = (type: 'success' | 'error', title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      // Reset state verifikasi setelah modal ditutup
      if (isEmailNotVerified) {
        setIsEmailNotVerified(false);
        setUnverifiedEmail('');
      }
    });
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      showModal('error', 'Email Wajib Diisi', 'Silakan masukkan alamat email Anda.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      showModal('error', 'Format Email Tidak Valid', 'Contoh: nama@email.com');
      return;
    }
    if (!password) {
      showModal('error', 'Password Wajib Diisi', 'Silakan masukkan kata sandi Anda.');
      return;
    }

    setLoading(true);
    setIsEmailNotVerified(false);
    setUnverifiedEmail('');

    try {
      const response = await login(email, password);

      // Simpan token & user
      await AsyncStorage.setItem('token', response.token || response.access_token || '');
      await AsyncStorage.setItem('user', JSON.stringify(response.user || {}));

      showModal('success', 'Login Berhasil ✨', 'Selamat datang kembali!');

      setTimeout(() => {
        hideModal();
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
        });
      }, 1200);
    } catch (error: any) {
      let message = 'Terjadi kesalahan';
      const statusCode = error.response?.status;

      if (error.response) {
        message = error.response.data?.message || 'Email atau password salah';

        // === PENANGANAN KHUSUS EMAIL BELUM DIVERIFIKASI ===
        if (statusCode === 403 && 
            message.toLowerCase().includes('belum diverifikasi')) {
          
          setIsEmailNotVerified(true);
          setUnverifiedEmail(email);

          showModal(
            'error',
            'Email Belum Diverifikasi',
            'Silakan cek inbox atau folder spam email Anda untuk link verifikasi.\n\n' +
            'Atau kirim ulang email verifikasi sekarang.'
          );
          return;
        }
      } else if (error.request) {
        message = 'Tidak bisa terhubung ke server';
      } else {
        message = error.message;
      }

      showModal('error', 'Login Gagal 🚫', message);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Kirim Ulang Verifikasi
  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;

    setResendLoading(true);

    try {
      await resendVerification(unverifiedEmail);

      showModal(
        'success',
        'Email Terkirim Ulang ✅',
        'Link verifikasi baru telah dikirim ke email Anda.\n\nSilakan cek inbox atau folder spam.'
      );

      setIsEmailNotVerified(false);
      setUnverifiedEmail('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal mengirim ulang email. Coba lagi nanti.';
      showModal('error', 'Gagal Mengirim Ulang', msg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logonw.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Login Vespa Expert</Text>
        <Text style={styles.subtitle}>Sistem Diagnosa Vespa Matic</Text>

        {/* Email */}
        <Text style={styles.label}>
          Email <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Isi Dengan Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#777"
        />

        {/* Password */}
        <Text style={styles.label}>
          Password <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Isi Dengan Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#777"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialCommunityIcons
              name={showPassword ? 'eye' : 'eye-off'}
              size={24}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPassword}>Lupa Password?</Text>
        </TouchableOpacity>

        {/* Button Login */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={[
            styles.button,
            loading ? styles.buttonLoading : styles.buttonNormal,
          ]}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#000" />
              <Text style={styles.loadingText}>Memproses...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Masuk</Text>
          )}
        </TouchableOpacity>

        {/* Register Link */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>
            Belum punya akun? <Text style={{ color: GOLD, fontWeight: 'bold' }}>Daftar di sini</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Custom */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
            <MaterialCommunityIcons
              name={modalType === 'success' ? 'check-circle' : 'alert-circle'}
              size={60}
              color={modalType === 'success' ? GOLD : '#EF4444'}
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>

            <TouchableOpacity
              style={[
                styles.modalButton,
                modalType === 'success' ? styles.successButton : styles.errorButton,
              ]}
              onPress={
                modalType === 'success' || !isEmailNotVerified
                  ? hideModal
                  : handleResendVerification
              }
              disabled={resendLoading}
            >
              <Text style={styles.modalButtonText}>
                {modalType === 'success'
                  ? 'OK, Lanjut'
                  : isEmailNotVerified
                  ? (resendLoading ? 'Mengirim...' : 'Kirim Ulang Verifikasi')
                  : 'Coba Lagi'}
              </Text>
            </TouchableOpacity>

            {/* Tombol Tutup tambahan jika email belum diverifikasi */}
            {isEmailNotVerified && modalType === 'error' && (
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#374151', marginTop: 12 }]}
                onPress={hideModal}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Tutup</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#AAAAAA',
    marginBottom: 36,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  required: {
    color: GOLD,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: INPUT_BG,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 18,
    color: '#FFFFFF',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: INPUT_BG,
    borderRadius: 20,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  eyeButton: {
    paddingHorizontal: 18,
  },
  forgotPassword: {
    color: GOLD,
    textAlign: 'right',
    marginBottom: 30,
    fontSize: 15,
  },
  button: {
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonNormal: {
    backgroundColor: GOLD,
  },
  buttonLoading: {
    backgroundColor: '#B8902F',
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  registerText: {
    textAlign: 'center',
    color: '#AAAAAA',
    fontSize: 15,
    marginTop: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 32,
    width: '82%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: GOLD,
  },
  errorButton: {
    backgroundColor: '#EF4444',
  },
  modalButtonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default LoginScreen;