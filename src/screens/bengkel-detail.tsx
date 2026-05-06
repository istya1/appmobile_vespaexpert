import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import BengkelService from '../services/bengkel';

const { width } = Dimensions.get('window');

const PRIMARY = '#4A90E2';
const BACKGROUND = '#F9FAFB';
const CARD = '#FFFFFF';
const BORDER = '#E5E7EB';
const TEXT = '#111827';
const SUBTEXT = '#6B7280';

type RootStackParamList = {
  BengkelDetail: { bengkelId: number | string };
};

type BengkelDetailRouteProp = RouteProp<RootStackParamList, 'BengkelDetail'>;

interface BengkelData {
  id: number | string;
  nama: string;
  rating?: string | number;
  alamat: string;
  telepon: string;
  situs?: string;
  jam_operasional: string;
  deskripsi: string;
  gambar_url?: string;
  latitude: number;
  longitude: number;
  // Tambahan kalau ada di database
  rating_count?: number;
}

export default function BengkelDetailScreen() {
  const route = useRoute<BengkelDetailRouteProp>();
  const { bengkelId } = route.params;

  const [bengkel, setBengkel] = useState<BengkelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBengkelDetail();
  }, [bengkelId]);

 const fetchBengkelDetail = async () => {
  try {
    setLoading(true);

    const data = await BengkelService.getById(Number(bengkelId));
    setBengkel(data); // ⬅️ langsung data (karena sudah return response.data)

  } catch (error) {
    console.error('Gagal mengambil detail bengkel:', error);
  } finally {
    setLoading(false);
  }
};

  if (loading || !bengkel) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Memuat detail bengkel...</Text>
      </View>
    );
  }

  // === Buat Google Maps Embed yang DINAMIS ===
  const MAP_HTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body, html { margin:0; padding:0; height:100%; overflow:hidden; }
          iframe { width:100%; height:100%; border:none; }
        </style>
      </head>
      <body>
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.4!2d${bengkel.longitude}!3d${bengkel.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${bengkel.latitude}%2C${bengkel.longitude}!5e0!3m2!1sid!2sid"
          allowfullscreen 
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </body>
    </html>
  `;

  const WA_NUMBER = bengkel.telepon.replace(/\D/g, '');
  const MAPS_DIRECTION = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(bengkel.alamat)}`;
  const MAPS_LINK = `https://maps.app.goo.gl/?q=${bengkel.latitude},${bengkel.longitude}`;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{bengkel.nama}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>★ {bengkel.rating || '4.8'}</Text>
            {bengkel.rating_count && (
              <Text style={styles.ulasan}> - {bengkel.rating_count} ulasan</Text>
            )}
          </View>
          <Text style={styles.resmi}>Bengkel Resmi Vespa</Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.buttonPhone}
            onPress={() => Linking.openURL(`tel:${bengkel.telepon}`)}
          >
            <MaterialIcons name="phone" size={20} color="#000" />
            <Text style={styles.buttonText}>Telepon</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonMap}
            onPress={() => Linking.openURL(MAPS_DIRECTION)}
          >
            <MaterialIcons name="directions" size={20} color={PRIMARY} />
            <Text style={[styles.buttonText, { color: PRIMARY }]}>Petunjuk Arah</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Peta Dinamis */}
      <TouchableOpacity activeOpacity={0.9} onPress={() => Linking.openURL(MAPS_LINK)}>
        <View style={styles.mapContainer}>
          <WebView
            source={{ html: MAP_HTML }}
            style={styles.map}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scrollEnabled={false}
            onError={(e) => console.warn('WebView Error:', e.nativeEvent)}
          />
        </View>
      </TouchableOpacity>

      {/* Tentang Bengkel */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tentang Bengkel</Text>
       <Text style={styles.sectionText}>{bengkel.deskripsi}</Text>
      </View>

      {/* Layanan (bisa dibuat dinamis nanti) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Layanan</Text>
        <View style={styles.layananGrid}>
          <LayananItem icon="wrench" title="Service Berkala" />
          <LayananItem icon="shield-check" title="Perbaikan" />
          <LayananItem icon="headphones" title="Konsultasi Gratis" />
          <LayananItem icon="phone-alert" title="Emergency 24/7" />
        </View>
      </View>

      {/* Informasi Kontak */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Kontak</Text>
        <KontakItem icon="map-marker" title="Alamat" value={bengkel.alamat} />
        <KontakItem 
          icon="phone" 
          title="Telepon" 
          value={bengkel.telepon} 
          onPress={() => Linking.openURL(`tel:${bengkel.telepon}`)} 
        />
        <KontakItem 
          icon="clock" 
          title="Jam Operasional" 
          value={bengkel.jam_operasional} 
        />
        {bengkel.situs && (
          <KontakItem 
            icon="web" 
            title="Situs Web" 
            value={bengkel.situs} 
            onPress={() => Linking.openURL(`https://${bengkel.situs}`)} 
          />
        )}
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

// Komponen Pembantu
const LayananItem = ({ icon, title }: { icon: string; title: string }) => (
  <View style={styles.layananItem}>
    <MaterialCommunityIcons name={icon as any} size={32} color={PRIMARY} />
    <Text style={styles.layananText}>{title}</Text>
  </View>
);

const KontakItem = ({
  icon,
  title,
  value,
  onPress,
}: {
  icon: string;
  title: string;
  value: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.kontakItem} onPress={onPress} disabled={!onPress}>
    <MaterialCommunityIcons name={icon as any} size={24} color={PRIMARY} />
    <View style={styles.kontakTextContainer}>
      <Text style={styles.kontakTitle}>{title}</Text>
      <Text style={styles.kontakValue}>{value}</Text>
    </View>
  </TouchableOpacity>
);

// Styles (sama seperti template kamu sebelumnya)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND,
  },
  loadingText: {
    color: SUBTEXT,
    marginTop: 10,
  },
 header: {
  backgroundColor: CARD,
  paddingTop: 30,
  paddingHorizontal: 20,
  paddingBottom: 20,
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
  borderBottomWidth: 1,
  borderBottomColor: BORDER,
},

  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: TEXT,
    fontSize: 22,
    fontWeight: '700',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  rating: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: '700',
  },
  ulasan: {
    color: SUBTEXT,
    fontSize: 12,
  },
  resmi: {
    color: SUBTEXT,
    fontSize: 12,
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 15,
  },
  buttonPhone: {
    flexDirection: 'row',
    backgroundColor: PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    alignItems: 'center',
    gap: 8,
  },
  buttonMap: {
    flexDirection: 'row',
    backgroundColor: BACKGROUND,
    borderWidth: 1,
    borderColor: PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mapContainer: {
    marginTop: 25,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    height: width * 0.55,
  },
  map: {
    width: '100%',
    height: '100%',
  },
 section: {
  backgroundColor: CARD,
  marginHorizontal: 20,
  marginTop: 20,
  padding: 20,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: BORDER,
},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  sectionText: {
    color: SUBTEXT,
    lineHeight: 22,
  },
  layananGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  layananItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  layananText: {
    marginTop: 8,
    textAlign: 'center',
    color: SUBTEXT,
    fontSize: 12,
  },
  kontakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  kontakTextContainer: { flex: 1 },
  kontakTitle: {
    fontWeight: '600',
    color: TEXT,
  },
  kontakValue: {
    color: SUBTEXT,
    marginTop: 2,
    fontSize: 12,
  },
});

