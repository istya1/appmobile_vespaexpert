import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RiwayatScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Riwayat Diagnosa</Text>
      <Text>Belum ada riwayat</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});

export default RiwayatScreen;