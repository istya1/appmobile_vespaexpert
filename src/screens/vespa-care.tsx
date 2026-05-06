// src/screens/vespa-care.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator,
  StyleSheet, RefreshControl, Modal, Animated,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { daftarkanNotifikasi } from '../services/notifikasi';
import { servisApi, DataServis } from '../services/api';

const ACCENT       = '#4A90E2';
const BG           = '#FFFFFF';
const CARD_BG      = '#EAF4FF';
const INPUT_BG     = '#F9FBFF';
const BORDER_COLOR = '#D6E4F0';
const TEXT_MAIN    = '#2D3748';
const TEXT_SUB     = '#718096';
const KENDARAAN_ID = 2;

type StatusKondisi = 'aman' | 'segera' | 'kritis' | 'selesai';

const WARNA_STATUS: Record<StatusKondisi, {
  bg: string; teks: string; label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}> = {
  aman:    { bg: '#EAF4FF', teks: '#185FA5', label: 'Aman',         icon: 'check-circle-outline' },
  segera:  { bg: '#FFF8E1', teks: '#B8860B', label: 'Segera Ganti', icon: 'alert-outline' },
  kritis:  { bg: '#FFF0F0', teks: '#A32D2D', label: 'Kritis',       icon: 'alert-circle-outline' },
  selesai: { bg: '#F1EFE8', teks: '#5F5E5A', label: 'Selesai',      icon: 'check-all' },
};

// ─── Tipe untuk custom modal & toast ────────────────────────────────────────

type ModalConfig = {
  type: 'konfirmasi-ganti-oli' | 'notif-servis';
  judul: string;
  pesan: string;
  onKonfirmasi?: () => void;
};

type ToastConfig = {
  type: 'sukses' | 'error' | 'peringatan' | 'info';
  judul: string;
  pesan?: string;
};

// ─── Komponen Toast ──────────────────────────────────────────────────────────

function Toast({
  config, onDismiss,
}: { config: ToastConfig; onDismiss: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2800),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => onDismiss());
  }, []);

  const palette: Record<ToastConfig['type'], { bg: string; border: string; icon: string; iconColor: string }> = {
    sukses:    { bg: '#F0FFF4', border: '#9AE6B4', icon: 'check-circle', iconColor: '#276749' },
    error:     { bg: '#FFF5F5', border: '#FEB2B2', icon: 'alert-circle', iconColor: '#C53030' },
    peringatan:{ bg: '#FFFBEB', border: '#F6E05E', icon: 'alert',        iconColor: '#B7791F' },
    info:      { bg: '#EBF8FF', border: '#BEE3F8', icon: 'information',  iconColor: '#2B6CB0' },
  };
  const p = palette[config.type];

  return (
    <Animated.View style={[t.wrap, { opacity, backgroundColor: p.bg, borderColor: p.border }]}>
      <MaterialCommunityIcons name={p.icon as any} size={22} color={p.iconColor} />
      <View style={{ flex: 1 }}>
        <Text style={[t.judul, { color: p.iconColor }]}>{config.judul}</Text>
        {config.pesan ? <Text style={t.pesan}>{config.pesan}</Text> : null}
      </View>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Feather name="x" size={16} color={TEXT_SUB} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const t = StyleSheet.create({
  wrap: {
    position: 'absolute', top: 16, left: 16, right: 16, zIndex: 99,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: 14, borderWidth: 1, padding: 14,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  judul: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  pesan: { fontSize: 12, color: TEXT_SUB, lineHeight: 18 },
});

// ─── Komponen Modal Custom ───────────────────────────────────────────────────

function ModalKonfirmasi({
  config, onTutup,
}: { config: ModalConfig; onTutup: () => void }) {

  const isGantiOli = config.type === 'konfirmasi-ganti-oli';
  const isNotif    = config.type === 'notif-servis';

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onTutup}>
      <TouchableOpacity style={m.overlay} activeOpacity={1} onPress={onTutup} />
      <View style={m.sheet}>
        <View style={m.handleBar} />

        {/* Ikon */}
        <View style={[m.ikonRing, {
          backgroundColor: isGantiOli ? '#EAF4FF' : isNotif ? '#FFFBEB' : '#F0FFF4',
          borderColor:     isGantiOli ? '#BEE3F8' : isNotif ? '#F6E05E' : '#9AE6B4',
        }]}>
          <MaterialCommunityIcons
            name={isGantiOli ? 'oil' : isNotif ? 'bell-ring-outline' : 'check-circle-outline'}
            size={30}
            color={isGantiOli ? ACCENT : isNotif ? '#B7791F' : '#276749'}
          />
        </View>

        <Text style={m.judul}>{config.judul}</Text>
        <Text style={m.pesan}>{config.pesan}</Text>

        {config.onKonfirmasi ? (
          <>
            <TouchableOpacity
              style={[m.tombolPrimer, { backgroundColor: isGantiOli ? ACCENT : '#B7791F' }]}
              activeOpacity={0.85}
              onPress={() => { config.onKonfirmasi?.(); onTutup(); }}
            >
              <MaterialCommunityIcons
                name={isGantiOli ? 'oil' : 'eye-outline'}
                size={16} color="#fff"
              />
              <Text style={m.tombolPrimerTeks}>
                {isGantiOli ? 'Ya, sudah ganti!' : 'Lihat'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={m.tombolSekunder} activeOpacity={0.7} onPress={onTutup}>
              <Text style={m.tombolSekunderTeks}>Tutup</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[m.tombolPrimer, { backgroundColor: ACCENT }]} onPress={onTutup}>
            <Text style={m.tombolPrimerTeks}>Oke</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const m = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: BG, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36,
    position: 'absolute', bottom: 0, left: 0, right: 0,
    alignItems: 'center',
  },
  handleBar: {
    width: 36, height: 4, backgroundColor: BORDER_COLOR,
    borderRadius: 2, marginBottom: 20,
  },
  ikonRing: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  judul:  { fontSize: 18, fontWeight: '700', color: TEXT_MAIN, textAlign: 'center', marginBottom: 8 },
  pesan:  { fontSize: 14, color: TEXT_SUB, textAlign: 'center', lineHeight: 22, marginBottom: 24, paddingHorizontal: 8 },
  tombolPrimer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 14, padding: 15, width: '100%', marginBottom: 10,
  },
  tombolPrimerTeks:   { color: '#fff', fontWeight: '700', fontSize: 15 },
  tombolSekunder: {
    padding: 14, width: '100%', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 14,
    borderWidth: 1, borderColor: BORDER_COLOR,
  },
  tombolSekunderTeks: { color: TEXT_MAIN, fontWeight: '600', fontSize: 15 },
});

// ─── Screen Utama ────────────────────────────────────────────────────────────

export default function ServisScreen() {
  const [servis, setServis]               = useState<DataServis | null>(null);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [simpanLoading, setSimpanLoading] = useState(false);
  const [tampilForm, setTampilForm]       = useState(false);
  const [kmInput, setKmInput]             = useState('');
  const [avgKm, setAvgKm]                 = useState('20');

  // State modal & toast
  const [modalConfig, setModalConfig]     = useState<ModalConfig | null>(null);
  const [toastConfig, setToastConfig]     = useState<ToastConfig | null>(null);

  const notifListener     = useRef<Notifications.Subscription | null>(null);
  const notifRespListener = useRef<Notifications.Subscription | null>(null);

  // Helper tampilkan toast
  const tampilkanToast = (config: ToastConfig) => setToastConfig(config);

  const muatData = useCallback(async () => {
    try {
      const res = await servisApi.getDetail(KENDARAAN_ID);
      setServis(res.data.data);
    } catch {
      setServis(null);
      setTampilForm(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    muatData();
  }, [muatData]);

  useEffect(() => {
    console.log('=== VESPA CARE SCREEN DIBUKA ===');
    muatData();

    daftarkanNotifikasi().then(token => {
      console.log('TOKEN NOTIF:', token);
    }).catch(err => {
      console.error('ERROR:', err.message);
    });

    notifListener.current = Notifications.addNotificationReceivedListener((notif) => {
      const { title, body } = notif.request.content;
      setModalConfig({
        type: 'notif-servis',
        judul: title ?? 'Pengingat Servis',
        pesan: body ?? '',
        onKonfirmasi: muatData,
      });
    });

    notifRespListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      muatData();
      setTampilForm(false);
    });

    return () => {
      notifListener.current?.remove();
      notifRespListener.current?.remove();
    };
  }, [muatData]);

  const simpanData = async () => {
    if (!kmInput.trim()) {
      tampilkanToast({ type: 'peringatan', judul: 'KM wajib diisi', pesan: 'Masukkan angka odometer kamu sekarang.' });
      return;
    }
    if (!avgKm.trim() || parseInt(avgKm) < 1) {
      tampilkanToast({ type: 'peringatan', judul: 'Rata-rata KM tidak valid', pesan: 'Minimal 1 km per hari.' });
      return;
    }

    setSimpanLoading(true);
    try {
      let expoToken: string | undefined = undefined;
      try {
        const token = await daftarkanNotifikasi();
        expoToken = token ?? undefined;
      } catch {
        console.warn('Gagal ambil token, lanjut tanpa token');
      }

      await servisApi.simpanData({
        kendaraan_id:          KENDARAAN_ID,
        km_sekarang:           parseInt(kmInput),
        rata_rata_km_per_hari: parseInt(avgKm),
        interval_ganti_oli:    4000,
        expo_push_token:       expoToken,
      });

      setTampilForm(false);
      setKmInput('');
      await muatData();
      tampilkanToast({
        type: 'sukses',
        judul: 'Data tersimpan!',
        pesan: 'Kamu akan diingatkan sebelum jadwal ganti oli.',
      });
    } catch (err: unknown) {
      const pesan = err instanceof Error ? err.message : 'Coba lagi';
      tampilkanToast({ type: 'error', judul: 'Gagal menyimpan', pesan });
    } finally {
      setSimpanLoading(false);
    }
  };

  const konfirmasiGantiOli = () => {
    setModalConfig({
      type: 'konfirmasi-ganti-oli',
      judul: 'Konfirmasi Ganti Oli',
      pesan: 'Tandai bahwa kamu sudah ganti oli hari ini?',
      onKonfirmasi: async () => {
        try {
          if (!servis) return;
          await servisApi.konfirmasiGantiOli(servis.id);
          await muatData();
          tampilkanToast({ type: 'sukses', judul: 'Tercatat!', pesan: 'Ganti oli berhasil dikonfirmasi.' });
        } catch (err: unknown) {
          const pesan = err instanceof Error ? err.message : 'Coba lagi';
          tampilkanToast({ type: 'error', judul: 'Gagal mengonfirmasi', pesan });
        }
      },
    });
  };

  if (loading) {
    return (
      <View style={s.tengah}>
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={s.teksLoading}>Memuat data servis...</Text>
      </View>
    );
  }

  const warna = servis ? WARNA_STATUS[servis.status_kondisi as StatusKondisi] : null;
  const persenTerpakai = servis
    ? Math.min(100, Math.round(100 - (servis.sisa_km / servis.km_target_oli) * 100))
    : 0;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={s.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.back()}>
          <Ionicons name="arrow-back" size={24} color={ACCENT} />
        </TouchableOpacity>

          <View style={{ marginLeft: 10 }}>
            <Text style={s.judul}>Vespa Care</Text>
            <Text style={s.subjudul}>Perawatan Vespa Matic</Text>
          </View>
        </View>

        {/* Kartu Status */}
        {servis && warna ? (
          <View style={[s.kartuStatus, { backgroundColor: warna.bg, borderColor: warna.teks + '33' }]}>

            <View style={[s.badge, { backgroundColor: warna.teks + '18' }]}>
              <MaterialCommunityIcons name={warna.icon} size={14} color={warna.teks} />
              <Text style={[s.badgeTeks, { color: warna.teks }]}>{warna.label}</Text>
            </View>

            <View style={s.grid}>
              <View style={s.gridItem}>
                <Text style={s.gridLabel}>Est. KM Sekarang</Text>
                <Text style={s.gridNilai}>{servis.estimasi_km_sekarang.toLocaleString('id-ID')}</Text>
                <Text style={s.gridSatuan}>km</Text>
              </View>
              <View style={s.gridDivider} />
              <View style={s.gridItem}>
                <Text style={s.gridLabel}>Target Ganti Oli</Text>
                <Text style={s.gridNilai}>{servis.km_target_oli.toLocaleString('id-ID')}</Text>
                <Text style={s.gridSatuan}>km</Text>
              </View>
            </View>

            <View style={s.grid}>
              <View style={s.gridItem}>
                <Text style={s.gridLabel}>Sisa KM</Text>
                <Text style={[s.gridNilaiBesar, { color: warna.teks }]}>
                  {servis.sisa_km.toLocaleString('id-ID')}
                </Text>
                <Text style={s.gridSatuan}>km lagi</Text>
              </View>
              <View style={s.gridDivider} />
              <View style={s.gridItem}>
                <Text style={s.gridLabel}>Sisa Hari</Text>
                <Text style={[s.gridNilaiBesar, { color: warna.teks }]}>{servis.sisa_hari}</Text>
                <Text style={s.gridSatuan}>hari lagi</Text>
              </View>
            </View>

            <Text style={s.labelProgress}>Progress menuju ganti oli</Text>
            <View style={s.progressBg}>
              <View style={[s.progressFill, { width: `${persenTerpakai}%`, backgroundColor: warna.teks }]} />
            </View>
            <View style={s.progressKeterangan}>
              <Text style={[s.teksProgress, { color: warna.teks }]}>{persenTerpakai}%</Text>
              <Text style={s.tanggalDeadline}>Deadline: {servis.estimasi_tanggal_deadline}</Text>
            </View>

            {!servis.sudah_ganti_oli && servis.sisa_hari <= 7 && (
              <TouchableOpacity style={s.tombolKonfirmasi} onPress={konfirmasiGantiOli}>
                <MaterialCommunityIcons name="oil" size={16} color={ACCENT} />
                <Text style={s.teksKonfirmasi}>Tandai Sudah Ganti Oli</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={s.kartuKosong}>
            <MaterialCommunityIcons name="oil" size={48} color={BORDER_COLOR} />
            <Text style={s.teksKosong}>Belum ada data servis</Text>
            <Text style={s.subKosong}>Masukkan KM odometer kamu sekarang untuk mulai monitoring</Text>
          </View>
        )}

        {/* Tombol update */}
        <TouchableOpacity style={s.tombolUpdate} onPress={() => setTampilForm(!tampilForm)}>
          <MaterialCommunityIcons
            name={tampilForm ? 'close' : 'pencil-outline'}
            size={18}
            color={BG}
          />
          <Text style={s.teksUpdate}>{tampilForm ? 'Tutup' : 'Update KM Sekarang'}</Text>
        </TouchableOpacity>

        {/* Form input */}
        {tampilForm && (
          <View style={s.kartuForm}>
            <Text style={s.formJudul}>Input Data Kendaraan</Text>

            <Text style={s.label}>KM Odometer Sekarang <Text style={{ color: ACCENT }}>*</Text></Text>
            <TextInput
              style={s.input}
              keyboardType="numeric"
              placeholder="Contoh: 7500"
              placeholderTextColor={TEXT_SUB}
              value={kmInput}
              onChangeText={setKmInput}
              maxLength={7}
            />

            <Text style={s.label}>Rata-rata KM per Hari <Text style={{ color: ACCENT }}>*</Text></Text>
            <TextInput
              style={s.input}
              keyboardType="numeric"
              placeholder="Contoh: 20"
              placeholderTextColor={TEXT_SUB}
              value={avgKm}
              onChangeText={setAvgKm}
              maxLength={4}
            />
            <Text style={s.infoInput}>Estimasi berapa km kamu berkendara setiap harinya</Text>

            <TouchableOpacity
              style={[s.tombolSimpan, simpanLoading && s.tombolDisable]}
              onPress={simpanData}
              disabled={simpanLoading}
            >
              {simpanLoading
                ? <ActivityIndicator color={BG} />
                : <>
                    <MaterialCommunityIcons name="content-save-outline" size={18} color={BG} />
                    <Text style={s.teksSimpan}>Simpan & Hitung Otomatis</Text>
                  </>
              }
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Toast — di luar ScrollView supaya selalu di atas */}
      {toastConfig && (
        <Toast config={toastConfig} onDismiss={() => setToastConfig(null)} />
      )}

      {/* Modal konfirmasi */}
      {modalConfig && (
        <ModalKonfirmasi config={modalConfig} onTutup={() => setModalConfig(null)} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: BG, padding: 20 },
  tengah:       { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  teksLoading:  { color: TEXT_SUB, fontSize: 14 },

  header:    { flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR, paddingBottom: 12 },
  judul:     { fontSize: 22, fontWeight: '700', color: TEXT_MAIN },
  subjudul:  { fontSize: 13, color: TEXT_SUB },

  kartuStatus: {
    borderRadius: 16, padding: 20, marginBottom: 16,
    borderWidth: 1, gap: 12,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  badgeTeks: { fontSize: 12, fontWeight: '600' },

  grid:         { flexDirection: 'row', alignItems: 'center' },
  gridItem:     { flex: 1, alignItems: 'center', paddingVertical: 8 },
  gridDivider:  { width: 1, height: 50, backgroundColor: BORDER_COLOR },
  gridLabel:    { fontSize: 11, color: TEXT_SUB, marginBottom: 2 },
  gridNilai:    { fontSize: 20, fontWeight: '700', color: TEXT_MAIN },
  gridNilaiBesar: { fontSize: 30, fontWeight: '700' },
  gridSatuan:   { fontSize: 11, color: TEXT_SUB },

  labelProgress:      { fontSize: 11, color: TEXT_SUB },
  progressBg:         { height: 8, backgroundColor: BORDER_COLOR, borderRadius: 4 },
  progressFill:       { height: 8, borderRadius: 4 },
  progressKeterangan: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  teksProgress:       { fontSize: 12, fontWeight: '600' },
  tanggalDeadline:    { fontSize: 11, color: TEXT_SUB },

  tombolKonfirmasi: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 4, backgroundColor: BG, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: BORDER_COLOR,
  },
  teksKonfirmasi: { fontWeight: '600', fontSize: 14, color: ACCENT },

  kartuKosong: {
    backgroundColor: CARD_BG, borderRadius: 16, padding: 32,
    alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: BORDER_COLOR,
  },
  teksKosong: { fontSize: 16, fontWeight: '600', color: TEXT_MAIN, marginTop: 12, marginBottom: 6 },
  subKosong:  { fontSize: 13, color: TEXT_SUB, textAlign: 'center', lineHeight: 20 },

  tombolUpdate: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: ACCENT, borderRadius: 25,
    paddingVertical: 14, marginBottom: 12,
  },
  teksUpdate: { color: BG, fontWeight: '700', fontSize: 15 },

  kartuForm: {
    backgroundColor: CARD_BG, borderRadius: 16, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: BORDER_COLOR,
  },
  formJudul:  { fontSize: 16, fontWeight: '700', color: TEXT_MAIN, marginBottom: 16 },
  label:      { fontSize: 14, fontWeight: '600', color: TEXT_MAIN, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: BORDER_COLOR, backgroundColor: INPUT_BG,
    borderRadius: 20, paddingHorizontal: 18, paddingVertical: 14,
    fontSize: 15, color: TEXT_MAIN, marginBottom: 16,
  },
  infoInput:    { fontSize: 12, color: TEXT_SUB, marginTop: -10, marginBottom: 16 },
  tombolSimpan: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: ACCENT, borderRadius: 25, paddingVertical: 16,
  },
  tombolDisable: { opacity: 0.6 },
  teksSimpan:    { color: BG, fontSize: 16, fontWeight: '700' },
});
