import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import RiwayatDiagnosa from "./riwayat-diagnosis";
import RiwayatService from "./riwayat-service";


const PRIMARY = '#4A90E2';
const BACKGROUND = '#F9FAFB';
const CARD = '#FFFFFF';
const BORDER = '#E5E7EB';
const TEXT = '#111827';
const SUBTEXT = '#6B7280';

export default function RiwayatScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<"diagnosa" | "service">("diagnosa");

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY} />
        </TouchableOpacity>

        <View style={{ marginLeft: 12 }}>
          <Text style={styles.title}>Riwayat</Text>
          <Text style={styles.subtitle}>Histori Diagnosa & Ganti Oli</Text>
        </View>
      </View>

      {/* TAB SWITCH */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === "diagnosa" && styles.tabActive]}
          onPress={() => setTab("diagnosa")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "diagnosa" && styles.tabTextActive,
            ]}
          >
            Diagnosa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === "service" && styles.tabActive]}
          onPress={() => setTab("service")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "service" && styles.tabTextActive,
            ]}
          >
            Ganti Oli
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {tab === "diagnosa" ? <RiwayatDiagnosa /> : <RiwayatService />}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  header: {
  flexDirection: "row",
  alignItems: "center",
  paddingTop: 20,
  paddingHorizontal: 16,
  paddingBottom: 16,
  backgroundColor: CARD,
  borderBottomWidth: 1,
  borderBottomColor: BORDER,
},

  title: {
    fontSize: 26,
    color: TEXT,
    fontWeight: "bold",
  },

  subtitle: {
    color: SUBTEXT,
    fontSize: 14,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#EEF2FF",
    marginHorizontal: 20,
    borderRadius: 30,
    padding: 4,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
  },

  tabActive: {
    backgroundColor: PRIMARY,
  },

  tabText: {
    color: SUBTEXT,
    fontWeight: "600",
  },

  tabTextActive: {
    color: "#FFFFFF",
  },
});