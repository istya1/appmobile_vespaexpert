// // src/services/NotificationService.ts
// import messaging from '@react-native-firebase/messaging';

// export const setupFCM = async () => {
//   try {
//     // 1. Minta izin notifikasi (wajib untuk iOS, bagus untuk Android)
//     const authStatus = await messaging().requestPermission();
//     const enabled =
//       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//       authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//     if (!enabled) {
//       console.log('Izin notifikasi ditolak');
//       return;
//     }

//     console.log('Izin notifikasi diberikan');

//     // 2. Subscribe ke topic test (untuk testing sekarang)
//     await messaging().subscribeToTopic('test-vespa');
//     console.log('Berhasil subscribe ke topic: test-vespa');

//     // Optional: kalau nanti mau topic per user (misal reminder personal)
//     // const userId = 'uid_dari_auth_kamu'; // ambil dari Firebase Auth atau state login
//     // await messaging().subscribeToTopic(`reminder_${userId}`);

//     // Optional: ambil FCM token kalau butuh kirim targeted (bukan topic)
//     // const token = await messaging().getToken();
//     // console.log('FCM Token:', token);
//     // simpan token ini ke Firestore kalau perlu

//   } catch (error) {
//     console.error('Gagal setup FCM:', error);
//   }
// };

// // Fungsi unsubscribe kalau user logout (opsional)
// export const unsubscribeFromTopic = async (topic: string) => {
//   try {
//     await messaging().unsubscribeFromTopic(topic);
//     console.log(`Unsubscribed from ${topic}`);
//   } catch (error) {
//     console.error('Gagal unsubscribe:', error);
//   }
// };