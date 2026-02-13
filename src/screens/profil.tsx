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
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';

const GOLD = '#D4AF37';

const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nama: '',
    no_hp: '',
    alamat: '',
    jenis_montor: '',
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

  // Reload user setiap kali screen di-focus (pindah dari tab lain)
  useFocusEffect(
    React.useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    const storedUser = await AsyncStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setForm({
        nama: parsed.nama || '',
        no_hp: parsed.no_hp || '',
        alamat: parsed.alamat || '',
        jenis_montor: parsed.jenis_montor || '',
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin Ditolak', 'Mohon izinkan akses ke galeri untuk mengunggah foto profil');
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
      
      // Upload ke backend
      const data = new FormData();
      data.append('foto', {
        uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);

      try {
        const res = await api.post(`/users/${user.id_user}/upload-photo`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const fotoUrl = res.data.foto;
        
        // Update state dan AsyncStorage dengan foto URL dari server
        const updatedUser = { ...user, foto: fotoUrl };
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        Alert.alert('Berhasil', 'Foto profil berhasil diunggah');
      } catch (err: any) {
        Alert.alert('Gagal', err.response?.data?.message || 'Gagal mengunggah foto');
      }
    }
  };

  const handleSave = async () => {
    if (form.newPassword && form.newPassword.length < 6) {
      return Alert.alert('Kesalahan', 'Password baru minimal 6 karakter');
    }
    if (form.newPassword && form.newPassword !== form.confirmNewPassword) {
      return Alert.alert('Kesalahan', 'Konfirmasi password baru tidak cocok');
    }

    setLoading(true);
    try {
      // Update profil (tanpa foto, foto dihandle terpisah di pickImage)
      const response = await api.put(`/users/${user.id_user}`, {
        nama: form.nama,
        no_hp: form.no_hp,
        alamat: form.alamat,
        jenis_montor: form.jenis_montor,
      });

      // Update password jika diisi
      if (form.newPassword && form.oldPassword) {
        await api.put(`/users/${user.id_user}/change-password`, {
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
        });
      }

      // Update local state dengan response dari server, tapi tetap simpan foto
      const updatedUser = { 
        ...user, 
        ...response.data.data,
        foto: user.foto // Pastikan foto tidak hilang
      };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      Alert.alert('Berhasil', 'Profil berhasil diperbarui!');
      setEditMode(false);
      
      // Reset password fields
      setForm({
        ...form,
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      
    } catch (error: any) {
      console.error('Update error:', error.response?.data);
      Alert.alert('Gagal', error.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Konfirmasi Keluar', 'Yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* ===== Avatar Section ===== */}
        <View style={styles.avatarContainer}>
          <Image
            source={user?.foto ? { uri: user.foto } : require('../../assets/ava.png')}
            style={styles.avatarImage}
          />
          <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}>
            <MaterialCommunityIcons name="camera" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ===== Header ===== */}
        <View style={styles.header}>
          <Text style={styles.title}>Profil Pengguna</Text>
          <TouchableOpacity onPress={() => setEditMode(!editMode)}>
            <MaterialCommunityIcons name={editMode ? 'check' : 'pencil'} size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ===== Data Pribadi Section ===== */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Data Pribadi</Text>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || '-'}</Text>

          {/* Nama */}
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

          {/* No HP */}
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

          {/* Alamat */}
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

        {/* ===== Jenis Montor Section ===== */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Jenis Motor</Text>
          {editMode ? (
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={form.jenis_montor}
                style={styles.picker}
                dropdownIconColor={GOLD}
                onValueChange={(itemValue) =>
                  setForm({ ...form, jenis_montor: itemValue })
                }
              >
                <Picker.Item label="Pilih Jenis Motor" value="" color="#777" />
                <Picker.Item label="Vespa Sprint 150" value="Vespa Sprint 150" color="#fff" />
                <Picker.Item label="Vespa Sprint S 150" value="Vespa Sprint S 150" color="#fff" />
                <Picker.Item label="Vespa Primavera 150" value="Vespa Primavera 150" color="#fff" />
                <Picker.Item label="Vespa Primavera S 150" value="Vespa Primavera S 150" color="#fff" />
                <Picker.Item label="Vespa LX 125" value="Vespa LX 125" color="#fff" />
              </Picker>
            </View>
          ) : (
            <Text style={styles.value}>{user?.jenis_montor || '-'}</Text>
          )}
        </View>

        {/* ===== Password Section ===== */}
        {editMode && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Ganti Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Password Lama"
              placeholderTextColor="#777"
              secureTextEntry={!showOldPassword}
              value={form.oldPassword}
              onChangeText={(text) => setForm({ ...form, oldPassword: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Password Baru"
              placeholderTextColor="#777"
              secureTextEntry={!showNewPassword}
              value={form.newPassword}
              onChangeText={(text) => setForm({ ...form, newPassword: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Konfirmasi Password Baru"
              placeholderTextColor="#777"
              secureTextEntry={!showConfirmPassword}
              value={form.confirmNewPassword}
              onChangeText={(text) => setForm({ ...form, confirmNewPassword: text })}
            />
          </View>
        )}

        {/* ===== Save Button ===== */}
        {editMode && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            <Text style={styles.saveText}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</Text>
          </TouchableOpacity>
        )}

        {/* ===== Logout Button ===== */}
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
  pickerWrapper: {
    backgroundColor: '#252525',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: { 
    color: '#fff',
    backgroundColor: '#252525',
  },
  saveButton: {
    backgroundColor: GOLD,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveText: { fontWeight: '700', color: '#000', fontSize: 16 },
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
});

export default ProfileScreen;