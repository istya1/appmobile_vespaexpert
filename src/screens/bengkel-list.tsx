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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import BengkelService from '../services/bengkel';

type RootStackParamList = {
  BengkelDetail: { bengkelId: number | string };
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const PRIMARY = '#4A90E2';   // biru utama
const BACKGROUND = '#F9FAFB'; // putih soft
const CARD = '#FFFFFF';
const BORDER = '#E5E7EB';
const TEXT = '#111827';
const SUBTEXT = '#6B7280';

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
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Memuat daftar bengkel...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY} />
        </TouchableOpacity>

        <View style={{ marginLeft: 12 }}>
          <Text style={styles.title}>DAFTAR BENGKEL</Text>
          <Text style={styles.subtitle}>Bengkel Resmi Vespa Terdekat</Text>
        </View>

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
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={PRIMARY} />
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
  container: { flex: 1, backgroundColor: BACKGROUND },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND,
  },
  loadingText: { color: '#999', marginTop: 10, fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: '700', color: TEXT },
  subtitle: { fontSize: 13, color: PRIMARY, marginTop: 4 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchInput: { flex: 1, marginLeft: 10, color: '#fff', fontSize: 14 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: BORDER,
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
  bengkelName: { fontSize: 19, fontWeight: '700', color: TEXT },
  alamat: { color: SUBTEXT, fontSize: 13, marginTop: 6, lineHeight: 18 },
  infoRow: { flexDirection: 'row', marginTop: 12, justifyContent: 'space-between' },
  rating: { color: PRIMARY, fontWeight: '600', fontSize: 15 },
  jarak: { color: SUBTEXT, fontSize: 13 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { color: SUBTEXT, marginTop: 15, fontSize: 16 },
});

export default BengkelListScreen;