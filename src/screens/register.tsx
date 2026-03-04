import React, { useState } from 'react';
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
  FlatList,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';

const GOLD = '#D4AF37';
const DARK_BG = '#111111';
const CARD_BG = '#1A1A1A';
const INPUT_BG = '#2A2A2A';
const BORDER_COLOR = '#3A3A3A';

const MOTOR_OPTIONS = [
  { label: 'Primavera 150', value: 'Primavera 150' },
  { label: 'Primavera S 150', value: 'Primavera S 150' },
  { label: 'LX 125', value: 'LX 125' },
  { label: 'Sprint 150', value: 'Sprint 150' },
  { label: 'Sprint S 150', value: 'Sprint S 150' },
];

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    noHp: '',
    password: '',
    confirmPassword: '',
    jenisMontor: '',  // nama field disesuaikan dengan backend
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [motorModalVisible, setMotorModalVisible] = useState(false);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'confirm'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  const navigation = useNavigation<any>();

  const showModal = (type: 'success' | 'error' | 'confirm', title: string, message: string) => {
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

  const handleRegister = () => {
    // Validasi
    if (!formData.nama.trim()) {
      showModal('error', 'Nama Wajib Diisi', 'Silakan masukkan nama lengkap Anda.');
      return;
    }
    if (!formData.email.trim()) {
      showModal('error', 'Email Wajib Diisi', 'Silakan masukkan alamat email.');
      return;
    }
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      showModal('error', 'Format Email Tidak Valid', 'Contoh: nama@email.com');
      return;
    }
    if (!formData.noHp.trim()) {
      showModal('error', 'No HP Wajib Diisi', 'Silakan masukkan nomor HP.');
      return;
    }
    if (!formData.jenisMontor) {
      showModal('error', 'Jenis Motor Wajib Dipilih', 'Pilih salah satu jenis Vespa.');
      return;
    }
    if (!formData.password) {
      showModal('error', 'Password Wajib Diisi', 'Silakan masukkan kata sandi.');
      return;
    }
    if (formData.password.length < 6) {
      showModal('error', 'Password Terlalu Pendek', 'Minimal 6 karakter.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showModal('error', 'Konfirmasi Tidak Cocok', 'Password dan konfirmasi tidak sama.');
      return;
    }

    showModal('confirm', 'Konfirmasi Pendaftaran', 'Apakah data sudah benar? Setelah daftar, Anda bisa langsung login.');
  };

  const confirmRegister = async () => {
    setModalVisible(false);
    setLoading(true);

    try {
      await api.post('/register', {
        nama: formData.nama,
        email: formData.email,
        no_hp: formData.noHp,
        password: formData.password,
        jenis_montor: formData.jenisMontor,  // ← sesuai backend
      });

      showModal('success', 'Registrasi Berhasil!', 'Akun Anda telah dibuat. Silakan login sekarang.');
      setTimeout(() => {
        navigation.replace('Login');
      }, 2000);
    } catch (error: any) {
      let message = 'Registrasi gagal.';
      if (error.response) {
        message += error.response.data?.message || 'Email mungkin sudah terdaftar.';
      } else if (error.request) {
        message += 'Tidak bisa terhubung ke server.';
      } else {
        message += error.message;
      }
      showModal('error', 'Registrasi Gagal', message);
    } finally {
      setLoading(false);
    }
  };

  const selectMotor = (value: string) => {
    setFormData({ ...formData, jenisMontor: value });
    setMotorModalVisible(false);
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

        <Text style={styles.title}>Daftar Akun Baru</Text>
        <Text style={styles.subtitle}>Sistem Diagnosa Vespa Matic</Text>

        {/* Nama */}
        <Text style={styles.label}>
          Nama Lengkap <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Isi Dengan Nama Lengkap"
          value={formData.nama}
          onChangeText={(text) => setFormData({ ...formData, nama: text })}
          autoCapitalize="words"
          placeholderTextColor="#777"
        />

        {/* Email */}
        <Text style={styles.label}>
          Email <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: nama@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          placeholderTextColor="#777"
        />

        {/* No HP */}
        <Text style={styles.label}>
          No HP <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: 081234567890"
          keyboardType="phone-pad"
          value={formData.noHp}
          onChangeText={(text) => setFormData({ ...formData, noHp: text })}
          placeholderTextColor="#777"
        />

        {/* Jenis Motor */}
        <Text style={styles.label}>
          Jenis Motor <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.customPicker}
          onPress={() => setMotorModalVisible(true)}
        >
          <Text style={styles.pickerText}>
            {formData.jenisMontor || 'Pilih Jenis Motor'}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={24} color={GOLD} />
        </TouchableOpacity>

        {/* Modal Pilih Motor */}
        <Modal
          visible={motorModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setMotorModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Pilih Jenis Motor</Text>
              <FlatList
                data={MOTOR_OPTIONS}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      formData.jenisMontor === item.value && { backgroundColor: '#333' },
                    ]}
                    onPress={() => selectMotor(item.value)}
                  >
                    <MaterialCommunityIcons name="scooter" size={24} color={GOLD} style={{ marginRight: 12 }} />
                    <Text style={styles.modalItemText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setMotorModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>Batal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Password */}
        <Text style={styles.label}>
          Password <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Minimal 6 karakter"
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
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

        {/* Konfirmasi Password */}
        <Text style={styles.label}>
          Konfirmasi Password <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Ulangi password"
            secureTextEntry={!showConfirmPassword}
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            placeholderTextColor="#777"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <MaterialCommunityIcons
              name={showConfirmPassword ? 'eye' : 'eye-off'}
              size={24}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        {/* Button Daftar */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={[
            styles.button,
            loading ? styles.buttonLoading : styles.buttonNormal,
          ]}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#000" />
              <Text style={styles.loadingText}>Mendaftar...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Daftar</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>
            Sudah punya akun? <Text style={{ color: GOLD, fontWeight: 'bold' }}>Masuk di sini</Text>
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
        <View style={styles.customModalOverlay}>
          <Animated.View style={[styles.customModalContent, { opacity: fadeAnim }]}>
            <MaterialCommunityIcons
              name={
                modalType === 'success'
                  ? 'check-circle'
                  : modalType === 'error'
                  ? 'alert-circle'
                  : 'help-circle'
              }
              size={64}
              color={
                modalType === 'success'
                  ? GOLD
                  : modalType === 'error'
                  ? '#EF4444'
                  : GOLD
              }
              style={{ marginBottom: 20 }}
            />
            <Text style={styles.customModalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>

            <View style={styles.modalButtons}>
              {modalType === 'confirm' ? (
                <>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={hideModal}
                  >
                    <Text style={styles.modalButtonText}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={confirmRegister}
                  >
                    <Text style={styles.modalButtonTextConfirm}>Ya, Daftar</Text>
                  </TouchableOpacity>
                </>
              ) : (
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
              )}
            </View>
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
    width: 180,
    height: 180,
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
    marginBottom: 18,
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
  customPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 18,
  },
  pickerText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  button: {
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
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
  loginText: {
    textAlign: 'center',
    color: '#AAAAAA',
    fontSize: 15,
    marginTop: 20,
  },

  // Modal Custom
  customModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customModalContent: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 32,
    width: '82%',
    alignItems: 'center',
  },
  customModalTitle: {
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
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  confirmButton: {
    backgroundColor: GOLD,
  },
  successButton: {
    backgroundColor: GOLD,
  },
  errorButton: {
    backgroundColor: '#EF4444',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  modalButtonTextConfirm: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '700',
  },

  // Modal Pilih Motor
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: GOLD,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalItemText: {
    color: '#fff',
    fontSize: 16,
  },
  modalClose: {
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: '#333',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen;