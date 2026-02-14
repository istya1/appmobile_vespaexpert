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
   Main Stack (After Login)
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

    </Stack.Navigator>

    <DashboardFooter />
  </SafeAreaView>
);

/* =======================
   Auth Stack
======================= */
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

/* =======================
   Loading Screen
======================= */
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Image
      source={require('../../assets/logo.png')}
      style={styles.loadingLogo}
      resizeMode="contain"
    />
    <Text style={styles.loadingTitle}>Vespa Expert</Text>
    <Text style={styles.loadingSubtitle}>
      Sistem Diagnosa Vespa Matic
    </Text>
    <ActivityIndicator size="large" color="#2563EB" />
  </View>
);

/* =======================
   App Navigator
======================= */
const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking token:', error);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
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

/* =======================
   Styles
======================= */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* Loading */
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 12,
  },
  loadingSubtitle: {
    fontSize: 18,
    color: '#4B5563',
    marginBottom: 40,
    textAlign: 'center',
  },
});
