import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DashboardFooter = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.goldLine} />

      <View style={styles.container}>
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            navigation.navigate('Main', { screen: 'Dashboard' })
          }
        >
          <MaterialCommunityIcons name="home-variant" size={26} color="#555555" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            navigation.navigate('Main', { screen: 'VespaCare' })
          }
        >
          <MaterialCommunityIcons name="wrench-clock" size={26} color="#555555" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.centerButton}
          onPress={() =>
            navigation.navigate('Main', { screen: 'VespaSmart' })
          }
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="tools" size={30} color="#111111" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            navigation.navigate('Main', { screen: 'Riwayat' })
          }
        >
          <MaterialCommunityIcons name="history" size={26} color="#555555" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            navigation.navigate('Main', { screen: 'Profil' })
          }
        >
          <MaterialCommunityIcons name="account-circle" size={26} color="#555555" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DashboardFooter;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#000000",
  },
  goldLine: {
    height: 1.5,
    backgroundColor: '#D4AF37',
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 65,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  centerButton: {
    position: 'relative',
    top: -22,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
});
