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

// ── Design tokens (sama dengan DashboardScreen) ──────────────────────────────
const PRIMARY   = '#4A90E2';
const BG        = '#FFFFFF';
const CARD      = '#F9FAFB';
const TEXT_MAIN = '#111827';
const TEXT_SUB  = '#6B7280';
const BORDER    = '#E5E7EB';
const DANGER    = '#EF4444';

const BASE_URL = 'https://appraiser-pasty-helpline.ngrok-free.dev';

const MOTOR_OPTIONS: Array<{
  label: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}> = [
  { label: 'Primavera 150',   value: 'Primavera 150',   icon: 'scooter' },
  { label: 'Primavera S 150', value: 'Primavera S 150', icon: 'scooter' },
  { label: 'LX 125',          value: 'LX 125',          icon: 'scooter' },
  { label: 'Sprint 150',      value: 'Sprint 150',      icon: 'scooter' },
  { label: 'Sprint S 150',    value: 'Sprint S 150',    icon: 'scooter' },
];

const ProfileScreen = () => {
  const [user, setUser]                   = useState<any>(null);
  const [editMode, setEditMode]           = useState(false);
  const [form, setForm] = useState({
    nama: '', no_hp: '', alamat: '', jenis_motor: '',
    oldPassword: '', newPassword: '', confirmNewPassword: '',
  });
  const [motorModalVisible,   setMotorModalVisible]   = useState(false);
  const [logoutModalVisible,  setLogoutModalVisible]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const navigation = useNavigation<any>();
  const [showOldPassword,     setShowOldPassword]     = useState(false);
  const [showNewPassword,     setShowNewPassword]     = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'confirm' | 'success' | 'error'>('confirm');
  const fadeAnim = useState(new Animated.Value(0))[0];

  const showModal = (
    type: 'confirm' | 'success' | 'error',
    title: string,
    message: string,
  ) => {
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
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  };

  useEffect(() => { loadUser(); }, []);

  useFocusEffect(React.useCallback(() => { loadUser(); }, []));

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setForm({
          nama:             parsed.nama       || '',
          no_hp:            parsed.no_hp      || '',
          alamat:           parsed.alamat     || '',
          jenis_motor:      parsed.jenis_motor || '',
          oldPassword: '', newPassword: '', confirmNewPassword: '',
        });
      }
    } catch (e) { console.error('Gagal load user:', e); }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Ditolak', 'Izinkan akses galeri untuk mengunggah foto.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        setLoading(true);
        const formData = new FormData();
        formData.append('foto', { uri, name: `profile_${Date.now()}.jpg`, type: 'image/jpeg' } as any);
        const res = await api.post(`/users/${user.id_user}/upload-photo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const updatedUser = { ...user, foto: res.data.foto };
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        showModal('success', 'Berhasil!', 'Foto profil berhasil diunggah.');
      }
    } catch (e: any) {
      showModal('error', 'Gagal', e.response?.data?.message || 'Gagal mengunggah foto. Coba lagi.');
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (form.newPassword && form.newPassword.length < 6)
      return showModal('error', 'Kesalahan', 'Password baru minimal 6 karakter');
    if (form.newPassword && form.newPassword !== form.confirmNewPassword)
      return showModal('error', 'Kesalahan', 'Konfirmasi password tidak cocok');
    showModal('confirm', 'Konfirmasi', 'Apakah Anda yakin ingin menyimpan perubahan profil?');
  };

  const confirmSave = async () => {
    setConfirmModalVisible(false);
    setSaving(true);
    try {
      const res = await api.put(`/users/${user.id_user}`, {
        nama: form.nama, no_hp: form.no_hp, alamat: form.alamat, jenis_motor: form.jenis_motor,
      });
      if (form.newPassword && form.oldPassword) {
        await api.put(`/users/${user.id_user}/change-password`, {
          oldPassword: form.oldPassword, newPassword: form.newPassword,
        });
      }
      const updatedUser = { ...user, ...res.data.data, foto: user.foto };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      showModal('success', 'Berhasil!', 'Profil berhasil diperbarui!');
      setEditMode(false);
      setForm({ ...form, oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (e: any) {
      showModal('error', 'Gagal', e.response?.data?.message || 'Terjadi kesalahan saat menyimpan profil');
    } finally { setSaving(false); }
  };

  const handleLogout  = () => setLogoutModalVisible(true);

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    try {
      await AuthService.logout().catch(() => {});
      await AsyncStorage.multiRemove(['token', 'user']);
      delete api.defaults.headers.common['Authorization'];
      showModal('success', 'Logout Berhasil', 'Anda telah keluar dari akun.');
      setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });
      }, 1500);
    } catch { showModal('error', 'Gagal Logout', 'Terjadi kesalahan. Coba lagi.'); }
  };

  const selectMotor = (value: string) => {
    setForm({ ...form, jenis_motor: value });
    setMotorModalVisible(false);
  };

  // ── Inisial avatar ──────────────────────────────────────────────────────────
  const initials = user?.nama
    ? user.nama.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── HEADER (sama pola DashboardScreen) ─────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>VESPA EXPERT</Text>
            <Text style={styles.subtitle}>Profil Pengguna</Text>
          </View>
          <TouchableOpacity onPress={() => setEditMode(!editMode)}>
            <MaterialCommunityIcons
              name={editMode ? 'check' : 'pencil'}
              size={24}
              color={PRIMARY}
            />
          </TouchableOpacity>
        </View>

        {/* ── PROFILE CARD (sama pola profileCard Dashboard) ─────────────── */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrap}>
            {user?.foto ? (
              <Image
                source={{
                  uri: user.foto.startsWith('http')
                    ? user.foto
                    : `${BASE_URL}/storage/${user.foto}`,
                }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraIcon}>
              <MaterialCommunityIcons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.profileName}>
              {user?.nama?.toUpperCase() || 'PENGGUNA'}
            </Text>
            <Text style={styles.profileDesc}>
              {user?.jenis_motor || 'Belum memilih motor'}
            </Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          </View>
        </View>

        {/* ── DATA PRIBADI ─────────────────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Data Pribadi</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || '-'}</Text>

          <Text style={styles.label}>Nama</Text>
          {editMode ? (
            <TextInput
              style={styles.input}
              value={form.nama}
              onChangeText={(t) => setForm({ ...form, nama: t })}
              placeholder="Masukkan nama"
              placeholderTextColor={TEXT_SUB}
            />
          ) : (
            <Text style={styles.value}>{user?.nama || '-'}</Text>
          )}

          <Text style={styles.label}>No HP</Text>
          {editMode ? (
            <TextInput
              style={styles.input}
              value={form.no_hp}
              onChangeText={(t) => setForm({ ...form, no_hp: t })}
              keyboardType="phone-pad"
              placeholder="Masukkan nomor HP"
              placeholderTextColor={TEXT_SUB}
            />
          ) : (
            <Text style={styles.value}>{user?.no_hp || '-'}</Text>
          )}

          <Text style={styles.label}>Alamat</Text>
          {editMode ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.alamat}
              onChangeText={(t) => setForm({ ...form, alamat: t })}
              multiline
              numberOfLines={3}
              placeholder="Masukkan alamat"
              placeholderTextColor={TEXT_SUB}
            />
          ) : (
            <Text style={styles.value}>{user?.alamat || '-'}</Text>
          )}
        </View>

        {/* ── JENIS MOTOR ──────────────────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Jenis Motor</Text>
          {editMode ? (
            <TouchableOpacity
              style={styles.customPicker}
              onPress={() => setMotorModalVisible(true)}
            >
              <Text style={[styles.pickerText, !form.jenis_motor && { color: TEXT_SUB }]}>
                {form.jenis_motor || 'Pilih Jenis Motor'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={22} color={PRIMARY} />
            </TouchableOpacity>
          ) : (
            <View style={styles.row}>
              <MaterialCommunityIcons name="scooter" size={18} color={PRIMARY} />
              <Text style={[styles.value, { marginLeft: 8 }]}>
                {user?.jenis_motor
                  ? MOTOR_OPTIONS.find(o => o.value === user.jenis_motor)?.label || user.jenis_motor
                  : 'Belum dipilih'}
              </Text>
            </View>
          )}
        </View>

        {/* ── GANTI PASSWORD (edit mode saja) ─────────────────────────────── */}
        {editMode && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Ganti Password</Text>

            {[
              { key: 'oldPassword',         label: 'Password Lama',             show: showOldPassword,     toggle: setShowOldPassword },
              { key: 'newPassword',          label: 'Password Baru',             show: showNewPassword,     toggle: setShowNewPassword },
              { key: 'confirmNewPassword',   label: 'Konfirmasi Password Baru',  show: showConfirmPassword, toggle: setShowConfirmPassword },
            ].map(({ key, label, show, toggle }) => (
              <View key={key} style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={label}
                  placeholderTextColor={TEXT_SUB}
                  secureTextEntry={!show}
                  value={(form as any)[key]}
                  onChangeText={(t) => setForm({ ...form, [key]: t })}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => toggle(!show)}>
                  <MaterialCommunityIcons name={show ? 'eye' : 'eye-off'} size={18} color={TEXT_SUB} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ── TOMBOL SIMPAN ────────────────────────────────────────────────── */}
        {editMode && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving || loading}
          >
            {saving
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.saveText}>Simpan Perubahan</Text>
            }
          </TouchableOpacity>
        )}

        {/* ── LOGOUT ───────────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color={DANGER} />
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── MODAL: Pilih Motor ──────────────────────────────────────────────── */}
      <Modal
        visible={motorModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMotorModalVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Pilih Jenis Motor</Text>
            <FlatList
              data={MOTOR_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.sheetItem,
                    form.jenis_motor === item.value && styles.sheetItemActive,
                  ]}
                  onPress={() => selectMotor(item.value)}
                >
                  <MaterialCommunityIcons name={item.icon} size={20} color={PRIMARY} style={{ marginRight: 12 }} />
                  <Text style={styles.sheetItemText}>{item.label}</Text>
                  {form.jenis_motor === item.value && (
                    <MaterialCommunityIcons name="check" size={18} color={PRIMARY} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.sheetClose} onPress={() => setMotorModalVisible(false)}>
              <Text style={styles.sheetCloseText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: Konfirmasi Simpan ─────────────────────────────────────────── */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.centerOverlay}>
          <Animated.View style={[styles.centerModal, { opacity: fadeAnim }]}>
            <View style={styles.modalIconWrap}>
              <MaterialCommunityIcons name="content-save-check" size={32} color={PRIMARY} />
            </View>
            <Text style={styles.modalTitle}>Simpan Perubahan?</Text>
            <Text style={styles.modalDesc}>Pastikan semua data sudah benar sebelum menyimpan.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnConfirm]} onPress={confirmSave}>
                <Text style={styles.modalBtnConfirmText}>Ya, Simpan</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* ── MODAL: Sukses ────────────────────────────────────────────────────── */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.centerOverlay}>
          <Animated.View style={[styles.centerModal, { opacity: fadeAnim }]}>
            <View style={[styles.modalIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <MaterialCommunityIcons name="check-circle" size={32} color="#10B981" />
            </View>
            <Text style={styles.modalTitle}>Berhasil!</Text>
            <Text style={styles.modalDesc}>{modalMessage}</Text>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnConfirm, { flex: 1 }]}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.modalBtnConfirmText}>OK</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* ── MODAL: Konfirmasi Logout ─────────────────────────────────────────── */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.centerOverlay}>
          <View style={styles.centerModal}>
            <View style={[styles.modalIconWrap, { backgroundColor: '#FEF2F2' }]}>
              <MaterialCommunityIcons name="logout" size={32} color={DANGER} />
            </View>
            <Text style={styles.modalTitle}>Keluar dari Akun?</Text>
            <Text style={styles.modalDesc}>
              Anda akan keluar dan harus login kembali untuk menggunakan aplikasi.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: DANGER, flex: 1 }]}
                onPress={confirmLogout}
              >
                <Text style={styles.modalBtnConfirmText}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;

// ── StyleSheet ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // Header — sama pola Dashboard
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  title: {
    color: TEXT_MAIN,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: TEXT_SUB,
    fontSize: 12,
  },

  // Profile card — sama pola profileCard Dashboard
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: PRIMARY,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: BORDER,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: PRIMARY,
    fontSize: 20,
    fontWeight: '700',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    backgroundColor: PRIMARY,
    padding: 4,
    borderRadius: 10,
  },
  profileName: {
    color: TEXT_MAIN,
    fontWeight: '700',
    fontSize: 14,
  },
  profileDesc: {
    color: TEXT_SUB,
    fontSize: 12,
    marginTop: 2,
  },
  profileEmail: {
    color: PRIMARY,
    fontSize: 11,
    marginTop: 2,
  },

  // Section cards
  sectionCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: TEXT_SUB,
    marginBottom: 4,
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    color: TEXT_MAIN,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  input: {
    backgroundColor: BG,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: TEXT_MAIN,
    fontSize: 14,
    marginBottom: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Picker
  customPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: BG,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 4,
  },
  pickerText: {
    color: TEXT_MAIN,
    fontSize: 14,
  },

  // Password
  passwordContainer: { position: 'relative' },
  eyeIcon: { position: 'absolute', right: 12, top: 26 },

  // Buttons
  saveButton: {
    backgroundColor: PRIMARY,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveText: {
    fontWeight: '700',
    color: '#fff',
    fontSize: 15,
  },
  logoutButton: {
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: DANGER,
  },
  logoutText: {
    color: DANGER,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Bottom sheet modal (Motor)
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_MAIN,
    marginBottom: 14,
    textAlign: 'center',
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  sheetItemActive: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  sheetItemText: {
    color: TEXT_MAIN,
    fontSize: 15,
  },
  sheetClose: {
    marginTop: 14,
    paddingVertical: 14,
    backgroundColor: CARD,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  sheetCloseText: {
    color: TEXT_MAIN,
    fontSize: 15,
    fontWeight: '600',
  },

  // Center modal (confirm, success, logout)
  centerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerModal: {
    backgroundColor: BG,
    borderRadius: 20,
    padding: 28,
    width: '82%',
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_MAIN,
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 13,
    color: TEXT_SUB,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
  },
  modalBtnCancelText: {
    color: TEXT_MAIN,
    fontSize: 14,
    fontWeight: '600',
  },
  modalBtnConfirm: {
    backgroundColor: PRIMARY,
  },
  modalBtnConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
