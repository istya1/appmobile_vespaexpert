import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

// Definisi warna (untuk hilangkan error TS)
const GOLD = '#D4AF37';
const DARK_BG = '#111111';

// Import semua screen
import LoginScreen from '../screens/login';
import RegisterScreen from '../screens/register';
import DashboardScreen from '../screens/dashboard';
import RiwayatScreen from '../screens/riwayat';
import ProfileScreen from '../screens/profil';
import VespaPedia from '../screens/vespa-pedia';
import VespaSmart from '../screens/vespa-smart';
import HubungiKami from '../screens/hubungi-kami';
import VespaCare from '../screens/vespa-care';
import BengkelScreen from '../screens/bengkel';
import DashboardFooter from '../components/footer';
import NotifikasiScreen from '../screens/notifikasi';
import VespaDetail from '../screens/vespa-detail';
import HasilDiagnosis from '../screens/hasil-diagnosis';
import RiwayatDiagnosisScreen from '../screens/riwayat';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Dashboard: undefined;
  VespaPedia: undefined;
  Riwayat: undefined;
  Profil: undefined;
  Login: undefined;
  Register: undefined;
  VespaSmart: undefined;
  HubungiKami: undefined;
  VespaCare: undefined;
  Bengkel: undefined;
  Notifikasi: undefined;
  VespaDetail: undefined;
  HasilDiagnosis: { hasil: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/* =======================
   Auth Stack (belum login)
======================= */
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

/* =======================
   Main Stack (sudah login)
======================= */
const MainStack = () => (
  <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="VespaPedia" component={VespaPedia} />
      <Stack.Screen name="VespaSmart" component={VespaSmart} />
      <Stack.Screen name="Riwayat" component={RiwayatScreen} />
      <Stack.Screen name="HubungiKami" component={HubungiKami} />
      <Stack.Screen name="VespaCare" component={VespaCare} />
      <Stack.Screen name="Profil" component={ProfileScreen} />
      <Stack.Screen name="Bengkel" component={BengkelScreen} />
      <Stack.Screen name="Notifikasi" component={NotifikasiScreen} />
      <Stack.Screen name="VespaDetail" component={VespaDetail} />
      <Stack.Screen name="HasilDiagnosis" component={HasilDiagnosis} />
      {/* Register & Login sudah dipindah ke AuthStack */}
    </Stack.Navigator>
    <DashboardFooter />
  </SafeAreaView>
);

/* =======================
   Loading Screen
======================= */
const LoadingScreen = () => (
  <View style={{ flex: 1, backgroundColor: DARK_BG, alignItems: 'center', justifyContent: 'center' }}>
    <Image
      source={require('../../assets/logo.png')}
      style={{ width: 160, height: 160, marginBottom: 24 }}
      resizeMode="contain"
    />
    <Text style={{ fontSize: 30, fontWeight: '700', color: GOLD, marginBottom: 12 }}>
      Vespa Expert
    </Text>
    <Text style={{ fontSize: 18, color: '#AAAAAA', marginBottom: 40, textAlign: 'center' }}>
      Sistem Diagnosa Vespa Matic
    </Text>
    <ActivityIndicator size="large" color={GOLD} />
  </View>
);

/* =======================
   App Navigator
======================= */
const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('APP NAVIGATOR - TOKEN:', token);
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Error check token:', error);
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  if (isLoggedIn === null) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="Main" component={MainStack} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;