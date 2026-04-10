import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import API from '../services/api';

const GOLD = '#D4AF37';
const DARK = '#0A0A0A';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleForgot = async () => {
    if (!email) {
      Alert.alert('Error', 'Email wajib diisi');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Format email tidak valid');
      return;
    }

    setLoading(true);
    try {
      await API.post('/forgot-password', { email });

      Alert.alert(
        'Berhasil ✨',
        'Token reset password sudah dikirim ke email kamu.\n\nSilakan cek email lalu masukkan token di halaman berikutnya.',
        [
          {
            text: 'Lanjut Reset',
            onPress: () =>
              navigation.navigate('ResetPassword', {
                email: email, // 🔥 kirim email ke screen berikutnya
              }),
          },
        ]
      );

    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Gagal mengirim email'
      );
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
            <Text style={styles.buttonText}>Kirim Link Reset</Text>
          )}
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 10,
    paddingBottom: 20,
  },

  title: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#888',
    fontSize: 13,
  },

  card: {
    backgroundColor: '#1A1A1A',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },

  label: {
    color: '#AAA',
    marginBottom: 6,
    fontSize: 13,
  },

  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 12,
    color: '#FFF',
    marginBottom: 15,
  },

  button: {
    backgroundColor: GOLD,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});