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
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import VespaPediaService, { VespaPediaItem } from '../services/vespa-pedia-service';
import DashboardFooter from '../components/footer';

type RootStackParamList = {
  VespaDetail: { jenisMotor: string };
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');

const GOLD = '#D4AF37';

const VespaPediaScreen = () => {
  const navigation = useNavigation<NavProp>();
  const [vespaList, setVespaList] = useState<VespaPediaItem[]>([]);
  const [filteredVespa, setFilteredVespa] = useState<VespaPediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchVespaData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = vespaList.filter((vespa) =>
        vespa.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vespa.jenis_motor.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVespa(filtered);
    } else {
      setFilteredVespa(vespaList);
    }
  }, [searchQuery, vespaList]);

  const fetchVespaData = async () => {
    try {
      setLoading(true);
      const data = await VespaPediaService.getList();
      setVespaList(data);
      setFilteredVespa(data);
    } catch (error: any) {
      console.error('Error fetching vespa:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchVespaData();
  };

  // Extract engine info from konten
  const getEngineInfo = (konten: string) => {
    const ccMatch = konten.match(/(\d+)\s*cc/i);
    return ccMatch ? `${ccMatch[1]}cc i-GET` : '150cc';
  };

  // Extract features from konten
  const extractFeatures = (konten: string) => {
    const features = [];
    if (konten.toLowerCase().includes('abs')) features.push('ABS');
    if (konten.toLowerCase().includes('led')) features.push('LED Lighting');
    if (konten.toLowerCase().includes('smart')) features.push('Smart Key');
    if (konten.toLowerCase().includes('usb') || konten.toLowerCase().includes('charging'))
      features.push('USB Charging');
    if (konten.toLowerCase().includes('injeksi') || konten.toLowerCase().includes('efi'))
      features.push('Fuel Injection');

    return features.length > 0 ? features : ['Premium Features'];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={styles.loadingText}>Memuat data Vespa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>VESPA PEDIA</Text>
        <Text style={styles.subtitle}>Informasi tentang tipe vespa</Text>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="cari tipe vespa"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* VESPA LIST */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={GOLD} />
        }
      >
        {filteredVespa.map((vespa) => (
          <TouchableOpacity
            key={vespa.id}
            style={styles.card}
            onPress={() => navigation.navigate('VespaDetail', { jenisMotor: vespa.jenis_motor })}
            activeOpacity={0.9}
          >

            {vespa.gambar_url ? (
              <Image
                source={{ uri: vespa.gambar_url }}
                style={styles.vespaImage}
                resizeMode="cover"
                onError={(e) => {
                  console.log('Image load error for:', vespa.judul);
                  console.log('URL:', vespa.gambar_url);
                }}
              />
            ) : (
              <View style={styles.noImageContainer}>
                <MaterialCommunityIcons name="motorbike" size={60} color="#555" />
              </View>
            )}

            {/* OVERLAY */}
            <View style={styles.overlay} />

            {/* CONTENT */}
            <View style={styles.cardContent}>
              <View>
                <Text style={styles.vespaName}>{vespa.judul}</Text>
                {/* <Text style={styles.vespaYear}>{vespa.jenis_motor}</Text> */}
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Mesin</Text>
                  <Text style={styles.infoValue}>{getEngineInfo(vespa.konten)}</Text>
                </View>
              </View>

              <Text style={styles.description} numberOfLines={3}>
                {vespa.konten}
              </Text>

              {/* FITUR UNGGULAN */}
              <Text style={styles.featureTitle}>Fitur Unggulan</Text>
              <View style={styles.featureContainer}>
                {extractFeatures(vespa.konten).slice(0, 4).map((feature, index) => (
                  <View key={index} style={styles.featureBadge}>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredVespa.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="motorbike" size={60} color="#555" />
            <Text style={styles.emptyText}>Vespa tidak ditemukan</Text>
          </View>
        )}
      </ScrollView>

    </View>
  );
};

export default VespaPediaScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E0E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0E0E0E',
  },
  loadingText: {
    color: '#999',
    marginTop: 10,
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: GOLD,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 2,
    borderRadius: 25,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: GOLD,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#fff',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: GOLD,
  },
  vespaImage: {
    width: '100%',
    height: 200,
  },
  noImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardContent: {
    padding: 16,
  },
  vespaName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
    zIndex: 10,
  },
  vespaYear: {
    fontSize: 13,
    color: '#ccc',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
  },
  infoItem: {
    marginRight: 20,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: GOLD,
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: '#aaa',
    lineHeight: 20,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  featureContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureBadge: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GOLD,
  },
  featureText: {
    fontSize: 11,
    color: GOLD,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    marginTop: 15,
  },
});