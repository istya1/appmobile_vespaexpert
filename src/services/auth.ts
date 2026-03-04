import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (email: string, password: string) => {
  const response = await api.post('/login', { email, password });
  const { token, user } = response.data;

  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('user', JSON.stringify(user));

  return response.data;
};

export const logout = async () => {
  try {
    // Panggil logout backend dulu (pakai token yang masih ada)
    await api.post('/logout'); // atau '/api/logout' sesuaikan route kamu
  } catch (error) {
    console.warn('Logout backend gagal, tapi lanjut clear local');
  }
};

export const getCurrentUser = async () => {
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};