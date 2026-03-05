import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert, ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { getRiwayatDiagnosis, hapusRiwayatDiagnosis } from '../services/api';
import { Feather } from '@expo/vector-icons';
import DiagnosaService from '../services/diagnosa';

interface RiwayatItem {
  id?: number;
  id_diagnosa?: number;
  jenis_motor: string;
  created_at: string;
  hasil_diagnosis: {
    nama_kerusakan: string;
    kode_kerusakan: string;
    persentase_kecocokan: number;
  }[];
}

const RiwayatDiagnosisScreen = () => {
  const navigation = useNavigation<any>();
  const [riwayat, setRiwayat] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      loadRiwayat();
    }, [])
  );

  // ── Helper: ambil id yang tersedia ──────────────────────────────────
  const getId = (item: RiwayatItem): number =>
    item.id ?? item.id_diagnosa ?? 0;

  // ── Load Data ────────────────────────────────────────────────────────
  const loadRiwayat = async (isRefresh = false): Promise<void> => {
  if (isRefresh) setRefreshing(true);
  else setLoading(true);
  try {
    const data = await DiagnosaService.getRiwayatMobile();  // ← GANTI KE INI
    console.log('RIWAYAT RESPONSE:', JSON.stringify(data, null, 2));
    setRiwayat(data ?? []);  // karena getRiwayatMobile return array langsung (res.data.data || [])
  } catch (error) {
    Alert.alert('Error', 'Gagal memuat riwayat diagnosis.');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  // ── Hapus ────────────────────────────────────────────────────────────
  const konfirmasiHapus = (id: number): void => {
    Alert.alert(
      'Hapus Riwayat',
      'Yakin ingin menghapus riwayat ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => hapusItem(id) },
      ]
    );
  };

  const hapusItem = async (id: number): Promise<void> => {
    try {
      await DiagnosaService.hapusRiwayatDiagnosis(id);
      setRiwayat(prev => prev.filter(item => getId(item) !== id));
    } catch (error) {
      Alert.alert('Error', 'Gagal menghapus riwayat.');
    }
  };

  // ── Format Tanggal ───────────────────────────────────────────────────
  const formatTanggal = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

// ── Render Item ──────────────────────────────────────────────────────
const renderItem = ({ item }: { item: RiwayatItem }) => {
  const kerusakanUtama = item.hasil_diagnosis?.[0];

  return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DetailRiwayat', { riwayat: item })}
        activeOpacity={0.75}
      >
        {/* Baris atas: jenis motor + tombol hapus */}
        <View style={styles.cardTopRow}>
          <Text style={styles.jenisMotor}>{item.jenis_motor}</Text>
          <TouchableOpacity
            style={styles.hapusButton}
            onPress={() => konfirmasiHapus(getId(item))}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="trash-2" size={18} color="#555555" />
          </TouchableOpacity>
        </View>

        {/* Nama kerusakan utama */}
        {kerusakanUtama ? (
          <View style={styles.kerusakanRow}>
            <View style={styles.kodeBadge}>
              <Text style={styles.kodeText}>{kerusakanUtama.kode_kerusakan}</Text>
            </View>
            <Text style={styles.namaKerusakan} numberOfLines={1}>
              {kerusakanUtama.nama_kerusakan}
            </Text>
          </View>
        ) : (
          <Text style={styles.tidakDitemukan}>Tidak ada diagnosis final</Text>
        )}

        {/* Jika lebih dari 1 kerusakan */}
        {item.hasil_diagnosis?.length > 1 && (
          <Text style={styles.lebihBanyak}>
            +{item.hasil_diagnosis.length - 1} kerusakan lainnya
          </Text>
        )}

        {/* Tanggal */}
        <Text style={styles.tanggal}>{formatTanggal(item.created_at)}</Text>
      </TouchableOpacity>
    );
  };

  // ── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Memuat riwayat...</Text>
      </View>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>RIWAYAT</Text>
        <Text style={styles.headerSubtitle}>Diagnosis Sebelumnya</Text>
      </View>

      <FlatList
        data={riwayat}
        renderItem={renderItem}
        keyExtractor={(item, index) => (getId(item) || index).toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadRiwayat(true)}
            tintColor="#D4AF37"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Belum ada riwayat diagnosis</Text>
            <Text style={styles.emptySubtext}>
              Riwayat akan tersimpan otomatis setelah diagnosis
            </Text>
          </View>
        }
      />

    </View>
  );
};

export default RiwayatDiagnosisScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', letterSpacing: 2 },
  headerSubtitle: { color: '#D4AF37', fontSize: 14, marginTop: 5, letterSpacing: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' },
  loadingText: { marginTop: 12, color: '#999999', fontSize: 14 },
  listContent: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  jenisMotor: { color: '#D4AF37', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 },
  hapusButton: { padding: 4 },
  hapusText: { fontSize: 16 },
  kerusakanRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  kodeBadge: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  kodeText: { color: '#D4AF37', fontSize: 12, fontWeight: 'bold' },
  namaKerusakan: { color: '#FFFFFF', fontSize: 14, fontWeight: '500', flex: 1 },
  tidakDitemukan: { color: '#555555', fontSize: 13, fontStyle: 'italic', marginBottom: 6 },
  lebihBanyak: { color: '#888888', fontSize: 12, marginBottom: 6 },
  tanggal: { color: '#555555', fontSize: 11, marginTop: 6 },
  emptyContainer: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16, opacity: 0.4 },
  emptyText: { color: '#666666', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  emptySubtext: { color: '#444444', fontSize: 13, textAlign: 'center', lineHeight: 18 },
});