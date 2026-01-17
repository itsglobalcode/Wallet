"use client"

import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, Switch } from "react-native"
import { useRouter } from "expo-router"
import { useTheme } from "@/contexts/ThemeContext"
import { useEffect, useState } from "react"
import Svg, { Path, Circle } from "react-native-svg"
import AsyncStorage from "@react-native-async-storage/async-storage"

const ACCENT = "#A855F7"

const ArrowLeftIcon = ({ size = 22, color = "#000" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const MoonIcon = ({ size = 20, color = "#000" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

const SunIcon = ({ size = 20, color = "#000" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2" />
    <Path
      d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
)

const InfoIcon = ({ size = 20, color = "#000" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M12 16v-4M12 8h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
)

export default function UserSettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme()
  const router = useRouter()
  const [userName, setUserName] = useState("Usuario")

  useEffect(() => {
    const loadUserData = async () => {
      const storedName = await AsyncStorage.getItem("userName")
      if (storedName) setUserName(storedName)
    }
    loadUserData()
  }, [])

  const handleThemeToggle = () => {
    toggleTheme()
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.headerBtn, { backgroundColor: colors.surface }]}>
          <ArrowLeftIcon color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Configuración</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Perfil</Text>
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.avatarText}>{userName?.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
              <Text style={[styles.userEmail, { color: colors.textTertiary }]}>NeonWallet User</Text>
            </View>
          </View>
        </View>

        {/* Theme Settings */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Apariencia</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              {isDark ? <MoonIcon size={20} color={ACCENT} /> : <SunIcon size={20} color={ACCENT} />}
              <View style={styles.settingTextWrapper}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {isDark ? "Tema Oscuro" : "Tema Claro"}
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textTertiary }]}>
                  {isDark ? "Modo oscuro activado" : "Modo claro activado"}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleThemeToggle}
              trackColor={{ false: colors.surface, true: ACCENT }}
              thumbColor={isDark ? "#fff" : colors.text}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Acerca de</Text>
          <View style={[styles.infoBox, { backgroundColor: `${ACCENT}10`, borderColor: `${ACCENT}30` }]}>
            <InfoIcon size={20} color={ACCENT} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoBrand, { color: colors.text }]}>NeonWallet</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Tu solución de billetera digital moderna con funcionalidades avanzadas para gestionar tus finanzas.
              </Text>
              <Text style={[styles.infoPowered, { color: ACCENT }]}>Powered by Nomad</Text>
            </View>
          </View>
        </View>

        {/* Nomad Info */}
        <View style={[styles.nomadSection, { backgroundColor: `${ACCENT}10`, borderColor: `${ACCENT}30` }]}>
          <Text style={[styles.nomadTitle, { color: colors.text }]}>Sobre Nomad</Text>
          <Text style={[styles.nomadText, { color: colors.textSecondary }]}>
            Nomad es una plataforma innovadora diseñada para viajeros y personas que manejan múltiples monedas. Con
            herramientas de gestión de gastos inteligentes, conversión de monedas en tiempo real y wallets compartidas,
            Nomad te ayuda a mantener un control total de tus finanzas dondequiera que estés.
          </Text>
          <Text style={[styles.nomadFeatures, { color: colors.text }]}>
            ✓ Gestión de múltiples wallets{"\n"}✓ Conversión de monedas en tiempo real{"\n"}✓ Wallets compartidas{"\n"}✓
            Seguimiento de gastos detallado{"\n"}✓ Interfaz intuitiva y moderna
          </Text>
        </View>

        {/* Version Info */}
        <View style={styles.versionBox}>
          <Text style={[styles.versionText, { color: colors.textTertiary }]}>NeonWallet v1.0.0</Text>
          <Text style={[styles.versionSubtext, { color: colors.textTertiary }]}>© 2026 Powered by Nomad</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 20,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#A855F7",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingTextWrapper: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
  },
  infoBox: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  infoContent: {
    flex: 1,
  },
  infoBrand: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  infoPowered: {
    fontSize: 12,
    fontWeight: "600",
  },
  nomadSection: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  nomadTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  nomadText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  nomadFeatures: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
  },
  versionBox: {
    alignItems: "center",
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 13,
    fontWeight: "500",
  },
  versionSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
})
