// src/screens/RiwayatService.tsx
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
// import ServiceService from '../services/service'; // sesuaikan dengan API kamu

interface ServiceItem {
    id: number;
    tanggal: string;
    km: number;
    jenis_motor: string;
    lokasi: string;
    items: string[];
    total_biaya: number;
}

export default function RiwayatService() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadServices();
        }, [])
    );

    const loadServices = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            // Ganti dengan panggilan API real
            // const data = await ServiceService.getRiwayatService();
            const mockData: ServiceItem[] = [
                {
                    id: 1,
                    tanggal: '10 Feb 2026',
                    km: 5000,
                    jenis_motor: 'Vespa Smart',
                    lokasi: 'Madiun',
                    items: [
                        'Ganti Oli Mesin',
                        'Ganti Filter Udara',
                        'Cek Rem Udara',
                        'Cek Ban',
                    ],
                    total_biaya: 350000,
                },
                // tambahkan data lain jika perlu untuk testing
            ];
            setServices(mockData);
        } catch (error) {
            console.error('Gagal load service:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const formatRupiah = (amount: number) =>
        `Rp ${amount.toLocaleString('id-ID')}`;

    const renderItem = ({ item }: { item: ServiceItem }) => (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <View style={styles.iconCircle}>
                    <Text style={styles.icon}>🛠️</Text>
                </View>
                <Text style={styles.tanggal}>{item.tanggal}</Text>
            </View>

            <Text style={styles.km}>{item.km.toLocaleString()} KM</Text>
            <Text style={styles.motor}>{item.jenis_motor}</Text>
            <Text style={styles.lokasi}>{item.lokasi}</Text>

            <View style={styles.itemsContainer}>
                {item.items.map((serv, index) => (
                    <Text key={index} style={styles.item}>
                        ✓ {serv}
                    </Text>
                ))}
            </View>

            <View style={styles.footer}>
                <Text style={styles.totalLabel}>Total Biaya</Text>
                <Text style={styles.total}>{formatRupiah(item.total_biaya)}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#D4AF37" />
                <Text style={styles.loadingText}>Memuat riwayat service...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={services}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadServices(true)}
                        tintColor="#D4AF37"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Belum ada riwayat service</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A0A' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#aaa', marginTop: 16, fontSize: 15 },
    listContent: { padding: 16, paddingBottom: 40 },
    card: {
        backgroundColor: "#1A1A1A",
        borderRadius: 18,
        padding: 18,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: "#3A2E12"
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#D4AF37',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: { fontSize: 22 },
    tanggal: { color: '#D4AF37', fontSize: 16, fontWeight: '700' },
    km: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    motor: { color: '#D4AF37', fontSize: 15, marginBottom: 4 },
    lokasi: { color: '#aaaaaa', fontSize: 14, marginBottom: 12 },
    itemsContainer: { marginBottom: 16 },
    item: { color: '#FFFFFF', fontSize: 14, marginBottom: 6 },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#2A2A2A',
        paddingTop: 12,
    },
    totalLabel: { color: '#aaaaaa', fontSize: 14 },
    total: { color: '#D4AF37', fontSize: 18, fontWeight: '700' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 120 },
    emptyText: { color: '#888', fontSize: 16 },
});