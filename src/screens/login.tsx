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
import { login } from '../services/auth';
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

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  const navigation = useNavigation<any>();

  // Proteksi: Kalau sudah login → langsung ke root level (MainApp)
  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      console.log('LOGIN SCREEN CHECK - TOKEN:', token);
      console.log('LOGIN SCREEN CHECK - USER:', user);
      if (token && user) {
        console.log('SUDAH LOGIN → REDIRECT KE MAINAPP (ROOT)');
        navigation.replace('MainApp'); // ← PASTIKAN 'MainApp'
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
    }).start(() => setModalVisible(false));
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
    try {
      const response = await login(email, password);
      console.log('LOGIN RESPONSE FULL:', response);

      if (response.user.role !== 'pengguna') {
        showModal('error', 'Akses Ditolak', 'Hanya untuk pengguna biasa.');
        return;
      }

      // Simpan token & user
      await AsyncStorage.setItem('token', response.token || response.access_token || '');
      await AsyncStorage.setItem('user', JSON.stringify(response.user || {}));

      console.log('TOKEN DISIMPAN:', response.token);

      showModal('success', 'Login Berhasil ✨', 'Selamat datang kembali!');

      setTimeout(() => {
        hideModal();
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }], // ← PASTIKAN 'MainApp' sesuai root
        });
      }, 1200);
    } catch (error: any) {
      let message = 'Terjadi kesalahan';
      if (error.response) {
        message = error.response.data?.message || 'Email atau password salah';
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

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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

        {/* Button */}
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
              onPress={hideModal}
            >
              <Text style={styles.modalButtonText}>
                {modalType === 'success' ? 'OK, Lanjut' : 'Coba Lagi'}
              </Text>
            </TouchableOpacity>
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
    borderColor: '#3A3A3A',
    backgroundColor: '#2A2A2A',
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
    borderColor: '#3A3A3A',
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    marginBottom: 30,
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

  // Modal Custom
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
  },
  modalMessage: {
    fontSize: 15,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 28,
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