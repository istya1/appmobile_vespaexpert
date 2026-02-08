import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#0D47A1', true); // Biru tua solid
  }, []);

  // Auto pindah ke MainApp setelah 4 detik
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('MainApp'); // Sesuaikan nama screen di RootStack
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo Vespa Besar dengan Shadow Glowing */}
        <View style={styles.logoContainer}>
          <View style={styles.logoShadow}>
            <Image
              source={require('../../assets/logo.png')} // Pastikan file & path benar!
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Teks di Bawah Logo – Keren Abis! */}
        <View style={styles.textContainer}>
            <Text style={styles.appTitle}>Vespa Expert</Text>
          <Text style={styles.subtitle}>
            Sistem Pakar untuk Vespa Matic
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff', 
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 25,
  },
  logo: {
    width: 260,
    height: 260,
  },
  textContainer: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: 'black',
    letterSpacing: 2,
    marginBottom: 12,
   
  },
  mainTagline: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'grey',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 19,
    color: '#0000',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SplashScreen;