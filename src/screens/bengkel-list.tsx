import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import BengkelService from '../services/bengkel';

type RootStackParamList = {
  BengkelDetail: { bengkelId: number | string };
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const GOLD = '#D4AF37';

const BengkelListScreen = () => {
  const navigation = useNavigation<NavProp>();
  const isFocused = useIsFocused();

  const [bengkelList, setBengkelList] = useState<any[]>([]);
  const [filteredBengkel, setFilteredBengkel] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isFocused) {
      fetchBengkelData();
    }
  }, [isFocused]);

  // Search filter
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = bengkelList.filter((b) =>
        b.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.alamat?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBengkel(filtered);
    } else {
      setFilteredBengkel(bengkelList);
    }
  }, [searchQuery, bengkelList]);

  const fetchBengkelData = async () => {
    try {
      setLoading(true);

      const response = await BengkelService.getAll();   // Ini AxiosResponse

      // Ambil .data karena ApiService menggunakan Axios
      const data = response.data || response;   // safety: kalau bukan AxiosResponse

      // Logic otomatis ke detail jika hanya 1 bengkel
      if (Array.isArray(data) && data.length === 1) {
        navigation.replace('BengkelDetail', { bengkelId: data[0].id });
        return;
      }

      // Simpan data ke state
      const bengkelData = Array.isArray(data) ? data : [];
      setBengkelList(bengkelData);
      setFilteredBengkel(bengkelData);

    } catch (error: any) {
      console.error('Error fetching bengkel list:', error);
      setBengkelList([]);
      setFilteredBengkel([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBengkelData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={styles.loadingText}>Memuat daftar bengkel...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DAFTAR BENGKEL</Text>
        <Text style={styles.subtitle}>Bengkel Resmi Vespa Terdekat</Text>
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama bengkel atau kota"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={GOLD} />
        }
      >
        {filteredBengkel.map((bengkel) => (
          <TouchableOpacity
            key={bengkel.id}
            style={styles.card}
            onPress={() => navigation.navigate('BengkelDetail', { bengkelId: bengkel.id })}
            activeOpacity={0.9}
          >
            {bengkel.gambar_url ? (
              <Image
                source={{ uri: bengkel.gambar_url }}
                style={styles.bengkelImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.noImageContainer}>
                <MaterialCommunityIcons name="garage" size={70} color="#555" />
              </View>
            )}

            <View style={styles.overlay} />

            <View style={styles.cardContent}>
              <Text style={styles.bengkelName}>{bengkel.nama}</Text>
              <Text style={styles.alamat} numberOfLines={2}>
                {bengkel.alamat}
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.rating}>★ {bengkel.rating || '4.8'}</Text>
                {bengkel.jarak && <Text style={styles.jarak}>{bengkel.jarak} km</Text>}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredBengkel.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="garage" size={60} color="#555" />
            <Text style={styles.emptyText}>Bengkel tidak ditemukan</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E0E0E' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0E0E0E',
  },
  loadingText: { color: '#999', marginTop: 10, fontSize: 14 },
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 13, color: GOLD, marginTop: 4 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: GOLD,
  },
  searchInput: { flex: 1, marginLeft: 10, color: '#fff', fontSize: 14 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GOLD,
  },
  bengkelImage: { width: '100%', height: 180 },
  noImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    height: 180,
  },
  cardContent: { padding: 16 },
  bengkelName: { fontSize: 19, fontWeight: '700', color: '#fff' },
  alamat: { fontSize: 13, color: '#aaa', marginTop: 6, lineHeight: 18 },
  infoRow: { flexDirection: 'row', marginTop: 12, justifyContent: 'space-between' },
  rating: { color: GOLD, fontWeight: '600', fontSize: 15 },
  jarak: { color: '#999', fontSize: 13 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { color: '#555', marginTop: 15, fontSize: 16 },
});

export default BengkelListScreen;