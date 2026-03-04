// screens/VespaSmartScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getVespaSmartData, prosesDiagnosis, AturanKandidat } from '../services/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DiagnosaService from '../services/diagnosa';

// ============================================
// TYPES
// ============================================

type RootStackParamList = {
  VespaSmart: undefined;
  HasilDiagnosis: { hasil: any };
};

type VespaSmartScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VespaSmart'>;

interface Props {
  navigation: VespaSmartScreenNavigationProp;
}

interface GejalaItem {
  kode_gejala: string;
  nama_gejala: string;
  jenis_motor: string;
  kategori: string;
  deskripsi?: string;
}

// ============================================
// COMPONENT
// ============================================

const VespaSmartScreen: React.FC<Props> = ({ navigation }) => {
  const [jenisMotor, setJenisMotor] = useState<string>('');
  const [gejalaList, setGejalaList] = useState<GejalaItem[]>([]);
  const [gejalaTerpilih, setGejalaTerpilih] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [kandidatList, setKandidatList] = useState<AturanKandidat[]>([]);
  const [showKonfirmasiModal, setShowKonfirmasiModal] = useState<boolean>(false);
  const [pendingNavData, setPendingNavData] = useState<any>(null);

  const jenisMotorOptions: string[] = [
    'Sprint 150',
    'Sprint S 150',
    'LX 125',
    'Primavera 150',
    'Primavera S 150',
  ];

  useEffect(() => {
    if (jenisMotor) {
      loadGejalaData();
    }

    // RESET SEMUA STATE SAAT GANTI MOTOR
    setGejalaTerpilih([]);
    setKandidatList([]);
    setShowKonfirmasiModal(false);
    setPendingNavData(null);

  }, [jenisMotor]);

  // ── LOAD DATA ────────────────────────────────────────────────────────
  const loadGejalaData = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await getVespaSmartData(jenisMotor);
      if (data.success) {
        const gejalaArray: GejalaItem[] = [];
        Object.keys(data.gejala_by_kategori).forEach((kategori: string) => {
          data.gejala_by_kategori[kategori].forEach((gejala: any) => {
            gejalaArray.push({ ...gejala, kategori });
          });
        });
        setGejalaList(gejalaArray);
        setGejalaTerpilih([]);
      } else {
        Alert.alert('Error', 'Gagal memuat data');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  // ── TOGGLE GEJALA ────────────────────────────────────────────────────
  const toggleGejala = (kodeGejala: string): void => {
    setGejalaTerpilih(prev =>
      prev.includes(kodeGejala)
        ? prev.filter(k => k !== kodeGejala)
        : [...prev, kodeGejala]
    );
  };

  // ── HANDLE DIAGNOSIS ─────────────────────────────────────────────────
  const handleDiagnosis = async (): Promise<void> => {
    if (!jenisMotor) {
      Alert.alert('Error', 'Pilih jenis motor terlebih dahulu.');
      return;
    }

    if (gejalaTerpilih.length === 0) {
      Alert.alert('Error', 'Pilih minimal satu gejala.');
      return;
    }

    try {
      setLoading(true);

      const response = await prosesDiagnosis(jenisMotor, gejalaTerpilih);

      if (!response?.success) {
        Alert.alert('Error', response?.message || 'Terjadi kesalahan.');
        return;
      }

      if (
        !response.hasil_diagnosis &&
        !response.kemungkinan_kerusakan
      ) {
        Alert.alert('Error', 'Data diagnosis tidak valid.');
        return;
      }

      if (response.success) {

  await DiagnosaService.simpanDiagnosisMobile({
    jenis_motor: jenisMotor,
    gejala_terpilih: gejalaTerpilih,
    hasil_diagnosis: response.hasil_diagnosis || [],
  });

  const navData = {
    jenis_motor: jenisMotor,
    gejala_dipilih: gejalaTerpilih,
    hasil_diagnosis: response.hasil_diagnosis || [],
    kemungkinan_kerusakan: response.kemungkinan_kerusakan || [],
  };

  if (navData.kemungkinan_kerusakan.length > 0) {
    setKandidatList(navData.kemungkinan_kerusakan);
    setPendingNavData(navData);
    setShowKonfirmasiModal(true);
  } else {
    navigation.navigate('HasilDiagnosis', { hasil: navData });
  }

  return;
}

      Alert.alert('Info', response.message);

    } catch (error) {
      Alert.alert('Error', 'Gagal memproses diagnosis.');
    } finally {
      setLoading(false);
    }
  };

  // ── MODAL: Lihat Hasil (tanpa diagnosis ulang) ───────────────────────
  const handleLihatHasil = (): void => {
    setShowKonfirmasiModal(false);
    if (pendingNavData) {
      navigation.navigate('HasilDiagnosis', { hasil: pendingNavData });
    }
  };

  // ── MODAL: Diagnosis Ulang (dengan gejala tambahan yg dipilih) ───────
  const handleDiagnosisUlang = async (): Promise<void> => {
    setShowKonfirmasiModal(false);
    await handleDiagnosis();
  };

  // ── RENDER ITEM ──────────────────────────────────────────────────────
  const renderGejalaItem = ({ item }: { item: GejalaItem }) => {
    const isSelected = gejalaTerpilih.includes(item.kode_gejala);
    return (
      <TouchableOpacity
        style={[styles.gejalaItem, isSelected && styles.gejalaItemSelected]}
        onPress={() => toggleGejala(item.kode_gejala)}
        activeOpacity={0.7}
      >
        <Text style={[styles.gejalaText, isSelected && styles.gejalaTextSelected]}>
          {item.nama_gejala}
        </Text>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  // ── RENDER ───────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>VESPA SMART</Text>
        <Text style={styles.headerSubtitle}>Smart Diagnosis System</Text>
      </View>

      {/* Picker Jenis Motor */}
      <View style={styles.pickerWrapper}>
        <Text style={styles.pickerLabel}>Pilih Tipe Vespa Anda</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={jenisMotor}
            onValueChange={(itemValue: string) => setJenisMotor(itemValue)}
            style={styles.picker}
            dropdownIconColor="#D4AF37"
          >
            <Picker.Item label="Pilih Tipe Vespa" value="" />
            {jenisMotorOptions.map((jenis: string) => (
              <Picker.Item key={jenis} label={jenis} value={jenis} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Diagnosis Section */}
      {jenisMotor ? (
        <View style={styles.diagnosisSection}>
          <Text style={styles.sectionTitle}>Pilih Gejala</Text>
          <Text style={styles.sectionSubtitle}>
            Centang gejala yang sesuai dengan kondisi kendaraan Anda
          </Text>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#D4AF37" />
              <Text style={styles.loadingText}>Memuat data...</Text>
            </View>
          ) : gejalaList.length > 0 ? (
            <>
              <FlatList
                data={gejalaList}
                renderItem={renderGejalaItem}
                keyExtractor={(item) => item.kode_gejala}
                extraData={gejalaTerpilih}
                showsVerticalScrollIndicator={false}
              />

              <View style={styles.bottomActions}>
                <View style={styles.selectedInfo}>
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>{gejalaTerpilih.length}</Text>
                  </View>
                  <Text style={styles.selectedText}>Gejala Terpilih</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.diagnosisButton,
                    (loading || gejalaTerpilih.length === 0) && styles.buttonDisabled,
                  ]}
                  onPress={handleDiagnosis}
                  disabled={loading || gejalaTerpilih.length === 0}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Memproses...' : 'Mulai Diagnosis'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tidak ada data gejala tersedia</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏍️</Text>
          <Text style={styles.emptyText}>Pilih tipe Vespa untuk memulai diagnosis</Text>
        </View>
      )}

      {/* Modal Konfirmasi Gejala Tambahan */}
      <Modal
        visible={showKonfirmasiModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowKonfirmasiModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Konfirmasi Gejala Tambahan</Text>
            <Text style={styles.modalSubtitle}>
              Apakah Anda mengalami gejala berikut? Centang jika ada, lalu tekan
              "Diagnosis Ulang". Atau tekan "Lihat Hasil" untuk langsung melihat hasil.
            </Text>

            <ScrollView style={{ maxHeight: 400 }}>
              {kandidatList.map((kandidat, idx) => (
                <View key={idx} style={styles.kandidatCard}>

                  {/* Header kandidat */}
                  <View style={styles.kandidatHeader}>
                    <Text style={styles.kandidatNama}>{kandidat.nama_kerusakan}</Text>
                    <View style={styles.persenBadge}>
                      <Text style={styles.persenBadgeText}>
                        {kandidat.kecocokan.persentase}%
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.kandidatProgress}>
                    {kandidat.kecocokan.sudah_cocok}/{kandidat.kecocokan.total_rule} gejala cocok
                  </Text>

                  <Text style={styles.konfirmasiLabel}>Apakah ada gejala berikut?</Text>

                  {kandidat.gejala.perlu_dikonfirmasi.map(
                    (g: AturanKandidat['gejala']['perlu_dikonfirmasi'][number]) => (
                      <TouchableOpacity
                        key={g.kode_gejala}
                        style={[
                          styles.konfirmasiGejalaItem,
                          gejalaTerpilih.includes(g.kode_gejala) && styles.konfirmasiGejalaSelected,
                        ]}
                        onPress={() => toggleGejala(g.kode_gejala)}
                      >
                        <View style={[
                          styles.checkboxSmall,
                          gejalaTerpilih.includes(g.kode_gejala) && styles.checkboxSmallSelected,
                        ]}>
                          {gejalaTerpilih.includes(g.kode_gejala) && (
                            <Text style={styles.checkmarkSmall}>✓</Text>
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.konfirmasiGejalaText}>{g.nama_gejala}</Text>
                          {g.deskripsi && (
                            <Text style={styles.konfirmasiGejalaDesc}>{g.deskripsi}</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Tombol modal */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonNo]}
                onPress={handleLihatHasil}        // ← langsung ke hasil
              >
                <Text style={styles.modalButtonTextDark}>Lihat Hasil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonYes]}
                onPress={handleDiagnosisUlang}    // ← hitung ulang + gejala baru
              >
                <Text style={styles.modalButtonText}>Diagnosis Ulang</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  headerSubtitle: {
    color: '#D4AF37',
    fontSize: 14,
    marginTop: 5,
    letterSpacing: 1,
  },
  pickerWrapper: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  pickerLabel: {
    color: '#999999',
    fontSize: 12,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  pickerContainer: {
    backgroundColor: '#111111',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  picker: {
    color: '#FFFFFF',
    height: 50,
  },
  diagnosisSection: {
    flex: 1,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  sectionSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: '#999999',
    marginBottom: 20,
    paddingHorizontal: 30,
    lineHeight: 18,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 15,
    color: '#999999',
    fontSize: 14,
  },
  gejalaList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gejalaListContent: {
    paddingBottom: 10,
  },
  gejalaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  gejalaItemSelected: {
    backgroundColor: '#2A2415',
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gejalaText: {
    flex: 1,
    fontSize: 15,
    color: '#CCCCCC',
    marginRight: 15,
    lineHeight: 22,
  },
  gejalaTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: '#555555',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  checkmark: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  selectedBadge: {
    backgroundColor: '#D4AF37',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectedBadgeText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 11,
  },
  selectedText: {
    color: '#999999',
    fontSize: 13,
  },
  diagnosisButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
  },
  buttonDisabled: {
    backgroundColor: '#333333',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  // ── Modal ────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#888888',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonYes: {
    backgroundColor: '#D4AF37',
  },
  modalButtonNo: {
    backgroundColor: '#555555',
  },
  modalButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalButtonTextDark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  // ── Kandidat Card (dalam modal) ──────────────────────────────────────
  kandidatCard: {
    backgroundColor: '#111111',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  kandidatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  kandidatNama: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  persenBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  persenBadgeText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  kandidatProgress: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 10,
  },
  konfirmasiLabel: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  konfirmasiGejalaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 6,
    backgroundColor: '#1A1A1A',
  },
  konfirmasiGejalaSelected: {
    borderColor: '#D4AF37',
    backgroundColor: '#2A2415',
  },
  checkboxSmall: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#555555',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  checkboxSmallSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  checkmarkSmall: {
    color: '#000',
    fontSize: 13,
    fontWeight: 'bold',
  },
  konfirmasiGejalaText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  konfirmasiGejalaDesc: {
    color: '#666666',
    fontSize: 12,
    marginTop: 2,
  },
});

export default VespaSmartScreen;