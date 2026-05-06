// src/screens/riwayat-service.tsx
import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMARY    = '#4A90E2';
const BACKGROUND = '#F9FAFB';
const CARD       = '#FFFFFF';
const CARD_BG    = '#EAF4FF';
const BORDER     = '#D6E4F0';
const TEXT       = '#2D3748';
const SUBTEXT    = '#718096';
const KENDARAAN_ID = 2;

interface RiwayatItem {
    id: number;
    km_sekarang: number;
    km_target_oli: number;
    tanggal_input: string;
    tanggal_deadline: string;
    tanggal_ganti_oli: string | null;
    sudah_ganti_oli: boolean;
}

export default function RiwayatService() {
    const [riwayat, setRiwayat]   = useState<RiwayatItem[]>([]);
    const [loading, setLoading]   = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const api = axios.create({
        baseURL: process.env.EXPO_PUBLIC_API_URL,
    });

    api.interceptors.request.use(async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    const muatRiwayat = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await api.get(`/servis/${KENDARAAN_ID}/riwayat`);
            setRiwayat(res.data.data ?? []);
        } catch (err) {
            console.error('Gagal muat riwayat service:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            muatRiwayat();
        }, [muatRiwayat])
    );

    const renderItem = ({ item, index }: { item: RiwayatItem; index: number }) => (
        <View style={[s.kartu, item.sudah_ganti_oli && s.kartuSelesai]}>

            {/* Header kartu */}
            <View style={s.headerKartu}>
                <View style={[s.ikonWrap, { backgroundColor: item.sudah_ganti_oli ? '#E8F5E9' : CARD_BG }]}>
                    <MaterialCommunityIcons
                        name="oil"
                        size={22}
                        color={item.sudah_ganti_oli ? '#2E7D32' : PRIMARY}
                    />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.judulKartu}>Ganti Oli #{riwayat.length - index}</Text>
                    <Text style={s.tanggalInput}>{item.tanggal_input}</Text>
                </View>
                <View style={[
                    s.badge,
                    { backgroundColor: item.sudah_ganti_oli ? '#E8F5E9' : CARD_BG }
                ]}>
                    <Text style={[
                        s.badgeTeks,
                        { color: item.sudah_ganti_oli ? '#2E7D32' : PRIMARY }
                    ]}>
                        {item.sudah_ganti_oli ? 'Selesai' : 'Belum'}
                    </Text>
                </View>
            </View>

            {/* Info KM */}
            <View style={s.grid}>
                <View style={s.gridItem}>
                    <Text style={s.gridLabel}>KM Saat Input</Text>
                    <Text style={s.gridNilai}>
                        {item.km_sekarang.toLocaleString('id-ID')}
                    </Text>
                    <Text style={s.gridSatuan}>km</Text>
                </View>
                <View style={s.gridDivider} />
                <View style={s.gridItem}>
                    <Text style={s.gridLabel}>Target Ganti Oli</Text>
                    <Text style={s.gridNilai}>
                        {item.km_target_oli.toLocaleString('id-ID')}
                    </Text>
                    <Text style={s.gridSatuan}>km</Text>
                </View>
            </View>

            {/* Info tanggal */}
            <View style={s.infoRow}>
                <MaterialCommunityIcons name="calendar-clock" size={14} color={SUBTEXT} />
                <Text style={s.infoTeks}>Deadline: {item.tanggal_deadline}</Text>
            </View>

            {item.sudah_ganti_oli && item.tanggal_ganti_oli && (
                <View style={s.infoRow}>
                    <MaterialCommunityIcons name="check-circle-outline" size={14} color="#2E7D32" />
                    <Text style={[s.infoTeks, { color: '#2E7D32' }]}>
                        Ganti oli: {item.tanggal_ganti_oli}
                    </Text>
                </View>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={s.tengah}>
                <ActivityIndicator size="large" color={PRIMARY} />
                <Text style={s.teksLoading}>Memuat riwayat service...</Text>
            </View>
        );
    }

    return (
        <View style={s.container}>
            <FlatList
                data={riwayat}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={riwayat.length === 0 ? s.listKosong : s.list}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => muatRiwayat(true)}
                        tintColor={PRIMARY}
                    />
                }
                ListHeaderComponent={
                    riwayat.length > 0 ? (
                        <View style={s.ringkasan}>
                            <View style={s.ringkasanItem}>
                                <Text style={s.ringkasanAngka}>{riwayat.length}</Text>
                                <Text style={s.ringkasanLabel}>Total Record</Text>
                            </View>
                            <View style={s.ringkasanDivider} />
                            <View style={s.ringkasanItem}>
                                <Text style={s.ringkasanAngka}>
                                    {riwayat.filter(r => r.sudah_ganti_oli).length}
                                </Text>
                                <Text style={s.ringkasanLabel}>Sudah Ganti</Text>
                            </View>
                            <View style={s.ringkasanDivider} />
                            <View style={s.ringkasanItem}>
                                <Text style={s.ringkasanAngka}>
                                    {riwayat.filter(r => !r.sudah_ganti_oli).length}
                                </Text>
                                <Text style={s.ringkasanLabel}>Belum Ganti</Text>
                            </View>
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={s.kosong}>
                        <MaterialCommunityIcons name="oil" size={56} color={BORDER} />
                        <Text style={s.teksKosong}>Belum ada riwayat service</Text>
                        <Text style={s.subKosong}>
                            Riwayat ganti oli akan muncul di sini setelah kamu input data di Vespa Care
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const s = StyleSheet.create({
    container:      { flex: 1, backgroundColor: BACKGROUND },
    tengah:         { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    teksLoading:    { color: SUBTEXT, fontSize: 14 },
    list:           { padding: 16, paddingBottom: 40 },
    listKosong:     { flex: 1 },

    ringkasan: {
        flexDirection: 'row', backgroundColor: CARD,
        borderRadius: 14, padding: 16, marginBottom: 16,
        borderWidth: 1, borderColor: BORDER,
    },
    ringkasanItem:    { flex: 1, alignItems: 'center' },
    ringkasanAngka:   { fontSize: 22, fontWeight: '700', color: PRIMARY },
    ringkasanLabel:   { fontSize: 11, color: SUBTEXT, marginTop: 2 },
    ringkasanDivider: { width: 1, backgroundColor: BORDER, marginHorizontal: 8 },

    kartu: {
        backgroundColor: CARD, borderRadius: 16, padding: 16,
        marginBottom: 12, borderWidth: 1, borderColor: BORDER, gap: 10,
    },
    kartuSelesai: { borderColor: '#A5D6A7' },

    headerKartu:  { flexDirection: 'row', alignItems: 'center' },
    ikonWrap:     {
        width: 44, height: 44, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
    },
    judulKartu:   { fontSize: 15, fontWeight: '700', color: TEXT },
    tanggalInput: { fontSize: 12, color: SUBTEXT, marginTop: 2 },
    badge:        {
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 20,
    },
    badgeTeks:    { fontSize: 12, fontWeight: '600' },

    grid:         { flexDirection: 'row', alignItems: 'center' },
    gridItem:     { flex: 1, alignItems: 'center', paddingVertical: 4 },
    gridDivider:  { width: 1, height: 40, backgroundColor: BORDER },
    gridLabel:    { fontSize: 11, color: SUBTEXT, marginBottom: 2 },
    gridNilai:    { fontSize: 18, fontWeight: '700', color: TEXT },
    gridSatuan:   { fontSize: 11, color: SUBTEXT },

    infoRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoTeks:     { fontSize: 12, color: SUBTEXT },

    kosong:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
    teksKosong:   { fontSize: 16, fontWeight: '600', color: TEXT, marginTop: 16 },
    subKosong:    {
        fontSize: 13, color: SUBTEXT, textAlign: 'center',
        marginTop: 6, paddingHorizontal: 40, lineHeight: 20,
    },
});