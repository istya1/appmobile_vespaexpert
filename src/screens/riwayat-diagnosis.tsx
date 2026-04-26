// src/screens/RiwayatDiagnosa.tsx
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import DiagnosaService from '../services/diagnosa'; // sesuaikan path

const PRIMARY = '#4A90E2';
const BACKGROUND = '#F9FAFB';
const CARD = '#FFFFFF';
const BORDER = '#E5E7EB';
const TEXT = '#111827';
const SUBTEXT = '#6B7280';

interface RiwayatItem {
    id?: number;
    id_diagnosa?: number;
    jenis_motor: string;
    created_at: string;
    hasil_diagnosis: {
        nama_kerusakan: string;
        kode_kerusakan: string;
        persentase_kecocokan: number;
    }[];
}

export default function RiwayatDiagnosa() {
    const [riwayat, setRiwayat] = useState<RiwayatItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

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
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const konfirmasiHapus = (id: number) => {
        Alert.alert('Hapus Riwayat', 'Yakin ingin menghapus?', [
            { text: 'Batal', style: 'cancel' },
            { text: 'Hapus', style: 'destructive', onPress: () => hapusItem(id) },
        ]);
    };

    const hapusItem = async (id: number) => {
        try {
            await DiagnosaService.hapusRiwayatDiagnosis(id);
            setRiwayat((prev) => prev.filter((item) => getId(item) !== id));
        } catch (error) {
            Alert.alert('Error', 'Gagal menghapus riwayat.');
        }
    };

    const formatTanggal = (dateString: string) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const renderItem = ({ item }: { item: RiwayatItem }) => {
        const kerusakanUtama = item.hasil_diagnosis?.[0];
        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
            // onPress={() => navigation.navigate('DetailRiwayat', { riwayat: item })}
            >
                <View style={styles.cardTopRow}>
                    <Text style={styles.jenisMotor}>{item.jenis_motor}</Text>
                    <TouchableOpacity
                        style={styles.hapusButton}
                        onPress={() => konfirmasiHapus(getId(item))}
                    >
                        <Feather name="trash-2" size={20} color={SUBTEXT} />
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: "row" }}>
                    <View style={{ flex: 1 }}>

                        {kerusakanUtama ? (
                            <View style={styles.kerusakanRow}>
                                <View style={styles.kodeBadge}>
                                    <Text style={styles.kodeText}>
                                        {kerusakanUtama.kode_kerusakan}
                                    </Text>
                                </View>

                                <Text style={styles.namaKerusakan} numberOfLines={1}>
                                    {kerusakanUtama.nama_kerusakan}
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.tidakDitemukan}>
                                Tidak ada diagnosis final
                            </Text>
                        )}

                        {item.hasil_diagnosis?.length > 1 && (
                            <Text style={styles.lebihBanyak}>
                                +{item.hasil_diagnosis.length - 1} kerusakan lain
                            </Text>
                        )}

                        <View style={styles.footerRow}>
                            <View style={styles.clockRow}>
                                <Feather name="clock" size={14} color={PRIMARY} />
                                <Text style={styles.tanggal}>
                                    {formatTanggal(item.created_at)}
                                </Text>
                            </View>
                        </View>

                    </View>

                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#D4AF37" />
                <Text style={styles.loadingText}>Memuat riwayat...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={riwayat}
                renderItem={renderItem}
                keyExtractor={(item, index) => (getId(item) || index).toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadRiwayat(true)}
                        tintColor={PRIMARY}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Belum ada riwayat diagnosis</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BACKGROUND },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BACKGROUND, },
    loadingText: { color: '#aaa', marginTop: 16, fontSize: 15 },
    listContent: { padding: 16, paddingBottom: 40 },
    card: {
        backgroundColor: CARD,
        borderRadius: 18,
        padding: 28,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: BORDER,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    jenisMotor: { color: PRIMARY, fontSize: 16, fontWeight: '700' },
    hapusButton: { padding: 6 },
    kerusakanRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    kodeBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 10,
        borderWidth: 1,
        borderColor: PRIMARY,
    },
    kodeText: { color: PRIMARY, fontSize: 13, fontWeight: 'bold' },
    namaKerusakan: { color: TEXT, fontSize: 15, flex: 1 },
    tidakDitemukan: { color: SUBTEXT, fontSize: 14, fontStyle: 'italic' },
    lebihBanyak: { color: SUBTEXT, fontSize: 13, marginBottom: 10 },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    clockRow: { flexDirection: 'row', alignItems: 'center' },
    tanggal: { color: PRIMARY, fontSize: 13, marginLeft: 6 },
    status: {
        color: PRIMARY,
        borderWidth: 1,
        borderColor: PRIMARY,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        fontSize: 12
    },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyText: { color: SUBTEXT, fontSize: 16 },
});