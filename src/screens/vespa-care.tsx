import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VespaCare = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vespa Care</Text>
      <Text>Belum ada</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});

export default VespaCare;