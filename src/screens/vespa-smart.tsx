import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getVespaSmartData, prosesDiagnosis, simpanRiwayatDiagnosis } from '../services/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ============================================
// TYPES & INTERFACES
// ============================================

type RootStackParamList = {
  VespaSmart: undefined;
  HasilDiagnosis: { hasil: HasilDiagnosisType };
};

type VespaSmartScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'VespaSmart'
>;

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

interface HasilDiagnosisType {
  success: boolean;
  jenis_motor: string;
  gejala_dipilih: number;
  hasil_diagnosis: any[];
  total_kerusakan_ditemukan: number;
}

// ============================================
// COMPONENT
// ============================================

const VespaSmartScreen: React.FC<Props> = ({ navigation }) => {
  const [jenisMotor, setJenisMotor] = useState<string>('');
  const [gejalaList, setGejalaList] = useState<GejalaItem[]>([]);
  const [gejalaTerpilih, setGejalaTerpilih] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const jenisMotorOptions: string[] = [
    'Sprint 150',
    'Sprint S 150',
    'LX 125',
    'Primavera 150',
    'Primavera S 150'
  ];

  // Load data ketika jenis motor dipilih
  useEffect(() => {
    if (jenisMotor) {
      loadGejalaData();
    } else {
      setGejalaList([]);
      setGejalaTerpilih([]);
    }
  }, [jenisMotor]);

  // Fungsi load data gejala
  const loadGejalaData = async (): Promise<void> => {
    setLoading(true);
    try {
      console.log('Loading data for:', jenisMotor);
      const data = await getVespaSmartData(jenisMotor);
      console.log('Response:', data);

      if (data.success) {
        // Convert object to array
        const gejalaArray: GejalaItem[] = [];
        Object.keys(data.gejala_by_kategori).forEach((kategori: string) => {
          data.gejala_by_kategori[kategori].forEach((gejala: any) => {
            gejalaArray.push({
              ...gejala,
              kategori: kategori
            });
          });
        });

        setGejalaList(gejalaArray);
        setGejalaTerpilih([]);
      } else {
        Alert.alert('Error', 'Gagal memuat data');
      }
    } catch (error: unknown) {
      console.error('Error loading data:', error);

      let errorMessage = 'Terjadi kesalahan';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        errorMessage = axiosError.response?.data?.message || 'Server error';
      } else if (error && typeof error === 'object' && 'request' in error) {
        errorMessage = 'Tidak dapat terhubung ke server';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Toggle pilihan gejala
  const toggleGejala = (kodeGejala: string): void => {
    if (gejalaTerpilih.includes(kodeGejala)) {
      setGejalaTerpilih(gejalaTerpilih.filter((k: string) => k !== kodeGejala));
    } else {
      setGejalaTerpilih([...gejalaTerpilih, kodeGejala]);
    }
  };

  // Proses diagnosis
  const handleDiagnosis = async (): Promise<void> => {
    if (gejalaTerpilih.length === 0) {
      Alert.alert('Peringatan', 'Pilih minimal 1 gejala terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      console.log('Processing diagnosis...');
      console.log('Jenis Motor:', jenisMotor);
      console.log('Gejala Terpilih:', gejalaTerpilih);

      const hasil = await prosesDiagnosis(jenisMotor, gejalaTerpilih);
      console.log('Hasil diagnosis:', hasil);

      if (hasil.success) {
        // Opsional: Simpan ke riwayat
        try {
          await simpanRiwayatDiagnosis({
            jenis_motor: jenisMotor,
            gejala_terpilih: gejalaTerpilih,
            hasil_diagnosis: hasil.hasil_diagnosis,
          });
          console.log('Riwayat berhasil disimpan');
        } catch (err) {
          console.log('Gagal simpan riwayat (tidak masalah):', err);
        }

        // Navigate ke hasil
        navigation.navigate('HasilDiagnosis', { hasil });
      } else {
        Alert.alert('Error', 'Diagnosis gagal diproses');
      }
    } catch (error: unknown) {
      console.error('Error diagnosis:', error);

      let errorMessage = 'Gagal melakukan diagnosis';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        errorMessage = axiosError.response?.data?.message || 'Server error';
      } else if (error && typeof error === 'object' && 'request' in error) {
        errorMessage = 'Tidak dapat terhubung ke server';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Render item gejala
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>VESPA SMART</Text>
        <Text style={styles.headerSubtitle}>Smart Diagnosis System</Text>
      </View>

      {/* Pilih Tipe Vespa */}
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
                keyExtractor={(item: GejalaItem) => item.kode_gejala}
                style={styles.gejalaList}
                contentContainerStyle={styles.gejalaListContent}
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
                    (loading || gejalaTerpilih.length === 0) && styles.buttonDisabled
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
    </View>
  );
};

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
  selectedMotorContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  selectedMotorLabel: {
    fontSize: 11,
    color: '#777777',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  selectedMotorText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
  },

  selectedMotorInstruction: {
    fontSize: 12,
    color: '#999999',
    marginTop: 6,
  },

});

export default VespaSmartScreen;
