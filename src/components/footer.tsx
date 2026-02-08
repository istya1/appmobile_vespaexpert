import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

type RootStackParamList = {
  Dashboard: undefined;
  Care: undefined;
  Diagnosa: undefined;
  Riwayat: undefined;
  Profile: undefined;
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const DashboardFooter = () => {
  const navigation = useNavigation<NavProp>();

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Home */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <MaterialCommunityIcons name="home-variant" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Vespa Care */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('Care')}
        >
          <MaterialCommunityIcons name="wrench-clock" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Diagnosa (Floating) */}
        <TouchableOpacity
          style={styles.centerButton}
          onPress={() => navigation.navigate('Diagnosa')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="tools" size={32} color="#1E40AF" />
        </TouchableOpacity>

        {/* Riwayat */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('Riwayat')}
        >
          <MaterialCommunityIcons name="history" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('Profile')}
        >
          <MaterialCommunityIcons name="account-circle" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DashboardFooter;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#1E40AF',
  },

  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,              // 🔥 TIPIS seperti IG
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },

  item: {
    flex: 1,
    alignItems: 'center',
  },

  centerButton: {
    position: 'relative',
    top: -20,                // 🔥 NAIK ke atas
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
});
