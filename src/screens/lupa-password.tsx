import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import API from '../services/api';

const ACCENT = '#4A90E2';
const BG = '#FFFFFF';
const CARD_BG = '#EAF4FF';
const INPUT_BG = '#F9FBFF';
const BORDER_COLOR = '#D6E4F0';
const TEXT_MAIN = '#2D3748';
const TEXT_SUB = '#718096';
const GOLD = '#E6B85C';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal States (sama seperti LoginScreen)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'confirm'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const fadeAnim = useState(new Animated.Value(0))[0];

  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

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
    });
  };

  const confirmSendEmail = async () => {
    setModalVisible(false);
    setLoading(true);

    try {
      await API.post('/forgot-password', { email });

      showModal(
        'success',
        'Email Terkirim',
        `Instruksi reset password sudah dikirim ke:\n\n${email}`
      );

    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Gagal mengirim email.';
      showModal('error', 'Gagal', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email.trim()) {
      showModal('error', 'Email Wajib Diisi', 'Silakan masukkan alamat email Anda.');
      return;
    }

    if (!isValidEmail(email)) {
      showModal('error', 'Format Email Tidak Valid', 'Contoh: nama@email.com');
      return;
    }

    setLoading(true);

    try {
      await API.post('/forgot-password', { email });

      // Modal Sukses yang lebih bagus
      showModal(
        'success',
        'Email Terkirim',
        `Kami telah mengirimkan instruksi reset password ke:\n\n${email}\n\n` +
        'Silakan cek inbox atau folder Spam/Junk Anda.\n\n' +
        'Setelah menerima token, Anda bisa melanjutkan ke halaman reset password.'
      );

    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Gagal mengirim email reset password. Silakan coba lagi.';
      showModal('error', 'Gagal Mengirim Email', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={ACCENT} />
        </TouchableOpacity>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.title}>Lupa Password</Text>
          <Text style={styles.subtitle}>Masukkan Email Akun Anda</Text>
        </View>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan email"
          placeholderTextColor="#777"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleForgot}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}> Reset</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ==================== MODAL CUSTOM ==================== */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>

            {/* ICON */}
            <MaterialCommunityIcons
              name={
                modalType === 'success'
                  ? 'check-circle'
                  : modalType === 'error'
                    ? 'alert-circle'
                    : 'help-circle'
              }
              size={60}
              color={
                modalType === 'success'
                  ? GOLD
                  : modalType === 'error'
                    ? '#EF4444'
                    : '#9CA3AF' // abu untuk confirm
              }
              style={{ marginBottom: 16 }}
            />

            {/* TITLE */}
            <Text style={styles.modalTitle}>{modalTitle}</Text>

            {/* MESSAGE */}
            <Text style={styles.modalMessage}>{modalMessage}</Text>

            {/* ================= BUTTON AREA ================= */}
            {modalType === 'confirm' ? (
              <View style={{ flexDirection: 'row', width: '100%' }}>

                {/* BATAL */}
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    {
                      backgroundColor: '#F3F4F6',
                      marginRight: 8,
                    },
                  ]}
                  onPress={hideModal}
                >
                  <Text style={{ color: '#374151', fontWeight: '600' }}>
                    Batal
                  </Text>
                </TouchableOpacity>

                {/* KIRIM */}
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    {
                      backgroundColor: '#FFFFFF',
                      borderWidth: 1,
                      borderColor: ACCENT,
                      marginLeft: 8,
                    },
                  ]}
                  onPress={confirmSendEmail}
                >
                  <Text style={{ color: ACCENT, fontWeight: '700' }}>
                    Ya, Kirim
                  </Text>
                </TouchableOpacity>

              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  modalType === 'success'
                    ? styles.successButton
                    : styles.errorButton,
                ]}
                onPress={() => {
                  hideModal();

                  if (modalType === 'success') {
                    navigation.navigate('ResetPassword', { email });
                  }
                }}
              >
                <Text style={styles.modalButtonText}>
                  {modalType === 'success'
                    ? 'Lanjut Reset Password'
                    : 'Coba Lagi'}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  title: {
    fontSize: 24,
    color: TEXT_MAIN,
    fontWeight: 'bold',
  },
  subtitle: {
    color: TEXT_SUB,
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  label: {
    color: '#AAA',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: INPUT_BG,
    borderRadius: 16,
    padding: 16,
    color: TEXT_MAIN,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  button: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Modal Styles (sama dengan LoginScreen)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    width: '85%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#6B7280',
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
});