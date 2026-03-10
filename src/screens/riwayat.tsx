import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import RiwayatDiagnosa from "./riwayat-diagnosis";
import RiwayatService from "./riwayat-service";

export default function RiwayatScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<"diagnosa" | "service">("diagnosa");

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>

        <View style={{ marginLeft: 12 }}>
          <Text style={styles.title}>Riwayat</Text>
          <Text style={styles.subtitle}>Histori Diagnosa & Service</Text>
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
            Service
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
    backgroundColor: "#0A0A0A",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 30,
    paddingHorizontal: 10,
    paddingBottom: 30,
  },

  title: {
    fontSize: 26,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  subtitle: {
    color: "#888",
    fontSize: 14,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
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
    backgroundColor: "#D4AF37",
  },

  tabText: {
    color: "#888",
    fontWeight: "600",
  },

  tabTextActive: {
    color: "#000",
  },
});