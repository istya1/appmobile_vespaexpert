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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { logout } from '../services/auth';

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
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
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
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin Ditolak', 'Izinkan akses galeri untuk upload foto');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setUser({ ...user, foto: uri });
      // TODO: Upload ke backend kalau perlu
    }
  };

  const handleSave = async () => {
    if (form.newPassword && form.newPassword.length < 6) {
      return Alert.alert('Error', 'Password baru minimal 6 karakter');
    }
    if (form.newPassword !== form.confirmNewPassword) {
      return Alert.alert('Error', 'Konfirmasi password baru tidak cocok');
    }

    setLoading(true);
    try {
      // Sesuaikan endpoint update profil Laravel mu
      await api.put('/users/me', {
        nama: form.nama,
        no_hp: form.no_hp,
        alamat: form.alamat,
        jenis_motor: form.jenis_motor,
        password: form.newPassword || undefined,
      });

      const updatedUser = {
        ...user,
        nama: form.nama,
        no_hp: form.no_hp,
        alamat: form.alamat,
        jenis_motor: form.jenis_motor,
      };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      Alert.alert('Sukses', 'Profil berhasil diperbarui!');
      setEditMode(false);
    } catch (error: any) {
      Alert.alert('Gagal', error.response?.data?.message || 'Gagal update profil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Konfirmasi Logout', 'Yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await logout();
          // Otomatis pindah ke Login via AppNavigator (tidak perlu navigation.replace)
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar + Upload Foto */}
        <View style={styles.avatarContainer}>
          <Image
            source={user?.foto ? { uri: user.foto } : { uri: 'https://via.placeholder.com/150' }}
            style={styles.avatarImage}
          />
          <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}>
            <MaterialCommunityIcons name="camera" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Profil Pengguna</Text>
          <TouchableOpacity onPress={() => setEditMode(!editMode)}>
            <MaterialCommunityIcons name={editMode ? 'check' : 'pencil'} size={28} color="#007bff" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          {/* Email (tidak bisa edit) */}
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="email-outline" size={22} color="#666" />
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email || '-'}</Text>
          </View>

          {/* Nama */}
          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="account-outline" size={22} color="#666" />
            <Text style={styles.label}>Nama</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={form.nama}
                onChangeText={(text) => setForm({ ...form, nama: text })}
              />
            ) : (
              <Text style={styles.value}>{user?.nama || '-'}</Text>
            )}
          </View>

          {/* No HP */}
          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="phone-outline" size={22} color="#666" />
            <Text style={styles.label}>No HP</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={form.no_hp}
                onChangeText={(text) => setForm({ ...form, no_hp: text })}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{user?.no_hp || '-'}</Text>
            )}
          </View>

          {/* Alamat */}
          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={22} color="#666" />
            <Text style={styles.label}>Alamat</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={form.alamat}
                onChangeText={(text) => setForm({ ...form, alamat: text })}
                multiline
              />
            ) : (
              <Text style={styles.value}>{user?.alamat || '-'}</Text>
            )}
          </View>

          {/* Jenis Motor */}
          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="moped-outline" size={22} color="#666" />
            <Text style={styles.label}>Jenis Motor</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={form.jenis_motor}
                onChangeText={(text) => setForm({ ...form, jenis_motor: text })}
                placeholder="Contoh: Vespa Sprint 150"
              />
            ) : (
              <Text style={styles.value}>{user?.jenis_motor || '-'}</Text>
            )}
          </View>

          {/* Ganti Password (hanya di edit mode) */}
          {editMode && (
            <View style={styles.passwordSection}>
              <Text style={styles.sectionTitle}>Ganti Password</Text>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password Lama"
                  secureTextEntry={!showOldPassword}
                  value={form.oldPassword}
                  onChangeText={(text) => setForm({ ...form, oldPassword: text })}
                />
                <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                  <MaterialCommunityIcons name={showOldPassword ? 'eye' : 'eye-off'} size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password Baru"
                  secureTextEntry={!showNewPassword}
                  value={form.newPassword}
                  onChangeText={(text) => setForm({ ...form, newPassword: text })}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <MaterialCommunityIcons name={showNewPassword ? 'eye' : 'eye-off'} size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Konfirmasi Password Baru"
                  secureTextEntry={!showConfirmPassword}
                  value={form.confirmNewPassword}
                  onChangeText={(text) => setForm({ ...form, confirmNewPassword: text })}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <MaterialCommunityIcons name={showConfirmPassword ? 'eye' : 'eye-off'} size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {editMode && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            <Text style={styles.saveText}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#fff" />
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ddd',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 10,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 30,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginLeft: 12,
    width: 100,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'right',
  },
  passwordSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#dc3545',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ProfileScreen;