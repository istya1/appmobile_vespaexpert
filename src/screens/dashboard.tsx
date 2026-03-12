import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.5:8000'; 

type RootStackParamList = {
  VespaPedia: undefined;
  Bengkel: undefined;
  Profil: undefined;
  Notifikasi: undefined;
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');

const vespaData = [
  {
    name: 'Vespa Sprint 150',
    desc: 'Sporty & Modern',
    image: require('../../assets/sprint150.png'),
  },
  {
    name: 'Vespa LX 125',
    desc: 'Simple & Stylish',
    image: require('../../assets/LX125.png'),
  },
  {
    name: 'Vespa Primavera',
    desc: 'Classic & Elegant',
    image: require('../../assets/primaveras.png'),
  },
];

const DashboardScreen = () => {
  const navigation = useNavigation<NavProp>();
  const [user, setUser] = useState<any>(null);

  // Load user pertama kali
  useEffect(() => {
    loadUser();
  }, []);

  // Reload user setiap kali screen di-focus (pindah dari tab lain)
  useFocusEffect(
    React.useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>VESPA EXPERT</Text>
            <Text style={styles.subtitle}>Aplikasi Vespa Matic</Text>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Notifikasi')}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        {/* PROFILE CARD di Dashboard atau halaman utama */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => navigation.navigate('Profil')}
        >
          {user?.foto ? (
            <Image
              source={{
                uri: user.foto.startsWith('http')
                  ? user.foto
                  : `${BASE_URL}/storage/${user.foto}`
              }}
              style={styles.profileImage}
            />
          ) : (
            <MaterialCommunityIcons name="account-circle" size={42} color="#D4AF37" />
          )}
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.profileName}>
              {user?.nama?.toUpperCase() || 'PENGGUNA'}
            </Text>
            <Text style={styles.profileDesc}>
              {user?.jenis_motor || 'Belum memilih motor'}  {/* ← GANTI JADI jenis_motor */}
            </Text>
          </View>
        </TouchableOpacity>

        {/* 3 VESPA IMAGE */}
        <Image
          source={require('../../assets/vespa3.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />

        {/* KOLEKSI */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Koleksi Vespa Matic</Text>
          <TouchableOpacity onPress={() => navigation.navigate('VespaPedia')}>
            <Text style={styles.seeAll}>lihat semua</Text>
          </TouchableOpacity>
        </View>

        {/* HORIZONTAL SCROLL */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20 }}
        >
          {vespaData.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.koleksiCard}
              onPress={() => navigation.navigate('VespaPedia')}
              activeOpacity={0.85}
            >
              <Image source={item.image} style={styles.koleksiImage} />
              <View style={styles.overlay} />
              <View style={styles.koleksiTextContainer}>
                <Text style={styles.koleksiTitle}>{item.name}</Text>
                <Text style={styles.koleksiSubtitle}>{item.desc}</Text>
              </View>

              {/* <View style={styles.badge}>
                <Text style={styles.badgeText}>2022</Text>
              </View> */}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* BENGKEL */}
        <TouchableOpacity
          style={styles.bengkelCard}
          onPress={() => navigation.navigate('Bengkel')}
        >
          <Text style={styles.bengkelHeader}>Bengkel Resmi Vespa</Text>

          <View style={styles.row}>
            <MaterialCommunityIcons name="map-marker" size={18} color="#D4AF37" />
            <Text style={styles.bengkelText}>
              Jl. Mayjen Sungkono No.4, Madiun
            </Text>
          </View>

          <View style={styles.row}>
            <MaterialCommunityIcons name="phone" size={18} color="#D4AF37" />
            <Text style={styles.bengkelText}>081234567890</Text>
          </View>

          <View style={styles.row}>
            <MaterialCommunityIcons name="clock-outline" size={18} color="#D4AF37" />
            <Text style={styles.bengkelText}>
              Senin - Minggu (08.30 - 19.30)
            </Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    marginBottom: 20,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },

  subtitle: {
    color: '#D4AF37',
    fontSize: 12,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 25,
    marginBottom: 20,
  },

  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },

  profileName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  profileDesc: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 2,
  },

  heroImage: {
    width: '100%',
    height: width * 0.5,
    marginBottom: 20,
  },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  seeAll: {
    color: '#D4AF37',
    fontSize: 12,
  },

  koleksiCard: {
    width: width * 0.7,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 15,
  },

  koleksiImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  koleksiTextContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },

  koleksiTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  koleksiSubtitle: {
    color: '#DDDDDD',
    fontSize: 13,
  },

  badge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  badgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },

  bengkelCard: {
    backgroundColor: '#2A2A2A',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    marginBottom: 40,
  },

  bengkelHeader: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 10,
  },

  bengkelText: {
    color: '#CCCCCC',
    marginLeft: 8,
    flex: 1,
  },
});