import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DashboardHeader from '../components/header';

type RootStackParamList = {
  Dashboard: undefined;
  VespaPedia: undefined;
  VespaSmart: undefined;
  Riwayat: undefined;
  HubungiKami: undefined; // ini boleh tetap ada, tapi tidak dipakai lagi di sini
  Bengkel: undefined;
  VespaCare: undefined;
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation<NavProp>();

  // Fungsi buka WhatsApp langsung
  const openWhatsApp = () => {
    const phone = '6281217097512'; 
    const message = 'Halo Admin Vespa Smart Madiun, Izin Bertanya🙏';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          console.log("Tidak bisa membuka WhatsApp");
          // Optional: tampilkan alert kalau WA tidak terinstall
        }
      })
      .catch(err => console.error('Error membuka WhatsApp:', err));
  };

  return (
    <View style={styles.container}>
      <DashboardHeader />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Bengkel */}
        <TouchableOpacity
          style={styles.banner}
          onPress={() => navigation.navigate('Bengkel')}
        >
          <Text style={styles.bannerText}>
            Bengkel Resmi Vespa
          </Text>
        </TouchableOpacity>

        {/* Hero Image */}
        <Image
          source={require('../../assets/vespaada3.png')}
          style={styles.hero}
          resizeMode="contain"
        />

        {/* Vespa Pedia */}
        <TouchableOpacity
          style={styles.cardPrimary}
          onPress={() => navigation.navigate('VespaPedia')}
          activeOpacity={0.85}
        >
          <Image
            source={require('../../assets/pedia.png')}
            style={styles.primaryIcon}
          />
          <View>
            <Text style={styles.primaryTitle}>Vespa Pedia</Text>
            <Text style={styles.primaryDesc}>
              Info mesin, tipe & keunggulan
            </Text>
          </View>
        </TouchableOpacity>

        {/* Grid Menu */}
        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('VespaSmart')}
          >
            <Image
              source={require('../../assets/smart.png')}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Vespa Smart</Text>
            <Text style={styles.cardDesc}>Diagnosa Kerusakan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Riwayat')}
          >
            <Image
              source={require('../../assets/riwayat.png')}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Riwayat</Text>
            <Text style={styles.cardDesc}>Service & Diagnosa</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating WA - Langsung buka WhatsApp */}
      <TouchableOpacity style={styles.fab} onPress={openWhatsApp}>
        <Text style={styles.fabText}>Hubungi Kami</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DashboardScreen;

// Styles tetap sama
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scroll: {
    padding: width * 0.05,
    paddingBottom: 140,
  },
  banner: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
    marginBottom: 20,
  },
  bannerText: {
    color: '#6B7280',
    fontSize: 16,
  },
  hero: {
    width: '100%',
    height: width * 0.5,
    marginBottom: 24,
  },
  cardPrimary: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  primaryIcon: {
    width: 52,
    height: 52,
    marginRight: 16,
  },
  primaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  primaryDesc: {
    color: '#4B5563',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
  },
  cardIcon: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: '700',
    color: '#1F2937',
  },
  cardDesc: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    backgroundColor: '#355F87',
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 999,
    elevation: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});