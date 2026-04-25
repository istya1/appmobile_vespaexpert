import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import API from '../services/api';

const PRIMARY = '#4A90E2';   // biru utama
const BG = '#FFFFFF';        // background putih
const CARD = '#F9FAFB';      // card soft
const TEXT_MAIN = '#111827';
const TEXT_SUB = '#6B7280';
const BORDER = '#E5E7EB';
const GOLD = '#D4AF37';      // aksen kecil aja
const BORDER_COLOR = '#D6E4F0';

export default function ResetPasswordScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState(route.params?.email || '');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'confirm'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  type ModalType = 'success' | 'error' | 'confirm';

const showModal = (
  type: ModalType,
  title: string,
  message: string
) => {
  setModalType(type);
  setModalTitle(title);
  setModalMessage(message);
  setModalVisible(true);

  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 250,
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

  const handleReset = () => {
    if (!email || !token || !password || !confirm) {
      showModal('error', 'Data Belum Lengkap', 'Semua field wajib diisi.');
      return;
    }

    if (password !== confirm) {
      showModal('error', 'Tidak Cocok', 'Konfirmasi password tidak sama.');
      return;
    }

    // 🔥 confirm dulu
    showModal(
      'confirm',
      'Konfirmasi Reset',
      'Apakah Anda yakin ingin mengganti password?'
    );
  };

  const confirmReset = async () => {
    hideModal();
    setLoading(true);

    try {
      const res = await API.post('/reset-password', {
        email,
        token,
        password,
        password_confirmation: confirm,
      });

      showModal('success', 'Berhasil', res.data.message);

    } catch (err: any) {
      showModal(
        'error',
        'Gagal',
        err?.response?.data?.message || 'Reset gagal'
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY} />
        </TouchableOpacity>

        <View style={{ marginLeft: 12 }}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Masukkan data reset</Text>
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
          autoCapitalize="none"
        />

        <Text style={styles.label}>Token</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan token dari email"
          placeholderTextColor="#777"
          value={token}
          onChangeText={setToken}
        />

        <Text style={styles.label}>Password Baru</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan password baru"
          placeholderTextColor="#777"
          secureTextEntry
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Konfirmasi Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Ulangi password"
          placeholderTextColor="#777"
          secureTextEntry
          onChangeText={setConfirm}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Reset Password</Text>
          )}
        </TouchableOpacity>

      </View>


      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>

            <Ionicons
              name={
                modalType === 'success'
                  ? 'checkmark-circle'
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
                    : '#9CA3AF'
              }
            />

            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>

            {modalType === 'confirm' ? (
              <View style={{ flexDirection: 'row', width: '100%' }}>

                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#F3F4F6', marginRight: 8 }]}
                  onPress={hideModal}
                >
                  <Text style={{ color: '#374151' }}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    {
                      backgroundColor: '#FFFFFF',
                      borderWidth: 1,
                      borderColor: '#4A90E2',
                      marginLeft: 8,
                    },
                  ]}
                  onPress={confirmReset}
                >
                  <Text style={{ color: '#4A90E2', fontWeight: 'bold' }}>
                    Ya, Reset
                  </Text>
                </TouchableOpacity>

              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  modalType === 'success'
                    ? { backgroundColor: '#4A90E2' }
                    : { backgroundColor: '#EF4444' },
                ]}
                onPress={() => {
                  hideModal();
                  if (modalType === 'success') {
                    navigation.navigate('Login');
                  }
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                  {modalType === 'success' ? 'Ke Login' : 'Coba Lagi'}
                </Text>
              </TouchableOpacity>
            )}

          </Animated.View>
        </View>
      </Modal>
    </View>
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
      paddingTop: 50,
      paddingHorizontal: 10,
      paddingBottom: 20,
      borderColor: BORDER_COLOR,
      borderWidth: 1,
  },

      title: {
      fontSize: 24,
      color: TEXT_MAIN,
      fontWeight: 'bold',
  },

      subtitle: {
        color: TEXT_SUB,
      fontSize: 13,
  },

      card: {
      backgroundColor: CARD,
      margin: 20,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: BORDER,
  },

      label: {
      color: TEXT_SUB,
      marginBottom: 6,
      marginTop: 10,
      fontSize: 13,
  },

      input: {
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      padding: 12,
      color: TEXT_MAIN,
      marginBottom: 10,
      borderColor: BORDER,
      borderWidth: 1,
  },

      button: {
        backgroundColor: PRIMARY,
      padding: 14,
      borderRadius: 12,
      marginTop: 15,
      alignItems: 'center',
  },

      buttonText: {
        color: '#FFFFFF',
      fontWeight: 'bold',
  },

      modalOverlay: {
        flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
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
        fontSize: 20,
      fontWeight: 'bold',
      color: '#111827',
      marginTop: 12,
},
      modalMessage: {
        color: '#6B7280',
      textAlign: 'center',
      marginVertical: 12,
},
      modalButton: {
        flex: 1,
      padding: 14,
      borderRadius: 12,
      alignItems: 'center',
},
});