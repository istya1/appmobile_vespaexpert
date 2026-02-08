import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Dimensions,
  Image,
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

// Data bengkel
const BENGKEL_NAME = 'Vespa Smart Madiun';
const RATING = '4.8';
const ALAMAT = 'Jl. Mayjen Sungkono No.4, Nambangan Lor, Kec. Manguharjo, Kota Madiun, Jawa Timur 63133';
const TELEPON = '03514108080';
const SITUS = 'smartvespa.com';
const JAM_OPERASIONAL = 'Senin - Jumat: 08:00 - 17:00\nSabtu: 08:00 - 15:00\nMinggu: Tutup';

const WA_NUMBER = TELEPON.replace(/\D/g, '');
const WA_URL = `https://wa.me/${WA_NUMBER}`;

// Link untuk buka Maps asli saat klik peta
const MAPS_LINK = 'https://maps.app.goo.gl/W28AiVhFCLBKpNus5';

// Link untuk petunjuk arah (navigation)
const MAPS_DIRECTION = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ALAMAT)}`;

// HTML untuk embed peta (ini yang membuat iframe bekerja)
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
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.4080580287236!2d111.5165253!3d-7.639190999999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e79bf2f5026d087%3A0xd6956e29644e10fc!2sVespa%20Smart%20Madiun!5e0!3m2!1sid!2sid!4v1770361549461!5m2!1sid!2sid"
      allowfullscreen 
      loading="lazy" 
      referrerpolicy="no-referrer-when-downgrade">
    </iframe>
  </body>
</html>
`;

// Warna icon biru
const ICON_COLOR = '#1E40AF';

export default function BengkelScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Biru */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{BENGKEL_NAME}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>★ {RATING}</Text>
            <Text style={styles.ulasan}> - ulasan</Text>
          </View>
          <Text style={styles.resmi}>Bengkel Resmi Vespa Madiun</Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.buttonPhone}
            onPress={() => Linking.openURL(`tel:${TELEPON}`)}
          >
            <MaterialIcons name="phone" size={20} color={ICON_COLOR} />
            <Text style={styles.buttonText}>Telepon</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonMap}
            onPress={() => Linking.openURL(MAPS_DIRECTION)}
          >
            <MaterialIcons name="directions" size={20} color={ICON_COLOR} />
            <Text style={[styles.buttonText, { color: ICON_COLOR }]}>Petunjuk Arah</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Peta */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => Linking.openURL(MAPS_LINK)}
      >
        <View style={styles.mapContainer}>
          <WebView
            source={{ html: MAP_HTML }}
            style={styles.map}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            scrollEnabled={false}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView Maps Error:', nativeEvent);
            }}
            onLoadEnd={() => console.log('Peta Vespa Smart Madiun berhasil dimuat')}
          />
        </View>
      </TouchableOpacity>

      {/* Tentang Bengkel */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tentang Bengkel</Text>
        <Text style={styles.sectionText}>
          Vespa Smart Madiun adalah bengkel resmi Vespa yang berlokasi di Madiun, Jawa Timur. Kami berkomitmen memberikan layanan terbaik kepada seluruh pemilik Vespa dengan standar kualitas internasional.
        </Text>
        <View style={styles.keunggulanContainer}>
          <KeunggulanItem
            icon="shield-check"
            text="Resmi & Terpercaya"
            detail="Bengkel authorized dengan garansi resmi"
          />
          <KeunggulanItem
            icon="certificate-outline"
            text="Teknisi Bersertifikat"
            detail="Tim ahli yang terlatih dan profesional"
          />
          <KeunggulanItem
            icon="cog"
            text="Suku Cadang Original"
            detail="100% parts original Piaggio"
          />
        </View>
      </View>

      {/* Layanan */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Layanan</Text>
        <View style={styles.layananGrid}>
          <LayananItem icon="wrench" title="Service Berkala" />
          <LayananItem icon="shield-check" title="Perbaikan" />
          <LayananItem icon="headphones" title="Konsultasi Gratis" />
          <LayananItem icon="phone-alert" title="Emergency 24/7" />
        </View>
      </View>

      {/* Galeri */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Galeri</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Image source={require('../../assets/vespasmart1.png')} style={styles.galleryImage} />
          <Image source={require('../../assets/vespasmart2.png')} style={styles.galleryImage} />
          <Image source={require('../../assets/vespasmart3.png')} style={styles.galleryImage} />
        </ScrollView>
      </View>

      {/* Informasi Kontak */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Kontak</Text>
        <KontakItem icon="map-marker" title="Alamat" value={ALAMAT} />
        <KontakItem
          icon="phone"
          title="Telepon"
          value={TELEPON}
          onPress={() => Linking.openURL(`tel:${TELEPON}`)}
        />
        <KontakItem icon="clock" title="Jam Operasional" value={JAM_OPERASIONAL} />
        <KontakItem
          icon="web"
          title="Situs Web"
          value={SITUS}
          onPress={() => Linking.openURL(`https://${SITUS}`)}
        />
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

// Komponen Pembantu (tetap sama)
const KeunggulanItem = ({
  icon,
  text,
  detail,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  text: string;
  detail: string;
}) => (
  <View style={styles.keunggulanItem}>
    <MaterialCommunityIcons name={icon} size={28} color={ICON_COLOR} />
    <View style={styles.keunggulanTextContainer}>
      <Text style={styles.keunggulanTitle}>{text}</Text>
      <Text style={styles.keunggulanDetail}>{detail}</Text>
    </View>
  </View>
);

const LayananItem = ({
  icon,
  title,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
}) => (
  <View style={styles.layananItem}>
    <MaterialCommunityIcons name={icon} size={32} color={ICON_COLOR} />
    <Text style={styles.layananText}>{title}</Text>
  </View>
);

const KontakItem = ({
  icon,
  title,
  value,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  value: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.kontakItem} onPress={onPress} disabled={!onPress}>
    <MaterialCommunityIcons name={icon} size={24} color={ICON_COLOR} />
    <View style={styles.kontakTextContainer}>
      <Text style={styles.kontakTitle}>{title}</Text>
      <Text style={styles.kontakValue}>{value}</Text>
    </View>
  </TouchableOpacity>
);

// Styles (sudah sesuai)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#1E40AF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: { alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  rating: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
  ulasan: { color: '#E0E0E0', fontSize: 14 },
  resmi: { color: '#fff', fontSize: 14, marginTop: 4 },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 20,
  },
  buttonPhone: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    gap: 8,
  },
  buttonMap: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    gap: 8,
  },
  buttonText: { fontWeight: '600', color: ICON_COLOR },
  mapContainer: {
    marginTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    height: width * 0.55,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionText: {
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  keunggulanContainer: { gap: 16 },
  keunggulanItem: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  keunggulanTextContainer: { flex: 1 },
  keunggulanTitle: { fontWeight: '600', color: '#1F2937' },
  keunggulanDetail: { color: '#6B7280', fontSize: 13 },
  layananGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  layananItem: { width: '48%', alignItems: 'center', marginBottom: 16 },
  layananText: { marginTop: 8, textAlign: 'center', color: '#374151', fontSize: 13 },
  galleryImage: {
    width: width * 0.65,
    height: 160,
    borderRadius: 12,
    marginRight: 12,
  },
  kontakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  kontakTextContainer: { flex: 1 },
  kontakTitle: { fontWeight: '600', color: '#1F2937' },
  kontakValue: { color: '#4B5563', marginTop: 2 },
});