import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { simpanRiwayatDiagnosis } from '../services/api';
import { HasilDiagnosisFinal, AturanKandidat } from '../services/api';

const HasilDiagnosis = () => {
  const route      = useRoute<RouteProp<any>>();
  const navigation = useNavigation<any>();
  const hasil      = route.params?.hasil;

  const [menyimpan, setMenyimpan] = useState<boolean>(false);
  const [sudahDisimpan, setSudahDisimpan] = useState<boolean>(false);

  const hasilDiagnosis: HasilDiagnosisFinal[] = hasil?.hasil_diagnosis       || [];
  const kemungkinanKerusakan: AturanKandidat[] = hasil?.kemungkinan_kerusakan || [];

  // ── Simpan otomatis saat screen dibuka ──────────────────────────────
  useEffect(() => {
    if (hasil && !sudahDisimpan) {
      simpanOtomatis();
    }
  }, []);

  const simpanOtomatis = async (): Promise<void> => {
    setMenyimpan(true);
    try {
      await simpanRiwayatDiagnosis({
        jenis_motor:     hasil.jenis_motor,
        gejala_terpilih: hasil.gejala_dipilih ?? [],
        hasil_diagnosis: hasilDiagnosis as any,
      });
      setSudahDisimpan(true);
    } catch (error) {
      // Gagal simpan tidak perlu ganggu user, cukup log
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

        {/* Indikator simpan */}
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

      {/* ✅ CASE A: Diagnosis Final */}
      {hasilDiagnosis.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>✅ Diagnosis Ditemukan</Text>
          {hasilDiagnosis.map((item: HasilDiagnosisFinal, index: number) => (
            <View key={index} style={styles.cardFinal}>
              <View style={styles.cardTopRow}>
                <Text style={styles.kode}>{item.kode_kerusakan}</Text>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchBadgeText}>{item.persentase_kecocokan}% cocok</Text>
                </View>
              </View>
              <Text style={styles.nama}>{item.nama_kerusakan}</Text>
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

      {/* ⚖️ CASE B: Kemungkinan Kerusakan */}
      {kemungkinanKerusakan.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>⚖️ Kemungkinan Kerusakan</Text>
          <Text style={styles.sectionHint}>Cocok sebagian — perlu konfirmasi gejala tambahan</Text>
          {kemungkinanKerusakan.map((item: AturanKandidat, index: number) => (
            <View key={index} style={styles.cardKandidat}>
              <View style={styles.cardTopRow}>
                <Text style={styles.kodeKandidat}>{item.kode_kerusakan}</Text>
                <View style={styles.matchBadgeKandidat}>
                  <Text style={styles.matchBadgeTextKandidat}>{item.kecocokan.persentase}%</Text>
                </View>
              </View>
              <Text style={styles.namaKandidat}>{item.nama_kerusakan}</Text>
              <Text style={styles.progressText}>
                {item.kecocokan.sudah_cocok}/{item.kecocokan.total_rule} gejala cocok
                {' · '}{item.kecocokan.sisa_konfirmasi} gejala belum dikonfirmasi
              </Text>
              {item.gejala.perlu_dikonfirmasi.length > 0 && (
                <>
                  <Text style={styles.gejalaBelumLabel}>Gejala belum dikonfirmasi:</Text>
                  {item.gejala.perlu_dikonfirmasi.map(g => (
                    <Text key={g.kode_gejala} style={styles.gejalaBelumItem}>
                      • {g.nama_gejala}
                    </Text>
                  ))}
                </>
              )}
            </View>
          ))}
        </>
      )}

      {/* Tombol ke Riwayat */}
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
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' },
  emptyText: { color: '#666666', fontSize: 15 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: '#D4AF37', marginTop: 4, letterSpacing: 0.5 },
  savingBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  savingText: { color: '#888888', fontSize: 12 },
  savedBadge: { marginTop: 8 },
  savedText: { color: '#4CAF50', fontSize: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#999999', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginTop: 8 },
  sectionHint: { fontSize: 12, color: '#555555', marginBottom: 12, marginTop: -8 },
  cardFinal: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#D4AF37' },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  kode: { color: '#D4AF37', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
  matchBadge: { backgroundColor: '#D4AF37', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  matchBadgeText: { color: '#000000', fontWeight: 'bold', fontSize: 12 },
  nama: { fontSize: 17, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  divider: { height: 1, backgroundColor: '#2A2A2A', marginVertical: 12 },
  solusiTitle: { fontSize: 12, color: '#888888', fontWeight: '600', letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' },
  solusi: { fontSize: 14, color: '#CCCCCC', lineHeight: 22 },
  noResultBox: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 20 },
  noResultText: { color: '#666666', fontSize: 15, textAlign: 'center' },
  cardKandidat: { backgroundColor: '#111111', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A2A', borderLeftWidth: 3, borderLeftColor: '#D4AF3780' },
  kodeKandidat: { color: '#888888', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  matchBadgeKandidat: { borderWidth: 1, borderColor: '#D4AF37', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  matchBadgeTextKandidat: { color: '#D4AF37', fontSize: 12, fontWeight: '600' },
  namaKandidat: { fontSize: 15, fontWeight: '600', color: '#AAAAAA', marginBottom: 6 },
  progressText: { fontSize: 12, color: '#555555', marginBottom: 10 },
  gejalaBelumLabel: { fontSize: 12, color: '#666666', marginBottom: 6 },
  gejalaBelumItem: { fontSize: 13, color: '#888888', marginBottom: 3, paddingLeft: 4 },
  riwayatButton: { marginTop: 24, backgroundColor: '#1A1A1A', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#333333' },
  riwayatButtonText: { color: '#D4AF37', fontWeight: '600', fontSize: 14, letterSpacing: 0.5 },
});