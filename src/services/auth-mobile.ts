import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const AuthServiceMobile = {
  async login(email: string, password: string) {
    const response = await api.post('/login', { email, password });
    const { user, token } = response.data;

    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));

    return user;
  },

  async logout() {
    try {
      await api.post('/logout');
    } catch (e) {
      console.log('Logout API gagal');
    }

    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  async getToken() {
    return await AsyncStorage.getItem('token');
  },

  async getUser() {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default AuthServiceMobile;