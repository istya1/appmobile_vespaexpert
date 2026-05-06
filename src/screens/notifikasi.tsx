import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCENT       = '#4A90E2';
const BG           = '#FFFFFF';
const CARD_BG      = '#EAF4FF';
const BORDER_COLOR = '#D6E4F0';
const TEXT_MAIN    = '#2D3748';
const TEXT_SUB     = '#718096';

interface ItemNotifikasi {
  id: number;
  judul: string;
  pesan: string;
  tipe: string;
  sudah_dibaca: number;
  created_at: string;
}

const Notifikasi = () => {
  const [notifikasi, setNotifikasi] = useState<ItemNotifikasi[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
  });

  // Sisipkan token auth otomatis
  api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const muatNotifikasi = useCallback(async () => {
    try {
      const res = await api.get('/notifikasi');
      setNotifikasi(res.data.data);
    } catch (err) {
      console.error('Gagal muat notifikasi:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    muatNotifikasi();
  }, [muatNotifikasi]);

  const tandaiBaca = async (id: number) => {
    try {
      await api.patch(`/notifikasi/${id}/baca`);
      setNotifikasi(prev =>
        prev.map(n => n.id === id ? { ...n, sudah_dibaca: 1 } : n)
      );
    } catch (err) {
      console.error('Gagal tandai baca:', err);
    }
  };

  const bacaSemua = async () => {
    try {
      await api.patch('/notifikasi/baca-semua');
      setNotifikasi(prev => prev.map(n => ({ ...n, sudah_dibaca: 1 })));
    } catch (err) {
      console.error('Gagal baca semua:', err);
    }
  };

  useEffect(() => {
    muatNotifikasi();
  }, [muatNotifikasi]);

  const formatTanggal = (tgl: string) => {
    const d = new Date(tgl);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const jumlahBelumBaca = notifikasi.filter(n => n.sudah_dibaca === 0).length;

  if (loading) {
    return (
      <View style={s.tengah}>
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={s.teksLoading}>Memuat notifikasi...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.back()}>
          <Ionicons name="arrow-back" size={24} color={ACCENT} />
        </TouchableOpacity>

        <View style={s.headerKiri}>
          {/* <MaterialCommunityIcons name="bell-outline" size={24} color={ACCENT} /> */}
          <Text style={s.judul}>Notifikasi</Text>
          {jumlahBelumBaca > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeTeks}>{jumlahBelumBaca}</Text>
            </View>
          )}
        </View>
        {jumlahBelumBaca > 0 && (
          <TouchableOpacity onPress={bacaSemua}>
            <Text style={s.bacaSemua}>Baca semua</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List Notifikasi */}
      <FlatList
        data={notifikasi}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
        }
        ListEmptyComponent={
          <View style={s.kosong}>
            <MaterialCommunityIcons name="bell-off-outline" size={56} color={BORDER_COLOR} />
            <Text style={s.teksKosong}>Belum ada notifikasi</Text>
            <Text style={s.subKosong}>Notifikasi reminder ganti oli akan muncul di sini</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.kartu, item.sudah_dibaca === 0 && s.kartuBelumBaca]}
            onPress={() => tandaiBaca(item.id)}
            activeOpacity={0.7}
          >
            {/* Icon */}
            <View style={[s.ikonWrap, { backgroundColor: CARD_BG }]}>
              <MaterialCommunityIcons
                name={item.tipe === 'reminder_oli' ? 'oil' : 'bell'}
                size={22}
                color={ACCENT}
              />
            </View>

            {/* Konten */}
            <View style={s.konten}>
              <View style={s.barisAtas}>
                <Text style={s.judulNotif} numberOfLines={1}>{item.judul}</Text>
                {item.sudah_dibaca === 0 && <View style={s.titikBiru} />}
              </View>
              <Text style={s.pesanNotif} numberOfLines={2}>{item.pesan}</Text>
              <Text style={s.waktu}>{formatTanggal(item.created_at)}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={notifikasi.length === 0 ? s.listKosong : s.list}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: BG },
  tengah:         { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  teksLoading:    { color: TEXT_SUB, fontSize: 14 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    marginBottom: 20,
  },
  headerKiri:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  judul:          { fontSize: 20, fontWeight: '700', color: TEXT_MAIN },
  badge:          {
    backgroundColor: ACCENT, borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  badgeTeks:      { color: '#fff', fontSize: 11, fontWeight: '700' },
  bacaSemua:      { color: ACCENT, fontSize: 13, fontWeight: '600' },

  list:           { paddingHorizontal: 16, paddingTop: 8 },
  listKosong:     { flex: 1 },

  kartu:          {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: BG, borderRadius: 14, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: BORDER_COLOR,
  },
  kartuBelumBaca: { backgroundColor: CARD_BG, borderColor: ACCENT + '44' },

  ikonWrap:       {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  konten:         { flex: 1 },
  barisAtas:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  judulNotif:     { fontSize: 14, fontWeight: '600', color: TEXT_MAIN, flex: 1 },
  titikBiru:      {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: ACCENT, marginLeft: 8,
  },
  pesanNotif:     { fontSize: 13, color: TEXT_SUB, marginTop: 3, lineHeight: 18 },
  waktu:          { fontSize: 11, color: TEXT_SUB, marginTop: 6 },

  kosong:         { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  teksKosong:     { fontSize: 16, fontWeight: '600', color: TEXT_MAIN, marginTop: 16 },
  subKosong:      { fontSize: 13, color: TEXT_SUB, textAlign: 'center', marginTop: 6, paddingHorizontal: 40 },
});

export default Notifikasi;