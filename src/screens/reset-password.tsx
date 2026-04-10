import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import API from '../services/api';

const GOLD = '#D4AF37';
const DARK = '#0A0A0A';

export default function ResetPasswordScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState(route.params?.email || '');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email || !token || !password || !confirm) {
      Alert.alert('Error', 'Semua field wajib diisi');
      return;
    }

    if (password !== confirm) {
      Alert.alert('Error', 'Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/reset-password', {
        email,
        token,
        password,
        password_confirmation: confirm,
      });

      Alert.alert('Sukses', res.data.message, [
        {
          text: 'Login',
          onPress: () => navigation.navigate('Login'),
        },
      ]);

    } catch (err: any) {
      Alert.alert(
        'Error',
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
          <Ionicons name="arrow-back" size={24} color={GOLD} />
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
    </View>
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
    marginTop: 10,
    fontSize: 13,
  },

  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 12,
    color: '#FFF',
    marginBottom: 10,
  },

  button: {
    backgroundColor: GOLD,
    padding: 14,
    borderRadius: 12,
    marginTop: 15,
    alignItems: 'center',
  },

  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});