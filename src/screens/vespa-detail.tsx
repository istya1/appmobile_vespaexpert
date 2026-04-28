import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import VespaPediaService, { VespaPediaItem } from '../services/vespa-pedia-service';

const { width } = Dimensions.get('window');
const PRIMARY = '#4A90E2';
const BACKGROUND = '#F9FAFB';
const CARD = '#FFFFFF';
const BORDER = '#E5E7EB';
const TEXT = '#111827';
const SUBTEXT = '#6B7280';

const VespaDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { jenisMotor } = route.params as { jenisMotor: string };

    const [vespaData, setVespaData] = useState<VespaPediaItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVespaDetail();
    }, []);

    const fetchVespaDetail = async () => {
        try {
            setLoading(true);
            const data = await VespaPediaService.getDetail(jenisMotor);
            setVespaData(data);
        } catch (error) {
            console.error('Error fetching detail:', error);
        } finally {
            setLoading(false);
        }
    };

    // Group by kategori
    const groupedData = vespaData.reduce((acc, item) => {
        if (!acc[item.kategori]) {
            acc[item.kategori] = [];
        }
        acc[item.kategori].push(item);
        return acc;
    }, {} as Record<string, VespaPediaItem[]>);

    // Get pengenalan data (untuk header)
    const pengenalanData = vespaData.find(item => item.kategori === 'Pengenalan');

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={TEXT} />
                <Text style={styles.loadingText}>Memuat detail...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={TEXT} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Vespa</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* IMAGE */}
                {pengenalanData?.gambar_url && (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: pengenalanData.gambar_url }}
                            style={styles.image}
                            resizeMode="cover"
                            onError={(e) => {
                                console.log('Image load error:', pengenalanData.gambar_url);
                            }}
                        />
                        <View style={styles.imageOverlay} />
                    </View>
                )}

                {/* CONTENT */}
                <View style={styles.content}>
                    <Text style={styles.name}>{jenisMotor}</Text>

                    {/* PENGENALAN */}
                    {groupedData['Pengenalan'] && (
                        <View style={styles.section}>
                            {groupedData['Pengenalan'].map((item) => (
                                <Text key={item.id} style={styles.description}>{item.konten}</Text>
                            ))}
                        </View>
                    )}

                    {/* SPESIFIKASI */}
                    {groupedData['Spesifikasi'] && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Spesifikasi</Text>
                            {groupedData['Spesifikasi'].map((item) => (
                                <View key={item.id} style={styles.specCard}>
                                    <Text style={styles.specTitle}>{item.judul}</Text>
                                    <Text style={styles.specContent}>{item.konten}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* KEUNGGULAN */}
                    {groupedData['Keunggulan'] && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Keunggulan</Text>
                            {groupedData['Keunggulan'].map((item) => (
                                <View key={item.id} style={styles.featureCard}>
                                    <MaterialCommunityIcons name="check-circle" size={20} color={PRIMARY} />
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.featureTitle}>{item.judul}</Text>
                                        <Text style={styles.featureContent}>{item.konten}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* TIPS */}
                    {groupedData['Tips'] && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Tips</Text>
                            {groupedData['Tips'].map((item) => (
                                <View key={item.id} style={styles.tipCard}>
                                    <MaterialCommunityIcons name="lightbulb-outline" size={20} color={PRIMARY} />
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.tipTitle}>{item.judul}</Text>
                                        <Text style={styles.tipContent}>{item.konten}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default VespaDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: BACKGROUND,
    },
    loadingText: {
        color: SUBTEXT,
        marginTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 15,
        backgroundColor: CARD,
        borderBottomColor: BORDER,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: TEXT,
    },
    imageContainer: {
        width: '100%',
        height: width * 0.75,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    content: {
        padding: 20,
    },
    name: {
        fontSize: 28,
        fontWeight: '700',
        color: TEXT,
        marginBottom: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: TEXT,
        marginBottom: 15,
    },
    description: {
    fontSize: 14,
    color: SUBTEXT,
    lineHeight: 22,
    marginBottom: 10,
    textAlign: 'justify', 
},
    specCard: {
        backgroundColor: CARD,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: PRIMARY,
        borderWidth: 1,
        borderColor: BORDER,
    },
    specTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: TEXT,
        marginBottom: 8,
    },
    specContent: {
        fontSize: 13,
        color: SUBTEXT,
        lineHeight: 20,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: CARD,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: BORDER,
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: TEXT,
        marginBottom: 6,
    },
    featureContent: {
        fontSize: 13,
        color: SUBTEXT,
        lineHeight: 20,
    },
    tipCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: PRIMARY,
    },
    tipTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: TEXT,
        marginBottom: 6,
    },
    tipContent: {
        fontSize: 13,
        color: SUBTEXT,
        lineHeight: 20,
    },
});