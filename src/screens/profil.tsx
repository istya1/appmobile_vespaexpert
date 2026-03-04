import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
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
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import AuthService from '../services/auth-mobile';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

const GOLD = '#D4AF37';
const BASE_URL = 'http://192.168.1.12:8000'; // GANTI DENGAN IP LAPTOP KAMU

const MOTOR_OPTIONS: Array<{ label: string; value: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = [
  { label: 'Primavera 150', value: 'Primavera 150', icon: 'scooter' },
  { label: 'Primavera S 150', value: 'Primavera S 150', icon: 'scooter' },
  { label: 'LX 125', value: 'LX 125', icon: 'scooter' },
  { label: 'Sprint 150', value: 'Sprint 150', icon: 'scooter' },
  { label: 'Sprint S 150', value: 'Sprint S 150', icon: 'scooter' },
];

const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nama: '',
    no_hp: '',
    alamat: '',
    jenis_motor: '',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [motorModalVisible, setMotorModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigation = useNavigation<any>();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'confirm' | 'success' | 'error'>('confirm');
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Fungsi showModal (untuk semua modal konfirmasi, sukses, error)
  const showModal = (type: 'confirm' | 'success' | 'error', title: string, message: string) => {
    setModalType(type);
    setModalMessage(message);
    if (type === 'confirm') {
      setConfirmModalVisible(true);
    } else if (type === 'success') {
      setSuccessModalVisible(true);
    } else {
      Alert.alert(title, message);
      return;
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    loadUser();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setForm({
          nama: parsed.nama || '',
          no_hp: parsed.no_hp || '',
          alamat: parsed.alamat || '',
          jenis_motor: parsed.jenis_motor || '',
          oldPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      }
    } catch (error) {
      console.error('Gagal load user:', error);
    }
  };

 const pickImage = async () => {
  try {
    // Minta izin akses galeri
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Ditolak', 'Izinkan akses galeri untuk mengunggah foto.');
      return;
    }

    // Buka galeri untuk pilih foto
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // kotak untuk avatar
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      const uri = selectedImage.uri;

      // Tampilkan loading
      setLoading(true);

      // Buat FormData untuk upload
      const formData = new FormData();
      formData.append('foto', {
        uri,
        name: `profile_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);

      // Panggil endpoint upload di backend (sesuaikan dengan route kamu)
      const uploadResponse = await api.post(`/users/${user.id_user}/upload-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update foto di state & AsyncStorage
      const newFoto = uploadResponse.data.foto; // backend return full URL foto
      const updatedUser = { ...user, foto: newFoto };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      showModal('success', 'Berhasil!', 'Foto profil berhasil diunggah.');
    }
  } catch (error: any) {
    console.error('Upload foto error:', error);
    showModal('error', 'Gagal', error.response?.data?.message || 'Gagal mengunggah foto. Coba lagi.');
  } finally {
    setLoading(false);
  }
};

  const handleSave = async () => {
    if (form.newPassword && form.newPassword.length < 6) {
      return showModal('error', 'Kesalahan', 'Password baru minimal 6 karakter');
    }
    if (form.newPassword && form.newPassword !== form.confirmNewPassword) {
      return showModal('error', 'Kesalahan', 'Konfirmasi password tidak cocok');
    }
    showModal('confirm', 'Konfirmasi', 'Apakah Anda yakin ingin menyimpan perubahan profil?');
  };

  const confirmSave = async () => {
    setConfirmModalVisible(false);
    setSaving(true);
    try {
      const response = await api.put(`/users/${user.id_user}`, {
        nama: form.nama,
        no_hp: form.no_hp,
        alamat: form.alamat,
        jenis_motor: form.jenis_motor,
      });
      if (form.newPassword && form.oldPassword) {
        await api.put(`/users/${user.id_user}/change-password`, {
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
        });
      }
      const updatedUser = {
        ...user,
        ...response.data.data,
        foto: user.foto,
      };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      showModal('success', 'Berhasil!', 'Profil berhasil diperbarui!');
      setEditMode(false);
      setForm({
        ...form,
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (error: any) {
      console.error('Update error:', error.response?.data);
      showModal('error', 'Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    try {
      // Coba panggil logout backend (jika ada endpoint)
      await AuthService.logout().catch(() => console.log('Logout backend gagal, lanjut clear local'));

      // Clear local storage
      await AsyncStorage.multiRemove(['token', 'user']);
      delete api.defaults.headers.common['Authorization'];

      showModal('success', 'Logout Berhasil', 'Anda telah keluar dari akun.');

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }], // Reset ke root level (AppNavigator akan ke AuthStack)
        });
      }, 1500);
    } catch (error) {
      showModal('error', 'Gagal Logout', 'Terjadi kesalahan. Coba lagi.');
    }
  };

  const selectMotor = (value: string) => {
    setForm({ ...form, jenis_motor: value });
    setMotorModalVisible(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={
              user?.foto
                ? { uri: user.foto.startsWith('http') ? user.foto : `${BASE_URL}/storage/${user.foto}` }
                : require('../../assets/ava.png')
            }
            style={styles.avatarImage}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}>
            <MaterialCommunityIcons name="camera" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profil Pengguna</Text>
          <TouchableOpacity onPress={() => setEditMode(!editMode)}>
            <MaterialCommunityIcons name={editMode ? 'check' : 'pencil'} size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Data Pribadi */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Data Pribadi</Text>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || '-'}</Text>
          <Text style={styles.label}>Nama</Text>
          {editMode ? (
            <TextInput
              style={styles.input}
              value={form.nama}
              onChangeText={(text) => setForm({ ...form, nama: text })}
              placeholder="Masukkan nama"
              placeholderTextColor="#777"
            />
          ) : (
            <Text style={styles.value}>{user?.nama || '-'}</Text>
          )}
          <Text style={styles.label}>No HP</Text>
          {editMode ? (
            <TextInput
              style={styles.input}
              value={form.no_hp}
              onChangeText={(text) => setForm({ ...form, no_hp: text })}
              keyboardType="phone-pad"
              placeholder="Masukkan nomor HP"
              placeholderTextColor="#777"
            />
          ) : (
            <Text style={styles.value}>{user?.no_hp || '-'}</Text>
          )}
          <Text style={styles.label}>Alamat</Text>
          {editMode ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.alamat}
              onChangeText={(text) => setForm({ ...form, alamat: text })}
              multiline
              numberOfLines={3}
              placeholder="Masukkan alamat"
              placeholderTextColor="#777"
            />
          ) : (
            <Text style={styles.value}>{user?.alamat || '-'}</Text>
          )}
        </View>

        {/* Jenis Motor */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Jenis Motor</Text>
          {editMode ? (
            <TouchableOpacity
              style={styles.customPicker}
              onPress={() => setMotorModalVisible(true)}
            >
              <Text style={styles.pickerText}>
                {form.jenis_motor || 'Pilih Jenis Motor'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={24} color={GOLD} />
            </TouchableOpacity>
          ) : (
            <Text style={styles.value}>
              {user?.jenis_motor
                ? MOTOR_OPTIONS.find(opt => opt.value === user.jenis_motor)?.label || user.jenis_motor
                : 'Belum dipilih'}
            </Text>
          )}
        </View>

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
                      form.jenis_motor === item.value && { backgroundColor: '#333' },
                    ]}
                    onPress={() => selectMotor(item.value)}
                  >
                    <MaterialCommunityIcons name={item.icon} size={24} color={GOLD} style={{ marginRight: 12 }} />
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

        {/* Ganti Password */}
        {editMode && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Ganti Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password Lama"
                placeholderTextColor="#777"
                secureTextEntry={!showOldPassword}
                value={form.oldPassword}
                onChangeText={(text) => setForm({ ...form, oldPassword: text })}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowOldPassword(!showOldPassword)}
              >
                <MaterialCommunityIcons
                  name={showOldPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#777"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password Baru"
                placeholderTextColor="#777"
                secureTextEntry={!showNewPassword}
                value={form.newPassword}
                onChangeText={(text) => setForm({ ...form, newPassword: text })}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <MaterialCommunityIcons
                  name={showNewPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#777"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Konfirmasi Password Baru"
                placeholderTextColor="#777"
                secureTextEntry={!showConfirmPassword}
                value={form.confirmNewPassword}
                onChangeText={(text) => setForm({ ...form, confirmNewPassword: text })}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <MaterialCommunityIcons
                  name={showConfirmPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#777"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tombol Simpan */}
        {editMode && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving || loading}>
            {saving ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.saveText}>Simpan Perubahan</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#fff" />
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Konfirmasi Simpan */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <Animated.View style={[styles.confirmModalContent, { opacity: fadeAnim }]}>
            <MaterialCommunityIcons name="content-save-check" size={48} color={GOLD} style={{ marginBottom: 16 }} />
            <Text style={styles.confirmModalTitle}>Simpan Perubahan?</Text>
            <Text style={styles.confirmModalText}>
              Pastikan semua data sudah benar sebelum menyimpan.
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmSave}
              >
                <Text style={styles.modalButtonTextConfirm}>Ya, Simpan</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal Sukses Update */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <Animated.View style={[styles.confirmModalContent, { opacity: fadeAnim }]}>
            <MaterialCommunityIcons name="check-circle" size={64} color={GOLD} style={{ marginBottom: 16 }} />
            <Text style={styles.confirmModalTitle}>Berhasil!</Text>
            <Text style={styles.confirmModalText}>
              Profil Anda sudah berhasil diperbarui.
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.modalButtonTextConfirm}>OK</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal Konfirmasi Logout */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.logoutModalOverlay}>
          <View style={styles.logoutModalContent}>
            <MaterialCommunityIcons name="logout" size={48} color={GOLD} style={{ marginBottom: 16 }} />
            <Text style={styles.logoutModalTitle}>Keluar dari Akun?</Text>
            <Text style={styles.logoutModalText}>
              Anda akan keluar dan harus login kembali untuk menggunakan aplikasi.
            </Text>
            <View style={styles.logoutModalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmLogout}
              >
                <Text style={styles.modalButtonTextConfirm}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0E0E0E',
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  avatarImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: GOLD,
    backgroundColor: '#1F1F1F',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 80,
    backgroundColor: GOLD,
    padding: 8,
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  sectionCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: GOLD,
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#fff',
  },
  input: {
    backgroundColor: '#252525',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    marginBottom: 10,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: GOLD,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveText: {
    fontWeight: '700',
    color: '#000',
    fontSize: 16,
  },
  logoutButton: {
    borderWidth: 1.5,
    borderColor: GOLD,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutText: {
    color: GOLD,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 25,
  },
  customPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  pickerText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
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
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutModalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  logoutModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  logoutModalText: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 24,
  },
  logoutModalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  confirmButton: {
    backgroundColor: GOLD,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  // Modal Konfirmasi Simpan
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 32,
    width: '80%',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  confirmModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  confirmModalText: {
    fontSize: 15,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 28,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
});

export default ProfileScreen;