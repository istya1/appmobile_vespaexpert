import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { simpanRiwayatDiagnosis } from '../services/api';
import { HasilDiagnosisFinal, AturanKandidat } from '../services/api';

const PRIMARY = '#4A90E2';
const BACKGROUND = '#F9FAFB';
const CARD = '#FFFFFF';
const BORDER = '#E5E7EB';
const TEXT = '#111827';
const SUBTEXT = '#6B7280';

const HasilDiagnosis = () => {
  const route = useRoute<RouteProp<any>>();
  const navigation = useNavigation<any>();
  const hasil = route.params?.hasil;

  const [menyimpan, setMenyimpan] = useState<boolean>(false);
  const [sudahDisimpan, setSudahDisimpan] = useState<boolean>(false);

  // ✅ FIX TYPE
  const getPrioritasColor = (prioritas: string) => {
    if (prioritas === 'Tinggi') return '#FF4C4C';
    if (prioritas === 'Sedang') return '#FFC107';
    return '#4CAF50';
  };

  const hasilDiagnosis: HasilDiagnosisFinal[] = hasil?.hasil_diagnosis || [];
  const kemungkinanKerusakan: AturanKandidat[] = hasil?.kemungkinan_kerusakan || [];

  useEffect(() => {
    if (hasil && !sudahDisimpan) {
      simpanOtomatis();
    }
  }, []);

  const simpanOtomatis = async (): Promise<void> => {
    setMenyimpan(true);
    try {
      await simpanRiwayatDiagnosis({
        jenis_motor: hasil.jenis_motor,
        gejala_terpilih: hasil.gejala_dipilih ?? [],
        hasil_diagnosis: hasilDiagnosis as any,
      });
      setSudahDisimpan(true);
    } catch (error) {
      console.warn('Gagal menyimpan riwayat:', error);
    } finally {
      setMenyimpan(false);
    }
  };

  if (!hasil) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Tidak ada data diagnosis.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Hasil Diagnosis</Text>
        <Text style={styles.subtitle}>{hasil.jenis_motor}</Text>

        {menyimpan && (
          <View style={styles.savingBadge}>
            <ActivityIndicator size="small" color="#D4AF37" />
            <Text style={styles.savingText}>Menyimpan riwayat...</Text>
          </View>
        )}
        {sudahDisimpan && !menyimpan && (
          <View style={styles.savedBadge}>
            <Text style={styles.savedText}>✓ Tersimpan ke riwayat</Text>
          </View>
        )}
      </View>

      {/* ✅ Diagnosis Final */}
      {hasilDiagnosis.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>✅ Diagnosis Ditemukan</Text>
          {hasilDiagnosis.map((item: HasilDiagnosisFinal, index: number) => (
            <View key={index} style={styles.cardFinal}>
              <View style={styles.cardTopRow}>
                <Text style={styles.kode}>{item.kode_kerusakan}</Text>

                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {/* 🔥 PRIORITAS */}
                  <View style={{
                    backgroundColor: getPrioritasColor((item as any).prioritas ?? 'Rendah'),
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 20
                  }}>
                    <Text style={{ color: '#000', fontSize: 11, fontWeight: 'bold' }}>
                      {(item as any).prioritas ?? 'Rendah'}
                    </Text>
                  </View>

                  {/* Persentase */}
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchBadgeText}>
                      {item.persentase_kecocokan}% cocok
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.nama}>{item.nama_kerusakan}</Text>

              {/* 🔥 Total Bobot */}
              <Text style={{ color: '#888', fontSize: 12 }}>
                Total Bobot: {(item as any).total_bobot ?? 0}
              </Text>

              {item.solusi && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.solusiTitle}>Solusi</Text>
                  <Text style={styles.solusi}>{item.solusi}</Text>
                </>
              )}
            </View>
          ))}
        </>
      ) : (
        <View style={styles.noResultBox}>
          <Text style={styles.noResultText}>Tidak ditemukan kerusakan yang sesuai.</Text>
        </View>
      )}

      {/* ⚖️ Kemungkinan Kerusakan */}
      {kemungkinanKerusakan.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>⚖️ Kemungkinan Kerusakan</Text>
          <Text style={styles.sectionHint}>Cocok sebagian — perlu konfirmasi gejala tambahan</Text>

          {kemungkinanKerusakan.map((item: AturanKandidat, index: number) => (
            <View key={index} style={styles.cardKandidat}>
              <View style={styles.cardTopRow}>
                <Text style={styles.kodeKandidat}>{item.kode_kerusakan}</Text>

                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {/* 🔥 PRIORITAS */}
                  <View style={{
                    borderWidth: 1,
                    borderColor: getPrioritasColor((item as any).prioritas ?? 'Rendah'),
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 20
                  }}>
                    <Text style={{
                      color: getPrioritasColor((item as any).prioritas ?? 'Rendah'),
                      fontSize: 11,
                      fontWeight: 'bold'
                    }}>
                      {(item as any).prioritas ?? 'Rendah'}
                    </Text>
                  </View>

                  <View style={styles.matchBadgeKandidat}>
                    <Text style={styles.matchBadgeTextKandidat}>
                      {item.kecocokan.persentase}%
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.namaKandidat}>{item.nama_kerusakan}</Text>

              {/* 🔥 Total Bobot */}
              <Text style={{ color: '#666', fontSize: 12 }}>
                Total Bobot: {(item as any).total_bobot ?? 0}
              </Text>

              <Text style={styles.progressText}>
                {item.kecocokan.sudah_cocok}/{item.kecocokan.total_rule} gejala cocok
                {' · '}{item.kecocokan.sisa_konfirmasi} gejala belum dikonfirmasi
              </Text>
            </View>
          ))}
        </>
      )}

      <TouchableOpacity
        style={styles.riwayatButton}
        onPress={() => navigation.navigate('RiwayatDiagnosis')}
      >
        <Text style={styles.riwayatButtonText}>📋 Lihat Semua Riwayat</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

export default HasilDiagnosis;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND  },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BACKGROUND },
  emptyText: { color: '#666666', fontSize: 15 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: TEXT, letterSpacing: 1 },
  subtitle: { fontSize: 14, color: PRIMARY, marginTop: 4, letterSpacing: 0.5 },
  savingBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  savingText: { color: SUBTEXT , fontSize: 12 },
  savedBadge: { marginTop: 8 },
  savedText: { color: PRIMARY, fontSize: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: SUBTEXT, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginTop: 8 },
  sectionHint: { fontSize: 12, color: SUBTEXT, marginBottom: 12, marginTop: -8 },
 cardFinal: {
  backgroundColor: CARD,
  borderRadius: 14,
  padding: 18,
  marginBottom: 14,
  borderWidth: 1,
  borderColor: PRIMARY,
},

  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  kode: { color: PRIMARY, fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
  matchBadge: { backgroundColor: PRIMARY, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  matchBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  nama: { fontSize: 17, fontWeight: '600', color: TEXT, marginBottom: 4 },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 12 },
  solusiTitle: { fontSize: 12, color: '#888888', fontWeight: '600', letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' },
  solusi: { fontSize: 14, color: SUBTEXT, lineHeight: 22 },
  noResultBox: { backgroundColor: CARD, borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 20, borderColor: BORDER },
  noResultText: { color: SUBTEXT, fontSize: 15, textAlign: 'center' },
  cardKandidat: { backgroundColor: CARD, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: BORDER, borderLeftWidth: 3, borderLeftColor: PRIMARY },
  kodeKandidat: { color: SUBTEXT, fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  matchBadgeKandidat: { borderWidth: 1, borderColor: PRIMARY, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  matchBadgeTextKandidat: { color: PRIMARY, fontSize: 12, fontWeight: '600' },
  namaKandidat: { fontSize: 15, fontWeight: '600', color: TEXT, marginBottom: 6 },
  progressText: { fontSize: 12, color: '#555555', marginBottom: 10 },
  gejalaBelumLabel: { fontSize: 12, color: '#666666', marginBottom: 6 },
  gejalaBelumItem: { fontSize: 13, color: '#888888', marginBottom: 3, paddingLeft: 4 },
  riwayatButton: { marginTop: 24, backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#333333' },
  riwayatButtonText: { color: '#fff', fontWeight: '600', fontSize: 14, letterSpacing: 0.5 },
});