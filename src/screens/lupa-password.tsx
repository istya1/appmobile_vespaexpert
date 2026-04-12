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

const GOLD = '#D4AF37';
const DARK = '#111111';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal States (sama seperti LoginScreen)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
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
        '✅ Email Terkirim',
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
          <Ionicons name="arrow-back" size={24} color={GOLD} />
        </TouchableOpacity>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.title}>Lupa Password</Text>
          <Text style={styles.subtitle}>Masukkan email akun kamu</Text>
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
            <Text style={styles.buttonText}>Kirim Instruksi Reset</Text>
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
              onPress={() => {
                hideModal();
                // Jika sukses, langsung pindah ke ResetPassword
                if (modalType === 'success') {
                  navigation.navigate('ResetPassword', { email });
                }
              }}
            >
              <Text style={styles.modalButtonText}>
                {modalType === 'success' ? 'Lanjut Reset Password' : 'Coba Lagi'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1A1A1A',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  label: {
    color: '#AAA',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: GOLD,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
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
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 32,
    width: '85%',
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