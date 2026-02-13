import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';

interface FormData {
  nama: string;
  email: string;
  noHp: string;
  password: string;
  confirmPassword: string;
  jenisMontor: string;
}

const RegisterScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState<FormData>({
    nama: '',
    email: '',
    noHp: '',
    password: '',
    confirmPassword: '',
    jenisMontor: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.nama.trim()) return Alert.alert('Validasi', 'Nama wajib diisi');
    if (!formData.email.trim()) return Alert.alert('Validasi', 'Email wajib diisi');
    if (!formData.email.includes('@') || !formData.email.includes('.'))
      return Alert.alert('Validasi', 'Format email tidak valid');
    if (!formData.password) return Alert.alert('Validasi', 'Password wajib diisi');
    if (formData.password.length < 6)
      return Alert.alert('Validasi', 'Password minimal 6 karakter');
    if (formData.password !== formData.confirmPassword)
      return Alert.alert('Validasi', 'Konfirmasi password tidak cocok');
    if (!formData.jenisMontor)
      return Alert.alert('Validasi', 'Jenis motor wajib dipilih');

    setLoading(true);
    try {
      await api.post('/register', {
        nama: formData.nama,
        email: formData.email,
        no_hp: formData.noHp || null,
        password: formData.password,
        jenis_montor: formData.jenisMontor,
      });
      Alert.alert(
        'Registrasi Berhasil!',
        'Akun Anda telah dibuat. Silakan login untuk melanjutkan.',
        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
      );
    } catch (error: any) {
      let message = 'Registrasi gagal. ';
      if (error.response) {
        message += error.response.data?.message || 'Periksa data yang diisi';
      } else if (error.request) {
        message += 'Tidak bisa koneksi ke server. Cek jaringan?';
      } else {
        message += error.message;
      }
      Alert.alert('Registrasi Gagal', message);
    } finally {
      setLoading(false);
    }
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
        />

        {/* Email */}
        <Text style={styles.label}>
          Email <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Isi DenganEmail"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
        />

        {/* No HP */}
        <Text style={styles.label}>
          No HP <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Isi Dengan No HP"
          keyboardType="phone-pad"
          value={formData.noHp}
          onChangeText={(text) => setFormData({ ...formData, noHp: text })}
        />

        {/* Jenis Motor */}
        <Text style={styles.label}>
          Jenis Motor <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={formData.jenisMontor}
            onValueChange={(itemValue) =>
              setFormData({ ...formData, jenisMontor: itemValue })
            }
          >
            <Picker.Item label="Pilih Jenis Motor" value="" />
            <Picker.Item label="Primavera 150" value="Primavera 150" />
            <Picker.Item label="Primavera S 150" value="Primavera S 150" />
            <Picker.Item label="LX 125" value="LX 125" />
            <Picker.Item label="Sprint 150" value="Sprint 150" />
            <Picker.Item label="Sprint S 150" value="Sprint S 150" />
          </Picker>
        </View>

        {/* Password */}
        <Text style={styles.label}>
          Password <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Isi Dengan Password"
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(text) =>
              setFormData({ ...formData, password: text })
            }
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
            placeholder="Isi Dengan Konfirmasi Password"
            secureTextEntry={!showConfirmPassword}
            value={formData.confirmPassword}
            onChangeText={(text) =>
              setFormData({ ...formData, confirmPassword: text })
            }
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          >
            <MaterialCommunityIcons
              name={showConfirmPassword ? 'eye' : 'eye-off'}
              size={24}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        {/* Button */}
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
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.loadingText}>Mendaftar...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Daftar</Text>
          )}
        </TouchableOpacity>

        {/* Login */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>
            Sudah punya akun? Masuk di sini
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const GOLD = '#D4AF37';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
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
    marginBottom: 30,
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

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },

  required: {
    color: GOLD,
  },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#3A3A3A',
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    backgroundColor: '#2A2A2A',
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

  button: {
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
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
    marginTop: 28,
    color: GOLD,
    fontSize: 15,
    fontWeight: '600',
  },
});
