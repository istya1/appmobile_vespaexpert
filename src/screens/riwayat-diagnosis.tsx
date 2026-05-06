// src/screens/riwayat-diagnosis.tsx
import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Alert, ActivityIndicator, RefreshControl,
    Modal, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import DiagnosaService from '../services/diagnosa';

const PRIMARY    = '#4A90E2';
const BACKGROUND = '#F9FAFB';
const CARD       = '#FFFFFF';
const CARD_BG    = '#EAF4FF';
const BORDER     = '#D6E4F0';
const TEXT       = '#2D3748';
const SUBTEXT    = '#718096';

interface HasilDiagnosis {
    nama_kerusakan: string;
    kode_kerusakan: string;
    persentase_kecocokan: number;
}

interface RiwayatItem {
    id?: number;
    id_diagnosa?: number;
    jenis_motor: string;
    created_at: string;
    hasil_diagnosis: HasilDiagnosis[];
}

export default function RiwayatDiagnosa() {
    const [riwayat, setRiwayat]         = useState<RiwayatItem[]>([]);
    const [loading, setLoading]         = useState<boolean>(true);
    const [refreshing, setRefreshing]   = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<RiwayatItem | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [hapusTarget, setHapusTarget] = useState<RiwayatItem | null>(null);
    const [modalHapusVisible, setModalHapusVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadRiwayat();
        }, [])
    );

    const getId = (item: RiwayatItem): number => item.id ?? item.id_diagnosa ?? 0;

    const loadRiwayat = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const data = await DiagnosaService.getRiwayatMobile();
            setRiwayat(data ?? []);
        } catch (error) {
            Alert.alert('Error', 'Gagal memuat riwayat diagnosis.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const konfirmasiHapus = (item: RiwayatItem) => {
        setHapusTarget(item);
        setModalHapusVisible(true);
    };

    const hapusItem = async (id: number) => {
        try {
            await DiagnosaService.hapusRiwayatDiagnosis(id);
            setRiwayat((prev) => prev.filter((item) => getId(item) !== id));
            setModalVisible(false);
            setModalHapusVisible(false);
            setHapusTarget(null);
        } catch {
            Alert.alert('Error', 'Gagal menghapus riwayat.');
        }
    };

    const formatTanggal = (dateString: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const bukaDetail = (item: RiwayatItem) => {
        setSelectedItem(item);
        setModalVisible(true);
    };

    // Warna progress bar berdasarkan persentase
    const warnaPersentase = (persen: number) => {
        if (persen >= 75) return '#E53E3E'; // merah — kemungkinan tinggi
        if (persen >= 50) return '#DD6B20'; // oranye
        return PRIMARY;                      // biru — kemungkinan rendah
    };

    const renderItem = ({ item }: { item: RiwayatItem }) => {
        const kerusakanUtama = item.hasil_diagnosis?.[0];
        return (
            <TouchableOpacity
                style={s.kartu}
                activeOpacity={0.8}
                onPress={() => bukaDetail(item)}
            >
                <View style={s.kartuAtas}>
                    <View style={s.ikonWrap}>
                        <MaterialCommunityIcons name="magnify" size={20} color={PRIMARY} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={s.jenisMotor}>{item.jenis_motor}</Text>
                        <View style={s.tanggalRow}>
                            <Feather name="clock" size={12} color={SUBTEXT} />
                            <Text style={s.tanggal}>{formatTanggal(item.created_at)}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={s.hapusBtn}
                        onPress={() => konfirmasiHapus(item)}
                    >
                        <Feather name="trash-2" size={18} color={SUBTEXT} />
                    </TouchableOpacity>
                </View>

                {/* Hasil diagnosis */}
                {kerusakanUtama ? (
                    <View style={s.hasilWrap}>
                        <View style={s.kodeBadge}>
                            <Text style={s.kodeTeks}>{kerusakanUtama.kode_kerusakan}</Text>
                        </View>
                        <Text style={s.namaKerusakan} numberOfLines={1}>
                            {kerusakanUtama.nama_kerusakan}
                        </Text>
                        <Text style={[s.persenTeks, { color: warnaPersentase(kerusakanUtama.persentase_kecocokan) }]}>
                            {kerusakanUtama.persentase_kecocokan}%
                        </Text>
                    </View>
                ) : (
                    <Text style={s.tidakAda}>Tidak ada diagnosis final</Text>
                )}

                {item.hasil_diagnosis?.length > 1 && (
                    <Text style={s.lebihBanyak}>
                        +{item.hasil_diagnosis.length - 1} kerusakan lain
                    </Text>
                )}

                {/* Lihat detail */}
                <View style={s.lihatDetailRow}>
                    <Text style={s.lihatDetailTeks}>Lihat detail</Text>
                    <Feather name="chevron-right" size={13} color={PRIMARY} />
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={s.tengah}>
                <ActivityIndicator size="large" color={PRIMARY} />
                <Text style={s.teksLoading}>Memuat riwayat...</Text>
            </View>
        );
    }

    return (
        <View style={s.container}>
            <FlatList
                data={riwayat}
                renderItem={renderItem}
                keyExtractor={(item, index) => (getId(item) || index).toString()}
                contentContainerStyle={riwayat.length === 0 ? s.listKosong : s.list}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadRiwayat(true)}
                        tintColor={PRIMARY}
                    />
                }
                ListEmptyComponent={
                    <View style={s.kosong}>
                        <MaterialCommunityIcons name="clipboard-text-off-outline" size={56} color={BORDER} />
                        <Text style={s.teksKosong}>Belum ada riwayat diagnosis</Text>
                        <Text style={s.subKosong}>Lakukan diagnosis untuk melihat riwayat di sini</Text>
                    </View>
                }
            />

            {/* ── MODAL DETAIL ── */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                {/* Overlay gelap */}
                <TouchableOpacity
                    style={s.overlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                />

                {/* Bottom sheet */}
                <View style={s.bottomSheet}>

                    {/* Handle bar */}
                    <View style={s.handleBar} />

                    {/* Header modal */}
                    <View style={s.modalHeader}>
                        <View>
                            <Text style={s.modalJudul}>Detail Diagnosis</Text>
                            <Text style={s.modalSubjudul}>{selectedItem?.jenis_motor}</Text>
                        </View>
                        <TouchableOpacity
                            style={s.tombolTutup}
                            onPress={() => setModalVisible(false)}
                        >
                            <Feather name="x" size={20} color={SUBTEXT} />
                        </TouchableOpacity>
                    </View>

                    {/* Tanggal */}
                    <View style={s.modalTanggalRow}>
                        <Feather name="clock" size={14} color={SUBTEXT} />
                        <Text style={s.modalTanggal}>
                            {formatTanggal(selectedItem?.created_at ?? '')}
                        </Text>
                    </View>

                    <View style={s.divider} />

                    {/* List kerusakan */}
                    <Text style={s.labelHasil}>Hasil Diagnosis</Text>

                    <ScrollView
                        style={s.scrollHasil}
                        showsVerticalScrollIndicator={false}
                    >
                        {selectedItem?.hasil_diagnosis?.length === 0 ? (
                            <Text style={s.tidakAda}>Tidak ada diagnosis final</Text>
                        ) : (
                            selectedItem?.hasil_diagnosis?.map((item, index) => (
                                <View key={index} style={s.kartuKerusakan}>

                                    {/* Nomor urut + kode */}
                                    <View style={s.kerusakanHeader}>
                                        <View style={s.nomorWrap}>
                                            <Text style={s.nomorTeks}>{index + 1}</Text>
                                        </View>
                                        <View style={s.kodeBadgeModal}>
                                            <Text style={s.kodeTeks}>{item.kode_kerusakan}</Text>
                                        </View>
                                        <Text style={[
                                            s.persenBadge,
                                            { backgroundColor: warnaPersentase(item.persentase_kecocokan) }
                                        ]}>
                                            {item.persentase_kecocokan}%
                                        </Text>
                                    </View>

                                    {/* Nama kerusakan */}
                                    <Text style={s.namaKerusakanModal}>{item.nama_kerusakan}</Text>

                                    {/* Progress bar kecocokan */}
                                    <View style={s.progressBg}>
                                        <View style={[
                                            s.progressFill,
                                            {
                                                width: `${item.persentase_kecocokan}%`,
                                                backgroundColor: warnaPersentase(item.persentase_kecocokan),
                                            }
                                        ]} />
                                    </View>
                                    <Text style={s.labelKecocokan}>
                                        Tingkat kecocokan: {item.persentase_kecocokan}%
                                    </Text>
                                </View>
                            ))
                        )}
                        <View style={{ height: 20 }} />
                    </ScrollView>

                    {/* Tombol hapus di modal */}
                    <TouchableOpacity
                        style={s.tombolHapus}
                        onPress={() => {
                            if (selectedItem) konfirmasiHapus(selectedItem);
                        }}
                    >
                        <Feather name="trash-2" size={16} color="#E53E3E" />
                        <Text style={s.tombolHapusTeks}>Hapus Riwayat Ini</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* ── MODAL KONFIRMASI HAPUS ── */}
            <Modal
                visible={modalHapusVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalHapusVisible(false)}
            >
                <TouchableOpacity
                    style={s.overlay}
                    activeOpacity={1}
                    onPress={() => setModalHapusVisible(false)}
                />
                <View style={s.hapusSheet}>
                    <View style={s.handleBar} />

                    {/* Ikon merah */}
                    <View style={s.hapusIkonRing}>
                        <Feather name="trash-2" size={28} color="#E53E3E" />
                    </View>

                    <Text style={s.hapusJudul}>Hapus riwayat ini?</Text>
                    <Text style={s.hapusSubjudul}>
                        Data diagnosis akan dihapus permanen{'\n'}dan tidak dapat dikembalikan.
                    </Text>

                    {/* Info motor & tanggal */}
                    <View style={s.hapusMetaBox}>
                        <MaterialCommunityIcons name="motorbike" size={16} color={SUBTEXT} />
                        <Text style={s.hapusMetaTeks} numberOfLines={1}>
                            {hapusTarget?.jenis_motor}
                        </Text>
                        <View style={s.hapusMetaDot} />
                        <Feather name="clock" size={13} color={SUBTEXT} />
                        <Text style={s.hapusMetaTeks}>
                            {formatTanggal(hapusTarget?.created_at ?? '')}
                        </Text>
                    </View>

                    {/* Tombol aksi */}
                    <TouchableOpacity
                        style={s.tombolHapusKonfirmasi}
                        activeOpacity={0.85}
                        onPress={() => hapusTarget && hapusItem(getId(hapusTarget))}
                    >
                        <Feather name="trash-2" size={16} color="#fff" />
                        <Text style={s.tombolHapusKonfirmasiTeks}>Ya, hapus riwayat</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={s.tombolBatalHapus}
                        activeOpacity={0.7}
                        onPress={() => setModalHapusVisible(false)}
                    >
                        <Text style={s.tombolBatalHapusTeks}>Batal</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    container:    { flex: 1, backgroundColor: BACKGROUND },
    tengah:       { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    teksLoading:  { color: SUBTEXT, fontSize: 14 },
    list:         { padding: 16, paddingBottom: 40 },
    listKosong:   { flex: 1 },

    kartu: {
        backgroundColor: CARD, borderRadius: 16, padding: 16,
        marginBottom: 12, borderWidth: 1, borderColor: BORDER, gap: 10,
    },
    kartuAtas:    { flexDirection: 'row', alignItems: 'center' },
    ikonWrap:     {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center',
    },
    jenisMotor:   { fontSize: 14, fontWeight: '700', color: TEXT },
    tanggalRow:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    tanggal:      { fontSize: 12, color: SUBTEXT },
    hapusBtn:     { padding: 6 },

    hasilWrap:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
    kodeBadge:    {
        backgroundColor: CARD_BG, paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: 6, borderWidth: 1, borderColor: PRIMARY,
    },
    kodeTeks:     { color: PRIMARY, fontSize: 12, fontWeight: '700' },
    namaKerusakan: { color: TEXT, fontSize: 13, flex: 1 },
    persenTeks:   { fontSize: 13, fontWeight: '700' },
    tidakAda:     { color: SUBTEXT, fontSize: 13, fontStyle: 'italic' },
    lebihBanyak:  { color: PRIMARY, fontSize: 12 },

    // Lihat detail
    lihatDetailRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3,
        borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 8, marginTop: 2,
    },
    lihatDetailTeks: { color: PRIMARY, fontSize: 12, fontWeight: '600' },

    kosong:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
    teksKosong:   { fontSize: 16, fontWeight: '600', color: TEXT, marginTop: 16 },
    subKosong:    { fontSize: 13, color: SUBTEXT, textAlign: 'center', marginTop: 6, paddingHorizontal: 40 },

    // Modal
    overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    bottomSheet:  {
        backgroundColor: CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 20, maxHeight: '80%',
        position: 'absolute', bottom: 0, left: 0, right: 0,
    },
    handleBar:    {
        width: 40, height: 4, backgroundColor: BORDER,
        borderRadius: 2, alignSelf: 'center', marginBottom: 16,
    },
    modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    modalJudul:   { fontSize: 18, fontWeight: '700', color: TEXT },
    modalSubjudul: { fontSize: 13, color: SUBTEXT, marginTop: 2 },
    tombolTutup:  {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: BACKGROUND, alignItems: 'center', justifyContent: 'center',
    },
    modalTanggalRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    modalTanggal:    { fontSize: 13, color: SUBTEXT },
    divider:         { height: 1, backgroundColor: BORDER, marginBottom: 16 },
    labelHasil:      { fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: 12 },
    scrollHasil:     { maxHeight: 400 },

    kartuKerusakan: {
        backgroundColor: BACKGROUND, borderRadius: 12, padding: 14,
        marginBottom: 10, borderWidth: 1, borderColor: BORDER, gap: 8,
    },
    kerusakanHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
    nomorWrap:        {
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
    },
    nomorTeks:        { color: '#fff', fontSize: 12, fontWeight: '700' },
    kodeBadgeModal:   {
        backgroundColor: CARD_BG, paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: 6, borderWidth: 1, borderColor: PRIMARY,
    },
    persenBadge:      {
        color: '#fff', fontSize: 11, fontWeight: '700',
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden',
    },
    namaKerusakanModal: { fontSize: 14, fontWeight: '600', color: TEXT },
    progressBg:         { height: 6, backgroundColor: BORDER, borderRadius: 3 },
    progressFill:       { height: 6, borderRadius: 3 },
    labelKecocokan:     { fontSize: 11, color: SUBTEXT },

    tombolHapus: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginTop: 16, padding: 14, borderRadius: 12,
        borderWidth: 1, borderColor: '#FED7D7', backgroundColor: '#FFF5F5',
    },
    tombolHapusTeks: { color: '#E53E3E', fontWeight: '600', fontSize: 14 },

    // Modal konfirmasi hapus
    hapusSheet: {
        backgroundColor: CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: 36,
        position: 'absolute', bottom: 0, left: 0, right: 0,
        alignItems: 'center',
    },
    hapusIkonRing: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FED7D7',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
    },
    hapusJudul: {
        fontSize: 18, fontWeight: '700', color: TEXT,
        textAlign: 'center', marginBottom: 8,
    },
    hapusSubjudul: {
        fontSize: 13, color: SUBTEXT, textAlign: 'center',
        lineHeight: 20, marginBottom: 20,
    },
    hapusMetaBox: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: BACKGROUND, borderRadius: 12,
        paddingHorizontal: 16, paddingVertical: 12,
        borderWidth: 1, borderColor: BORDER,
        width: '100%', marginBottom: 24,
    },
    hapusMetaTeks: { fontSize: 12, color: SUBTEXT, flex: 1 },
    hapusMetaDot: {
        width: 3, height: 3, borderRadius: 1.5,
        backgroundColor: BORDER,
    },
    tombolHapusKonfirmasi: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#E53E3E', borderRadius: 14,
        padding: 15, width: '100%', marginBottom: 10,
    },
    tombolHapusKonfirmasiTeks: { color: '#fff', fontWeight: '700', fontSize: 15 },
    tombolBatalHapus: {
        padding: 14, width: '100%', alignItems: 'center',
        backgroundColor: BACKGROUND, borderRadius: 14,
        borderWidth: 1, borderColor: BORDER,
    },
    tombolBatalHapusTeks: { color: TEXT, fontWeight: '600', fontSize: 15 },
});
