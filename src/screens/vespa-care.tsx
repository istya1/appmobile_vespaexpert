import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function VespaCare() {
    const navigation = useNavigation();

    const [modalVisible, setModalVisible] = useState(false);
    const [judul, setJudul] = useState("");
    const [tanggal, setTanggal] = useState(new Date());
    const [showDate, setShowDate] = useState(false);
    const [catatan, setCatatan] = useState("");

    const getStatus = () => {
        const today = new Date();
        const diff = Math.ceil((tanggal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diff > 7) return { text: "Aman", color: "#2ecc71" };
        if (diff > 2) return { text: "Warning", color: "#f1c40f" };
        return { text: "Bahaya", color: "#e74c3c" };
    };

    const status = getStatus();

    return (
        <View style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={26} color="#c9a227" />
                </TouchableOpacity>

                <View>
                    <Text style={styles.title}>Vespa Care</Text>
                    <Text style={styles.subtitle}>Pengingat Service Berkala</Text>
                </View>
            </View>

            {/* CARD INFO */}
            <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Perawatan Berkala</Text>
                <Text style={styles.cardText}>
                    Atur pengingat untuk service berkala Vespa Anda agar tetap dalam kondisi prima
                </Text>
            </View>

            {/* BUTTON TAMBAH */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.addButtonText}>+ Tambah Pengingat</Text>
            </TouchableOpacity>

            {/* LIST PENGINGAT */}
            <Text style={styles.sectionTitle}>Pengingat Mendatang</Text>

            <View style={styles.reminderCard}>
                <Text style={styles.reminderTitle}>Cek Tekanan Ban</Text>

                <Text style={styles.reminderDate}>
                    {tanggal.toLocaleDateString()}
                </Text>

                <Text style={styles.reminderNote}>{catatan || "Periksa tekanan angin ban"}</Text>

                <Text style={{ color: status.color, marginTop: 5 }}>
                    Status: {status.text}
                </Text>
            </View>

            {/* MODAL */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>

                        {/* HEADER MODAL */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Pengingat Baru</Text>

                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Judul Pengingat</Text>
                        <TextInput
                            placeholder="Contoh: Service Rutin"
                            placeholderTextColor="#999"
                            style={styles.input}
                            value={judul}
                            onChangeText={setJudul}
                        />

                        <Text style={styles.label}>Tanggal</Text>

                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setShowDate(true)}
                        >
                            <Text style={{ color: "#fff" }}>
                                {tanggal.toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>

                        {showDate && (
                            <DateTimePicker
                                value={tanggal}
                                mode="date"
                                onChange={(e, date) => {
                                    setShowDate(false);
                                    if (date) setTanggal(date);
                                }}
                            />
                        )}

                        <Text style={styles.label}>Catatan</Text>

                        <TextInput
                            placeholder="Catatan tambahan..."
                            placeholderTextColor="#999"
                            style={styles.input}
                            value={catatan}
                            onChangeText={setCatatan}
                        />

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.saveText}>Simpan</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0B0B",
        padding: 20,
    },

    title: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
    },

    subtitle: {
        color: "#aaa",
        marginBottom: 20,
    },

    infoCard: {
        backgroundColor: "#1a1a1a",
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#c9a227",
        marginBottom: 20,
    },

    cardTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },

    cardText: {
        color: "#bbb",
        marginTop: 5,
    },

    addButton: {
        backgroundColor: "#c9a227",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 20,
    },

    addButtonText: {
        fontWeight: "bold",
    },

    sectionTitle: {
        color: "#fff",
        fontSize: 18,
        marginBottom: 10,
    },

    reminderCard: {
        backgroundColor: "#1a0003",
        borderColor: "#ff0033",
        borderWidth: 1,
        padding: 16,
        borderRadius: 12,
    },

    reminderTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },

    reminderDate: {
        color: "#ccc",
        marginTop: 5,
    },

    reminderNote: {
        color: "#aaa",
    },

    overdue: {
        color: "#ff3b3b",
        marginTop: 5,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "#000000aa",
        justifyContent: "center",
        alignItems: "center",
    },

    modalBox: {
        width: "90%",
        backgroundColor: "#111",
        padding: 20,
        borderRadius: 16,
    },

    modalTitle: {
        color: "#ccc",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 30,
        marginTop: 20,
        marginBottom: 10,
    },

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },

    label: {
        color: "#ccc",
        marginTop: 10,
    },

    input: {
        borderWidth: 1,
        borderColor: "#444",
        padding: 10,
        borderRadius: 8,
        marginTop: 5,
        color: "#fff",
    },

    saveButton: {
        backgroundColor: "#c9a227",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },

    saveText: {
        fontWeight: "bold",
    },
});