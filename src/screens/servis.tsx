// // screens/ServisScreen.tsx
// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   View, Text, ScrollView, TouchableOpacity,
//   TextInput, Alert, ActivityIndicator, StyleSheet,
// } from 'react-native';
// import { initializeApp } from 'firebase/app';
// import { servisApi } from '../services/servis';

// interface DataServis {
//   id: number;
//   estimasi_km_sekarang: number;
//   km_target_oli: number;
//   sisa_km: number;
//   sisa_hari: number;
//   estimasi_tanggal_deadline: string;
//   status_kondisi: 'aman' | 'segera' | 'kritis' | 'selesai';
//   sudah_ganti_oli: boolean;
// }

// const KENDARAAN_ID = 1; // ganti sesuai kendaraan aktif

// export default function ServisScreen() {
//   const [servis, setServis]           = useState<DataServis | null>(null);
//   const [loading, setLoading]         = useState(true);
//   const [simpanLoading, setSimpanLoading] = useState(false);
//   const [kmInput, setKmInput]         = useState('');
//   const [avgKm, setAvgKm]             = useState('20');
//   const [tampilForm, setTampilForm]   = useState(false);

//   // Warna berdasarkan status
//   const warnaStatus = {
//     aman:    { bg: '#e8f5e9', text: '#2e7d32', label: 'Aman' },
//     segera:  { bg: '#fff8e1', text: '#f57f17', label: 'Segera Ganti' },
//     kritis:  { bg: '#ffebee', text: '#c62828', label: 'Kritis!' },
//     selesai: { bg: '#f5f5f5', text: '#616161', label: 'Selesai' },
//   };

//   const muatData = useCallback(async () => {
//     try {
//       const res = await servisApi.getDetail(KENDARAAN_ID);
//       setServis(res.data.data);
//     } catch {
//       setServis(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Setup notifikasi Firebase
//   const setupNotifikasi = async () => {
//     const izin = await messaging().requestPermission();
//     if (izin !== messaging.AuthorizationStatus.AUTHORIZED) return null;
//     return await messaging().getToken();
//   };

//   useEffect(() => {
//     muatData();

//     // Tangani notifikasi saat app aktif (foreground)
//     const unsubscribe = messaging().onMessage(async (notif) => {
//       Alert.alert(
//         notif.notification?.title ?? 'Pengingat Servis',
//         notif.notification?.body ?? '',
//         [{ text: 'Lihat Detail', onPress: muatData }, { text: 'Tutup' }]
//       );
//     });

//     // Tangani klik notifikasi dari background
//     messaging().onNotificationOpenedApp(() => muatData());

//     return unsubscribe;
//   }, []);

//   const simpanData = async () => {
//     if (!kmInput || !avgKm) {
//       Alert.alert('Perhatian', 'KM dan rata-rata harian wajib diisi');
//       return;
//     }
//     setSimpanLoading(true);
//     try {
//       const fcmToken = await setupNotifikasi();
//       await servisApi.simpanData({
//         kendaraan_id:          KENDARAAN_ID,
//         km_sekarang:           parseInt(kmInput),
//         rata_rata_km_per_hari: parseInt(avgKm),
//         fcm_token:             fcmToken ?? undefined,
//       });
//       setTampilForm(false);
//       await muatData();
//       Alert.alert('Berhasil', 'Data servis berhasil disimpan!');
//     } catch {
//       Alert.alert('Gagal', 'Terjadi kesalahan, coba lagi');
//     } finally {
//       setSimpanLoading(false);
//     }
//   };

//   const konfirmasiGantiOli = () => {
//     Alert.alert(
//       'Konfirmasi Ganti Oli',
//       'Apakah kamu sudah melakukan ganti oli hari ini?',
//       [
//         { text: 'Batal', style: 'cancel' },
//         {
//           text: 'Ya, sudah!',
//           onPress: async () => {
//             await servisApi.konfirmasiGantiOli(servis!.id);
//             await muatData();
//             Alert.alert('Tercatat!', 'Ganti oli berhasil dikonfirmasi 🎉');
//           },
//         },
//       ]
//     );
//   };

//   if (loading) {
//     return (
//       <View style={s.tengah}>
//         <ActivityIndicator size="large" color="#1a237e" />
//       </View>
//     );
//   }

//   const status = servis ? warnaStatus[servis.status_kondisi] : null;

//   return (
//     <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
//       <Text style={s.judul}>🔧 Vespa Smart — Servis</Text>

//       {/* ── Kartu Status Utama ── */}
//       {servis && status ? (
//         <View style={[s.kartuStatus, { backgroundColor: status.bg }]}>
//           <Text style={[s.badgeStatus, { color: status.text }]}>{status.label}</Text>

//           <View style={s.baris}>
//             <View style={s.kolom}>
//               <Text style={s.labelKecil}>Est. KM Sekarang</Text>
//               <Text style={s.nilaiKm}>{servis.estimasi_km_sekarang.toLocaleString()} km</Text>
//             </View>
//             <View style={s.kolom}>
//               <Text style={s.labelKecil}>Target Ganti Oli</Text>
//               <Text style={s.nilaiKm}>{servis.km_target_oli.toLocaleString()} km</Text>
//             </View>
//           </View>

//           <View style={s.baris}>
//             <View style={s.kolom}>
//               <Text style={s.labelKecil}>Sisa KM</Text>
//               <Text style={[s.nilaiBesar, { color: status.text }]}>
//                 {servis.sisa_km.toLocaleString()} km
//               </Text>
//             </View>
//             <View style={s.kolom}>
//               <Text style={s.labelKecil}>Sisa Hari</Text>
//               <Text style={[s.nilaiBesar, { color: status.text }]}>
//                 {servis.sisa_hari} hari
//               </Text>
//             </View>
//           </View>

//           <Text style={s.tanggal}>
//             Deadline: {servis.estimasi_tanggal_deadline}
//           </Text>

//           {/* Progress bar */}
//           <View style={s.progressBg}>
//             <View style={[
//               s.progressFill,
//               {
//                 width: `${Math.min(100, 100 - (servis.sisa_km / servis.km_target_oli) * 100)}%`,
//                 backgroundColor: status.text,
//               },
//             ]} />
//           </View>
//           <Text style={[s.labelKecil, { textAlign: 'right', marginTop: 4 }]}>
//             {Math.round(100 - (servis.sisa_km / servis.km_target_oli) * 100)}% menuju ganti oli
//           </Text>

//           {/* Tombol konfirmasi */}
//           {!servis.sudah_ganti_oli && servis.sisa_hari <= 7 && (
//             <TouchableOpacity style={s.tombolKonfirmasi} onPress={konfirmasiGantiOli}>
//               <Text style={s.teksKonfirmasi}>✅ Sudah Ganti Oli</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       ) : (
//         <View style={s.kartuKosong}>
//           <Text style={s.teksKosong}>Belum ada data servis.</Text>
//           <Text style={s.teksKosongSub}>Masukkan KM kendaraan kamu sekarang.</Text>
//         </View>
//       )}

//       {/* ── Form Input KM ── */}
//       <TouchableOpacity style={s.tombolUpdate} onPress={() => setTampilForm(!tampilForm)}>
//         <Text style={s.teksUpdate}>
//           {tampilForm ? '✕ Tutup Form' : '📝 Update KM Sekarang'}
//         </Text>
//       </TouchableOpacity>

//       {tampilForm && (
//         <View style={s.kartuForm}>
//           <Text style={s.labelInput}>KM Odometer Sekarang</Text>
//           <TextInput
//             style={s.input}
//             keyboardType="numeric"
//             placeholder="Contoh: 7500"
//             value={kmInput}
//             onChangeText={setKmInput}
//           />

//           <Text style={s.labelInput}>Rata-rata KM per Hari</Text>
//           <TextInput
//             style={s.input}
//             keyboardType="numeric"
//             placeholder="Contoh: 20"
//             value={avgKm}
//             onChangeText={setAvgKm}
//           />

//           <TouchableOpacity
//             style={[s.tombolSimpan, simpanLoading && { opacity: 0.6 }]}
//             onPress={simpanData}
//             disabled={simpanLoading}
//           >
//             {simpanLoading
//               ? <ActivityIndicator color="#fff" />
//               : <Text style={s.teksSimpan}>Simpan & Hitung Ulang</Text>
//             }
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const s = StyleSheet.create({
//   container:      { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
//   tengah:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   judul:          { fontSize: 22, fontWeight: '600', marginBottom: 16, color: '#1a237e' },
//   kartuStatus:    { borderRadius: 16, padding: 20, marginBottom: 16 },
//   badgeStatus:    { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
//   baris:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
//   kolom:          { flex: 1 },
//   labelKecil:     { fontSize: 11, color: '#666', marginBottom: 2 },
//   nilaiKm:        { fontSize: 16, fontWeight: '600', color: '#333' },
//   nilaiBesar:     { fontSize: 28, fontWeight: '700' },
//   tanggal:        { fontSize: 12, color: '#666', marginBottom: 10 },
//   progressBg:     { height: 8, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 4 },
//   progressFill:   { height: 8, borderRadius: 4 },
//   tombolKonfirmasi: { marginTop: 16, backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center' },
//   teksKonfirmasi: { fontWeight: '600', fontSize: 14 },
//   kartuKosong:    { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
//   teksKosong:     { fontSize: 16, fontWeight: '600', color: '#333' },
//   teksKosongSub:  { fontSize: 13, color: '#999', marginTop: 4 },
//   tombolUpdate:   { backgroundColor: '#1a237e', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 12 },
//   teksUpdate:     { color: '#fff', fontWeight: '600', fontSize: 14 },
//   kartuForm:      { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16 },
//   labelInput:     { fontSize: 13, color: '#555', marginBottom: 6, fontWeight: '500' },
//   input:          { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 14 },
//   tombolSimpan:   { backgroundColor: '#1a237e', borderRadius: 10, padding: 14, alignItems: 'center' },
//   teksSimpan:     { color: '#fff', fontWeight: '600', fontSize: 15 },
// });