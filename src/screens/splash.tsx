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
    StatusBar.setBackgroundColor('#0F172A', true); // Midnight Blue
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('MainApp');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logonw.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.appTitle}>VESPA EXPERT</Text>
        <View style={styles.goldLine} />
        <Text style={styles.subtitle}>
          Smart Diagnosis for Vespa Matic
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // navy luxury
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoContainer: {
    marginBottom: 40,
  },

  logo: {
    width: 220,
    height: 220,
  },

  textContainer: {
    alignItems: 'center',
  },

  appTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 4,
    color: '#F8FAFC', // soft white
  },

  goldLine: {
    width: 80,
    height: 3,
    backgroundColor: '#C6A75E', // gold accent
    marginVertical: 16,
    borderRadius: 10,
  },

  subtitle: {
    fontSize: 16,
    color: '#CBD5E1', // elegant gray
    letterSpacing: 1,
  },
});

export default SplashScreen;
