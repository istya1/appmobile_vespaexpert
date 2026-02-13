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
import { login } from '../services/auth';
import Toast from 'react-native-toast-message';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Email wajib diisi',
      });
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Toast.show({
        type: 'error',
        text1: 'Format email tidak valid',
      });
      return;
    }

    if (!password) {
      Toast.show({
        type: 'error',
        text1: 'Password wajib diisi',
      });
      return;
    }

    setLoading(true);

    try {
      await login(email, password);

      Toast.show({
        type: 'success',
        text1: 'Login Berhasil ✨',
        text2: 'Selamat datang kembali di Vespa Expert',
      });

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
        });
      }, 1500);

    } catch (error: any) {
      let message = '';

      if (error.response) {
        message =
          error.response.data?.message || 'Email atau password salah';
      } else if (error.request) {
        message = 'Tidak dapat terhubung ke server';
      } else {
        message = error.message;
      }

      Toast.show({
        type: 'error',
        text1: 'Login Gagal 🚫',
        text2: message,
      });
    } finally {
      setLoading(false);
    }

    const response = await login(email, password);

    if (response.user.role !== 'pengguna') {
      Toast.show({
        type: 'error',
        text1: 'Akses hanya untuk pengguna',
      });
      return;
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

        <Text style={styles.title}>Login Vespa Expert</Text>
        <Text style={styles.subtitle}>Sistem Diagnosa Vespa Matic</Text>

        {/* Email */}
        <Text style={styles.label}>
          Email <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Isi Dengan Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password */}
        <Text style={styles.label}>
          Password <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Isi Dengan Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
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

        {/* Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={[
            styles.button,
            loading ? styles.buttonLoading : styles.buttonNormal,
          ]}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.loadingText}>Memproses...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Masuk</Text>
          )}
        </TouchableOpacity>

        {/* Register */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>
            Belum punya akun? Daftar di sini
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
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

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },

  required: {
    color: GOLD,
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

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    marginBottom: 30,
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

  registerText: {
    textAlign: 'center',
    marginTop: 30,
    color: GOLD,
    fontSize: 15,
    fontWeight: '600',
  },
});
