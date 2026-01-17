"use client"

import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native"
import { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import Plus from "@/components/ui/plus-symbol"
import Options from "@/components/options"
import { useTheme } from "@/contexts/ThemeContext"
import Svg, { Path, Circle } from "react-native-svg"

const ACCENT = "#FF6B35"

const ChevronRightIcon = ({ size = 18, color = "#ccc" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const WalletIcon = ({ size = 22, color = "#000" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 7h-1V6a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3zM5 5h10a1 1 0 0 1 1 1v1H5a1 1 0 0 1 0-2zm15 11h-3a2 2 0 0 1 0-4h3v4z"
      fill={color}
    />
  </Svg>
)

const UsersIcon = ({ size = 14, color = "#999" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" />
    <Path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke={color} strokeWidth="2" />
    <Path
      d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
)

const CURRENCY_FLAGS: Record<string, string> = {
  EUR: "🇪🇺",
  USD: "🇺🇸",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  CHF: "🇨🇭",
  CAD: "🇨🇦",
  AUD: "🇦🇺",
  NZD: "🇳🇿",
  CNY: "🇨🇳",
  MXN: "🇲🇽",
  BRL: "🇧🇷",
}

const getFlag = (currency: string) => {
  const code = currency.split(" ")[0]
  return CURRENCY_FLAGS[code] || "💰"
}

export default function WalletsScreen() {
  const { colors } = useTheme()
  const [wallets, setWallets] = useState<any[]>([])
  const [createWalletVisible, setCreateWalletVisible] = useState(false)
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false)

  const [name, setName] = useState("")
  const [currency, setCurrency] = useState("EUR")
  const [type, setType] = useState("personal")

  const router = useRouter()

  const loadWallets = async () => {
    const userId = await AsyncStorage.getItem("userId")
    if (!userId) return
    const res = await fetch(`http://localhost:3000/api/wallet/check_wallets?userId=${userId}`)
    const data = await res.json()
    setWallets(data.wallets || [])
  }

  useEffect(() => {
    loadWallets()
  }, [])

  const addWallet = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre es obligatorio")
      return
    }
    try {
      const userId = await AsyncStorage.getItem("userId")
      const res = await fetch(`http://localhost:3000/api/wallet/wallets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name, currency, icon: "wallet", type }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      setName("")
      setCurrency("EUR")
      setType("personal")
      setCreateWalletVisible(false)
      await loadWallets()
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo crear la wallet")
    }
  }

  const totalBalance = wallets.reduce((acc, w) => acc + (w.balance || 0), 0)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Wallets</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {wallets.length} {wallets.length === 1 ? "cuenta" : "cuentas"}
        </Text>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Balance total</Text>
        <Text style={[styles.summaryAmount, { color: colors.text }]}>
          {totalBalance.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
          <Text style={[styles.summaryCurrency, { color: colors.textTertiary }]}> €</Text>
        </Text>
      </View>

      <FlatList
        contentContainerStyle={styles.listContainer}
        data={wallets.filter(w => !w.archived)}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.walletCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}
            onPress={() => router.push(`/wallet?id=${item._id}` as any)}
            activeOpacity={0.7}
          >
            <View style={styles.walletLeft}>
              <Text style={styles.walletFlag}>{getFlag(item.currency)}</Text>
              <View>
                <Text style={[styles.walletName, { color: colors.text }]}>{item.name}</Text>
                <View style={styles.walletMeta}>
                  <Text style={[styles.walletCurrency, { color: colors.textTertiary }]}>{item.currency}</Text>
                  {item.type === "shared" && (
                    <View style={styles.sharedBadge}>
                      <UsersIcon size={12} color={colors.textTertiary} />
                    </View>
                  )}
                </View>
              </View>
            </View>
            <ChevronRightIcon color={colors.textTertiary} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <WalletIcon size={40} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sin wallets</Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>Toca + para crear una</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: ACCENT }]}
        onPress={() => setCreateWalletVisible(true)}
        activeOpacity={0.9}
      >
        <Plus color="#fff" />
      </TouchableOpacity>

      <Modal visible={createWalletVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.textTertiary }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Nueva Wallet</Text>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nombre</Text>
            <TextInput
              placeholder="Ej: Gastos mensuales"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              style={[
                styles.input,
                { backgroundColor: colors.surface, color: colors.text, borderColor: colors.surfaceBorder },
              ]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Moneda</Text>
            <TouchableOpacity
              style={[styles.selector, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
              onPress={() => setCurrencyModalVisible(true)}
            >
              <Text style={styles.selectorFlag}>{getFlag(currency)}</Text>
              <Text style={[styles.selectorText, { color: colors.text }]}>{currency}</Text>
              <ChevronRightIcon color={colors.textTertiary} />
            </TouchableOpacity>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Tipo</Text>
            <View style={styles.typeRow}>
              {["personal", "shared"].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeOption,
                    { backgroundColor: colors.surface, borderColor: type === t ? ACCENT : colors.surfaceBorder },
                  ]}
                  onPress={() => setType(t)}
                >
                  <View style={[styles.radioOuter, { borderColor: type === t ? ACCENT : colors.textTertiary }]}>
                    {type === t && <View style={[styles.radioInner, { backgroundColor: ACCENT }]} />}
                  </View>
                  <Text style={[styles.typeText, { color: colors.text }]}>
                    {t === "personal" ? "Personal" : "Compartida"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateWalletVisible(false)}>
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: ACCENT }]} onPress={addWallet}>
                <Text style={styles.confirmBtnText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Currency modal */}
      <Modal visible={currencyModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.textTertiary }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Moneda</Text>
            <ScrollView style={styles.currencyList} showsVerticalScrollIndicator={false}>
              {Object.entries(CURRENCY_FLAGS).map(([code, flag]) => (
                <TouchableOpacity
                  key={code}
                  style={[styles.currencyItem, currency === code && { backgroundColor: `${ACCENT}10` }]}
                  onPress={() => {
                    setCurrency(code)
                    setCurrencyModalVisible(false)
                  }}
                >
                  <Text style={styles.currencyItemFlag}>{flag}</Text>
                  <Text style={[styles.currencyItemCode, { color: colors.text }]}>{code}</Text>
                  {currency === code && <View style={[styles.checkDot, { backgroundColor: ACCENT }]} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setCurrencyModalVisible(false)}>
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Options />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 8 },
  headerTitle: { fontSize: 32, fontWeight: "700", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, marginTop: 4 },

  summaryCard: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  summaryLabel: { fontSize: 13, fontWeight: "500", marginBottom: 8 },
  summaryAmount: { fontSize: 36, fontWeight: "700", letterSpacing: -1 },
  summaryCurrency: { fontSize: 24, fontWeight: "400" },

  listContainer: { paddingHorizontal: 20, paddingBottom: 140 },

  walletCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  walletLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  walletFlag: { fontSize: 28 },
  walletName: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  walletMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  walletCurrency: { fontSize: 13 },
  sharedBadge: { opacity: 0.6 },

  emptyState: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "500" },
  emptySubtext: { fontSize: 14 },

  addButton: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalContainer: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 24 },

  inputLabel: { fontSize: 12, fontWeight: "600", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, marginBottom: 20 },

  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  selectorFlag: { fontSize: 20 },
  selectorText: { flex: 1, fontSize: 16, fontWeight: "500" },

  typeRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  typeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  typeText: { fontSize: 15, fontWeight: "500" },

  modalActions: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 16, alignItems: "center" },
  cancelBtnText: { fontSize: 16, fontWeight: "600" },
  confirmBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  confirmBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  currencyList: { maxHeight: 300, marginBottom: 16 },
  currencyItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 10, marginBottom: 4 },
  currencyItemFlag: { fontSize: 24 },
  currencyItemCode: { flex: 1, fontSize: 16, fontWeight: "500" },
  checkDot: { width: 8, height: 8, borderRadius: 4 },
})
