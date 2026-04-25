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


const ACCENT       = '#4A90E2';   // biru utama (soft)
const BG           = '#FFFFFF';   // background putih
const CARD_BG      = '#EAF4FF';   // biru sangat muda
const INPUT_BG     = '#F9FBFF';   // putih kebiruan
const BORDER_COLOR = '#D6E4F0';   // abu kebiruan
const TEXT_MAIN    = '#2D3748';   // abu gelap
const TEXT_SUB     = '#718096';   // abu sedang

const LoginScreen = () => {

  // ==================== STATE INPUT ====================
  const [email, setEmail] = useState('');           // Menyimpan nilai email
  const [password, setPassword] = useState('');     // Menyimpan nilai password
  const [showPassword, setShowPassword] = useState(false);  // Toggle visibility password

  const [loading, setLoading] = useState(false);            // Loading saat proses login
  const [resendLoading, setResendLoading] = useState(false); // Loading saat kirim ulang verifikasi

  // ==================== STATE MODAL ====================
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // State khusus untuk menangani kasus email belum diverifikasi
  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  // Animasi fade untuk modal
  const fadeAnim = useState(new Animated.Value(0))[0];

  const navigation = useNavigation<any>();   // Hook navigasi React Navigation

  // ==================== USE EFFECT ====================

  // Cek apakah user sudah login saat halaman dibuka
  // Jika sudah ada token & user → langsung redirect ke MainApp
  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');

      if (token && user) {
        navigation.replace('MainApp');   // Ganti screen tanpa bisa kembali ke login
      }
    };
    checkLogin();
  }, [navigation]);

  // ==================== FUNGSI MODAL ====================

  // Menampilkan modal dengan animasi
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

  // Menyembunyikan modal + reset state verifikasi email
  const hideModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      // Reset state khusus email belum diverifikasi
      if (isEmailNotVerified) {
        setIsEmailNotVerified(false);
        setUnverifiedEmail('');
      }
    });
  };

  // ==================== PROSES LOGIN ====================

  // Fungsi utama untuk login
  const handleLogin = async () => {
    // Validasi sederhana
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

      // Simpan token dan data user ke AsyncStorage
      await AsyncStorage.setItem('token', response.token || response.access_token || '');
      await AsyncStorage.setItem('user', JSON.stringify(response.user || {}));

      showModal('success', 'Login Berhasil ✨', 'Selamat datang kembali!');

      // Tunggu sebentar lalu redirect ke halaman utama
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

        // === PENANGANAN KHUSUS: EMAIL BELUM DIVERIFIKASI ===
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
      } 
      else if (error.request) {
        message = 'Tidak bisa terhubung ke server';
      } 
      else {
        message = error.message;
      }

      showModal('error', 'Login Gagal 🚫', message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== KIRIM ULANG VERIFIKASI ====================

  // Fungsi untuk mengirim ulang email verifikasi
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

        {/* Logo Aplikasi */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logonw.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Login Vespa Expert</Text>
        <Text style={styles.subtitle}>Sistem Diagnosa Vespa Matic</Text>

        {/* Input Email */}
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

        {/* Input Password */}
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

        {/* Link Lupa Password */}
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPassword}>Lupa Password?</Text>
        </TouchableOpacity>

        {/* Tombol Login */}
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

        {/* Link ke Halaman Register */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>
            Belum punya akun? <Text style={{ color: ACCENT, fontWeight: 'bold' }}>Daftar di sini</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ==================== MODAL CUSTOM ==================== */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>

            {/* Icon Modal */}
            <MaterialCommunityIcons
              name={modalType === 'success' ? 'check-circle' : 'alert-circle'}
              size={60}
              color={modalType === 'success' ? ACCENT : '#EF4444'}
              style={{ marginBottom: 16 }}
            />

            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>

            {/* Tombol Utama Modal */}
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

            {/* Tombol Tutup Tambahan (khusus email belum diverifikasi) */}
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
    backgroundColor: BG,
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
    color: TEXT_MAIN,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: 'TEXT_SUB',
    marginBottom: 36,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_MAIN,
    marginBottom: 8,
  },
  required: {
    color: ACCENT,
  },
  input: {
    borderWidth: 1,
    borderColor: 'BORDER_COLOR',
    backgroundColor: 'INPUT_BG',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 18,
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
    color: TEXT_MAIN,
  },
  eyeButton: {
    paddingHorizontal: 18,
  },
  forgotPassword: {
    color: ACCENT,
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
    backgroundColor: ACCENT,
  },
  buttonLoading: {
    backgroundColor: '#357ABD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  registerText: {
    textAlign: 'center',
    color: 'TEXT_SUB',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '82%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: TEXT_MAIN,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: TEXT_MAIN,
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
    backgroundColor: ACCENT,
  },
  errorButton: {
    backgroundColor: '#EF4444',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  card: {
  backgroundColor: CARD_BG,
  borderRadius: 24,
  padding: 20,
},

});

export default LoginScreen;