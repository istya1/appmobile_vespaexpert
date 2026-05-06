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
import { getVespaSmartData, prosesDiagnosis, AturanKandidat } from '../services/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DiagnosaService from '../services/diagnosa';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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

const PRIMARY    = '#4A90E2';
const BACKGROUND = '#F9FAFB';
const CARD       = '#FFFFFF';
const CARD_BG    = '#EAF4FF';
const BORDER     = '#E5E7EB';
const TEXT       = '#111827';
const SUBTEXT    = '#6B7280';

// ============================================
// MOTOR OPTIONS
// ============================================

const MOTOR_OPTIONS = [
  { label: 'Sprint 150',      value: 'Sprint 150' },
  { label: 'Sprint S 150',    value: 'Sprint S 150' },
  { label: 'LX 125',          value: 'LX 125' },
  { label: 'Primavera 150',   value: 'Primavera 150' },
  { label: 'Primavera S 150', value: 'Primavera S 150' },
];

// ============================================
// COMPONENT
// ============================================

const VespaSmartScreen: React.FC<Props> = ({ navigation }) => {
  const [jenisMotor, setJenisMotor]           = useState<string>('');
  const [gejalaList, setGejalaList]           = useState<GejalaItem[]>([]);
  const [gejalaTerpilih, setGejalaTerpilih]   = useState<string[]>([]);
  const [loading, setLoading]                 = useState<boolean>(false);
  const [kandidatList, setKandidatList]       = useState<AturanKandidat[]>([]);
  const [showKonfirmasiModal, setShowKonfirmasiModal] = useState<boolean>(false);
  const [pendingNavData, setPendingNavData]   = useState<any>(null);

  useEffect(() => {
    if (jenisMotor) loadGejalaData();
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
      if (!response.hasil_diagnosis && !response.kemungkinan_kerusakan) {
        Alert.alert('Error', 'Data diagnosis tidak valid.');
        return;
      }

      if (response.status_diagnosis === 'selesai') {
        const navData = {
          jenis_motor:            jenisMotor,
          gejala_dipilih:         gejalaTerpilih,
          hasil_diagnosis:        response.hasil_diagnosis || [],
          kemungkinan_kerusakan:  response.kemungkinan_kerusakan || [],
        };

        await DiagnosaService.simpanDiagnosisMobile({
          jenis_motor:      jenisMotor,
          gejala_terpilih:  gejalaTerpilih,
          hasil_diagnosis:  response.hasil_diagnosis || [],
        });

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
    } catch {
      Alert.alert('Error', 'Gagal memproses diagnosis.');
    } finally {
      setLoading(false);
    }
  };

  const handleLihatHasil = (): void => {
    setShowKonfirmasiModal(false);
    if (pendingNavData) navigation.navigate('HasilDiagnosis', { hasil: pendingNavData });
  };

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
          {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  // ── RENDER ───────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={PRIMARY} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>VESPA SMART</Text>
          <Text style={styles.headerSubtitle}>Deteksi Kerusakan Vespa Matic</Text>
        </View>
      </View>

      {/* ── Pilih Tipe Vespa ────────────────────────────────────────── */}
      <View style={styles.motorSection}>
        <Text style={styles.motorSectionLabel}>Pilih Tipe Vespa Anda</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.motorScrollContent}
        >
          {MOTOR_OPTIONS.map((motor) => {
            const isActive = jenisMotor === motor.value;
            return (
              <TouchableOpacity
                key={motor.value}
                style={[styles.motorChip, isActive && styles.motorChipActive]}
                onPress={() => setJenisMotor(motor.value)}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons
                  name="motorbike"
                  size={18}
                  color={isActive ? '#fff' : PRIMARY}
                />
                <Text style={[styles.motorChipText, isActive && styles.motorChipTextActive]}>
                  {motor.label}
                </Text>
                {isActive && (
                  <Ionicons name="checkmark-circle" size={14} color="#fff" style={{ marginLeft: 2 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Diagnosis Section ───────────────────────────────────────── */}
      {jenisMotor ? (
        <View style={styles.diagnosisSection}>
          <Text style={styles.sectionTitle}>Pilih Gejala</Text>
          <Text style={styles.sectionSubtitle}>
            Centang gejala yang sesuai dengan kondisi kendaraan Anda
          </Text>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={PRIMARY} />
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
                  <MaterialCommunityIcons name="stethoscope" size={18} color="#fff" />
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
          <MaterialCommunityIcons name="motorbike" size={56} color={BORDER} />
          <Text style={styles.emptyTitle}>Belum ada tipe dipilih</Text>
          <Text style={styles.emptyText}>Pilih tipe Vespa di atas untuk memulai diagnosis</Text>
        </View>
      )}

      {/* ── Modal Konfirmasi ─────────────────────────────────────────── */}
      <Modal
        visible={showKonfirmasiModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowKonfirmasiModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandleBar} />
            <Text style={styles.modalTitle}>Konfirmasi Gejala Tambahan</Text>
            <Text style={styles.modalSubtitle}>
              Apakah Anda mengalami gejala berikut? Centang jika ada, lalu tekan
              "Diagnosis Ulang". Atau tekan "Lihat Hasil" untuk langsung melihat hasil.
            </Text>

            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {kandidatList.map((kandidat, idx) => (
                <View key={idx} style={styles.kandidatCard}>
                  <View style={styles.kandidatHeader}>
                    <Text style={styles.kandidatNama}>{kandidat.nama_kerusakan}</Text>
                    <View style={styles.persenBadge}>
                      <Text style={styles.persenBadgeText}>{kandidat.kecocokan.persentase}%</Text>
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
                            <Ionicons name="checkmark" size={12} color="#fff" />
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

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonNo]} onPress={handleLihatHasil}>
                <Text style={styles.modalButtonTextDark}>Lihat Hasil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonYes]} onPress={handleDiagnosisUlang}>
                <MaterialCommunityIcons name="stethoscope" size={15} color="#fff" />
                <Text style={styles.modalButtonText}>Diagnosis Ulang</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default VespaSmartScreen;

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  // ── HEADER ──────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    paddingTop: 25,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: PRIMARY,
    fontSize: 12,
    marginTop: 2,
  },

  // ── MOTOR SELECTOR ───────────────────────────────────────────────────
  motorSection: {
    paddingTop: 20,
    paddingBottom: 4,
  },
  motorSectionLabel: {
    fontSize: 12,
    color: SUBTEXT,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  motorScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 4,
  },
  motorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  motorChipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  motorChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT,
  },
  motorChipTextActive: {
    color: '#fff',
  },

  // ── SECTION ──────────────────────────────────────────────────────────
  diagnosisSection: {
    flex: 1,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: SUBTEXT,
    marginBottom: 20,
    paddingHorizontal: 30,
  },

  // ── LOADING ───────────────────────────────────────────────────────────
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    color: SUBTEXT,
  },

  // ── LIST ITEM ─────────────────────────────────────────────────────────
  gejalaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  gejalaItemSelected: {
    borderColor: PRIMARY,
    backgroundColor: '#EFF6FF',
  },
  gejalaText: {
    flex: 1,
    fontSize: 14,
    color: TEXT,
  },
  gejalaTextSelected: {
    fontWeight: '600',
    color: PRIMARY,
  },

  // ── CHECKBOX ──────────────────────────────────────────────────────────
  checkbox: {
    width: 24, height: 24,
    borderWidth: 2, borderColor: BORDER,
    borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },

  // ── BOTTOM ACTION ─────────────────────────────────────────────────────
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: CARD,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  selectedInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedBadge: {
    backgroundColor: PRIMARY,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 6,
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  selectedText: {
    color: SUBTEXT,
    fontSize: 12,
  },
  diagnosisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },

  // ── EMPTY ─────────────────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    marginTop: 8,
  },
  emptyText: {
    color: SUBTEXT,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // ── MODAL ─────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: CARD,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  modalHandleBar: {
    width: 36, height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: TEXT,
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubtitle: {
    color: SUBTEXT,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },

  // ── KANDIDAT ──────────────────────────────────────────────────────────
  kandidatCard: {
    backgroundColor: BACKGROUND,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  kandidatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  kandidatNama: {
    color: TEXT,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  persenBadge: {
    backgroundColor: PRIMARY,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  persenBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  kandidatProgress: {
    color: SUBTEXT,
    fontSize: 12,
    marginBottom: 8,
  },
  konfirmasiLabel: {
    color: PRIMARY,
    fontWeight: '600',
    marginBottom: 6,
    fontSize: 13,
  },
  konfirmasiGejalaItem: {
    flexDirection: 'row',
    padding: 10,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: CARD,
    alignItems: 'flex-start',
  },
  konfirmasiGejalaSelected: {
    borderColor: PRIMARY,
    backgroundColor: '#EFF6FF',
  },
  checkboxSmall: {
    width: 20, height: 20,
    borderWidth: 2, borderColor: BORDER,
    borderRadius: 5,
    marginRight: 8, marginTop: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxSmallSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  konfirmasiGejalaText: {
    color: TEXT,
    fontSize: 14,
  },
  konfirmasiGejalaDesc: {
    color: SUBTEXT,
    fontSize: 12,
    marginTop: 2,
  },

  // ── MODAL BUTTONS ─────────────────────────────────────────────────────
  modalButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 14,
    borderRadius: 12,
  },
  modalButtonYes: {
    backgroundColor: PRIMARY,
  },
  modalButtonNo: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: BORDER,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  modalButtonTextDark: {
    color: TEXT,
    fontWeight: '600',
    fontSize: 14,
  },
});
