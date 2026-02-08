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
        'Registrasi Berhasil! 🎉',
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
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Daftar Akun Baru</Text>
        <Text style={styles.subtitle}>Sistem Diagnosa Vespa Matic</Text>

        {/* Nama */}
        <TextInput
          style={styles.input}
          placeholder="Nama Lengkap"
          value={formData.nama}
          onChangeText={(text) => setFormData({ ...formData, nama: text })}
          autoCapitalize="words"
        />

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
        />

        {/* No HP */}
        <TextInput
          style={styles.input}
          placeholder="No HP (opsional)"
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
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
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
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Konfirmasi Password"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logo: {
    width: 208,
    height: 208,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 16,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonNormal: {
    backgroundColor: '#2563EB',
  },
  buttonLoading: {
    backgroundColor: '#1D4ED8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  loginText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '500',
  },
});
