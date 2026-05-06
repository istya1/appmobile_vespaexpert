// services/notifikasi.ts
// Semua logic notifikasi dikumpulkan di sini

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Konfigurasi tampilan notifikasi saat app terbuka (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function daftarkanNotifikasi(): Promise<string | null> {
  // Notifikasi hanya jalan di device fisik, bukan simulator
  if (!Device.isDevice) {
    console.warn('Notifikasi tidak jalan di simulator');
    return null;
  }

  // Minta izin notifikasi
  const { status: statusAda } = await Notifications.getPermissionsAsync();
  let statusAkhir = statusAda;

  if (statusAda !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    statusAkhir = status;
  }

  if (statusAkhir !== 'granted') {
    console.warn('Izin notifikasi ditolak user');
    return null;
  }

  // Khusus Android perlu channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('servis', {
      name:             'Pengingat Servis',
      importance:       Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:       '#1a237e',
      sound:            'default',
    });
  }

  // Ambil Expo Push Token
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: 'cd1d17a5-fed1-4e11-8bea-bfa6b4dfc95e', // dari app.json > extra > eas > projectId
  });

  return tokenData.data; // format: ExponentPushToken[xxx]
}