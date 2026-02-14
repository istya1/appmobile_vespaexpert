import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/app-navigator';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'HasilDiagnosis'
>;

interface DiagnosisItem {
  kode_kerusakan: string;
  nama_kerusakan: string;
  solusi: string;
  persentase_kecocokan: number;
}

const HasilDiagnosis: React.FC<Props> = ({ route, navigation }) => {
  const { hasil } = route.params;

  const {
    jenis_motor,
    gejala_dipilih,
    hasil_diagnosis,
    total_kerusakan_ditemukan,
  } = hasil;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HASIL DIAGNOSIS</Text>
        <Text style={styles.headerSubtitle}>
          {jenis_motor}
        </Text>
      </View>

      {/* Summary */}
      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Gejala Dipilih</Text>
          <Text style={styles.summaryValue}>
            {Array.isArray(gejala_dipilih)
              ? gejala_dipilih.length
              : gejala_dipilih}
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Kerusakan</Text>
          <Text style={styles.summaryValue}>
            {total_kerusakan_ditemukan}
          </Text>
        </View>
      </View>

      {/* Content */}
      {total_kerusakan_ditemukan === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✓</Text>
          <Text style={styles.emptyTitle}>Kondisi Baik</Text>
          <Text style={styles.emptyText}>
            Tidak ditemukan kerusakan berdasarkan gejala yang dipilih.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {hasil_diagnosis.map((item: DiagnosisItem, index: number) => (
            <View key={index} style={styles.diagnosisCard}>
              
              {/* Header Card */}
              <View style={styles.cardHeader}>
                <View style={styles.cardNumber}>
                  <Text style={styles.cardNumberText}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={styles.cardTitle}>
                  {item.nama_kerusakan}
                </Text>
              </View>

              {/* Solusi */}
              <View style={styles.cardSection}>
                <Text style={styles.sectionLabel}>
                  Solusi Perbaikan
                </Text>
                <Text style={styles.sectionText}>
                  {item.solusi}
                </Text>
              </View>

              {/* Persentase */}
              <View style={styles.certaintyContainer}>
                <Text style={styles.certaintyLabel}>
                  Tingkat Kecocokan
                </Text>

                <View style={styles.certaintyBar}>
                  <View
                    style={[
                      styles.certaintyFill,
                      { width: `${item.persentase_kecocokan}%` },
                    ]}
                  />
                </View>

                <Text style={styles.certaintyText}>
                  {item.persentase_kecocokan}%
                </Text>
              </View>

            </View>
          ))}
        </ScrollView>
      )}

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            Diagnosis Ulang
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HasilDiagnosis;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  summarySection: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#333333',
    marginHorizontal: 15,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  diagnosisCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  cardNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#444444',
  },
  cardNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  cardSection: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 15,
    color: '#CCCCCC',
    lineHeight: 22,
  },
  certaintyContainer: {
    marginTop: 5,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  certaintyLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  certaintyBar: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  certaintyFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  certaintyText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    color: '#4CAF50',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptyText: {
    color: '#999999',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
