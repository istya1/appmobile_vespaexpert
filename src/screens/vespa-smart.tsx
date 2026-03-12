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
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getVespaSmartData, prosesDiagnosis, AturanKandidat } from '../services/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DiagnosaService from '../services/diagnosa';
import { Feather } from '@expo/vector-icons';

const GOLD = '#D4AF37';
const DARK_BG = '#0A0A0A';
const CARD_BG = '#1A1A1A';
const BORDER = '#333333';

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

// List motor dengan icon
const MOTOR_OPTIONS = [
  { label: 'Sprint 150', value: 'Sprint 150', icon: 'scooter' as const },
  { label: 'Sprint S 150', value: 'Sprint S 150', icon: 'scooter' as const },
  { label: 'LX 125', value: 'LX 125', icon: 'scooter' as const },
  { label: 'Primavera 150', value: 'Primavera 150', icon: 'scooter' as const },
  { label: 'Primavera S 150', value: 'Primavera S 150', icon: 'scooter' as const },
];

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
  const [showMotorModal, setShowMotorModal] = useState<boolean>(false);
  const [pendingNavData, setPendingNavData] = useState<any>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (jenisMotor) {
      loadGejalaData();
    }
    // Reset saat ganti motor
    setGejalaTerpilih([]);
    setKandidatList([]);
    setShowKonfirmasiModal(false);
    setPendingNavData(null);
  }, [jenisMotor]);

  // Animasi fade saat modal muncul
  useEffect(() => {
    if (showMotorModal) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showMotorModal]);

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
        Alert.alert('Error', 'Gagal memuat data gejala');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const toggleGejala = (kodeGejala: string): void => {
    setGejalaTerpilih((prev) =>
      prev.includes(kodeGejala)
        ? prev.filter((k) => k !== kodeGejala)
        : [...prev, kodeGejala]
    );
  };

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
      if (!response.hasil_diagnosis && !response.kemungkinan_kerusakan) {
        Alert.alert('Error', 'Data diagnosis tidak valid.');
        return;
      }

      // Simpan riwayat
      try {
        await DiagnosaService.simpanDiagnosisMobile({
          jenis_motor: jenisMotor,
          gejala_terpilih: gejalaTerpilih,
          hasil_diagnosis: response.hasil_diagnosis || [],
          kemungkinan_kerusakan: response.kemungkinan_kerusakan || [],
        });
        console.log('✅ Riwayat berhasil disimpan ke /mobile/diagnosa');
      } catch (saveError: any) {
        console.error('❌ Gagal simpan riwayat:', saveError.response?.data || saveError.message);
        Alert.alert('Peringatan', 'Hasil diagnosis berhasil, tapi riwayat gagal disimpan.');
      }

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
    } catch (error) {
      Alert.alert('Error', 'Gagal memproses diagnosis.');
    } finally {
      setLoading(false);
    }
  };

  const handleLihatHasil = (): void => {
    setShowKonfirmasiModal(false);
    if (pendingNavData) {
      navigation.navigate('HasilDiagnosis', { hasil: pendingNavData });
    }
  };

  const handleDiagnosisUlang = async (): Promise<void> => {
    setShowKonfirmasiModal(false);
    await handleDiagnosis();
  };

  const selectMotor = (value: string) => {
    setJenisMotor(value);
    setShowMotorModal(false);
  };

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

  const renderMotorItem = ({ item }: { item: typeof MOTOR_OPTIONS[0] }) => (
    <TouchableOpacity
      style={[
        styles.motorItem,
        jenisMotor === item.value && styles.motorItemSelected,
      ]}
      onPress={() => selectMotor(item.value)}
    >
      <MaterialCommunityIcons name={item.icon} size={28} color={GOLD} style={styles.motorIcon} />
      <Text style={styles.motorText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#c9a227" />
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>Vespa Smart</Text>
          <Text style={styles.subtitle}>Diagnosis Kerusakan Vespa</Text>
        </View>
      </View>

      {/* Pilih Jenis Motor (Tombol buka modal) */}
      <View style={styles.pickerWrapper}>
        <Text style={styles.pickerLabel}>Pilih Tipe Vespa Anda</Text>
        <TouchableOpacity style={styles.customPicker} onPress={() => setShowMotorModal(true)}>
          <Text style={styles.pickerText}>
            {jenisMotor || 'Pilih Tipe Vespa'}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={24} color={GOLD} />
        </TouchableOpacity>
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
              <ActivityIndicator size="large" color={GOLD} />
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
                contentContainerStyle={styles.gejalaList}
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

      {/* Modal Pilih Tipe Vespa */}
      <Modal
        visible={showMotorModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMotorModal(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Tipe Vespa</Text>
            <FlatList
              data={MOTOR_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={renderMotorItem}
              showsVerticalScrollIndicator={false}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowMotorModal(false)}
            >
              <Text style={styles.modalCloseText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>

      {/* Modal Konfirmasi Gejala Tambahan (tetap seperti sebelumnya) */}
      <Modal
        visible={showKonfirmasiModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowKonfirmasiModal(false)}
      >
        {/* ... isi modal konfirmasi tetap sama seperti kode lama kamu ... */}
      </Modal>
    </View>
  );
};

// Styles (diperbarui supaya lebih mirip contoh ProfileScreen)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#aaa",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 40,
    padding: 4,
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
  customPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  diagnosisSection: {
    flex: 1,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: GOLD,
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
    paddingHorizontal: 20,
    paddingBottom: 100, // biar ga ketutup bottom actions
  },
  gejalaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  gejalaItemSelected: {
    backgroundColor: '#2A2415',
    borderColor: GOLD,
    shadowColor: GOLD,
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
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  checkmark: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: CARD_BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  selectedBadge: {
    backgroundColor: GOLD,
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
    backgroundColor: GOLD,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  // Modal Pilih Motor
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: GOLD,
    marginBottom: 16,
    textAlign: 'center',
  },
  motorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  motorItemSelected: {
    backgroundColor: '#2A2415',
  },
  motorIcon: {
    marginRight: 16,
  },
  motorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: '#333333',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VespaSmartScreen;