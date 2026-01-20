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
import Plus from "@/components/svg/plus-symbol"
import DotsIcon from "@/components/svg/dots-symbol"
import { useTheme } from "@/contexts/ThemeContext"

import EmojiHubPicker from "@/components/emoji-select"

import ChevronRightIcon from "@/components/svg/chevronRight-symbol"
import WalletIcon from "@/components/svg/wallet-symbol"
import SettingsIcon from "@/components/svg/settings-symbol"
import LogoutIcon from "@/components/svg/logout-symbol"
import UsersIcon from "@/components/svg/user-symbol"

const ACCENT = "#A855F7"

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
    const [emoji, setEmoji] = useState("🐯")
    const [currency, setCurrency] = useState("EUR")

    const [optionsVisible, setOptionsVisible] = useState(false)
    const [open, setOpen] = useState(false)
    const [chosen, setChosen] = useState("")

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
                body: JSON.stringify({ userId, name, currency, icon: emoji }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error)
            }
            setName("")
            setCurrency("EUR")
            setCreateWalletVisible(false)
            await loadWallets()
        } catch (error: any) {
            Alert.alert("Error", error.message || "No se pudo crear la wallet")
        }
    }

    const handleLogout = async () => {
        setOptionsVisible(false)
        await AsyncStorage.removeItem("userId")
        await AsyncStorage.removeItem("token")
        router.push("/(auth)/login" as any)
    }

    const handleSettings = () => {
        setOptionsVisible(false)
        router.push("/(pages)/user" as any)
    }

    const totalBalance = wallets.reduce((acc, w) => acc + (w.balance || 0), 0)

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={styles.headerTitleWrapper}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Wallets</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        {wallets.length} {wallets.length === 1 ? "cuenta" : "cuentas"}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.headerBtn, { backgroundColor: colors.surface }]}
                    onPress={() => setOptionsVisible(!optionsVisible)}
                >
                    <DotsIcon color={colors.text} />
                </TouchableOpacity>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Powered by Nomad</Text>
                <Text style={[styles.summaryAmount, { color: colors.text }]}>
                    The Neon Wallet
                </Text>
            </View>

            <FlatList
                contentContainerStyle={styles.listContainer}
                data={wallets.filter((w) => !w.archived)}
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
                                    {item.users?.length > 1 && (
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
                        <View style={styles.emojiContainer}>

                            <TouchableOpacity onPress={() => setOpen(true)}>
                                <Text style={{ fontSize: 28 }}>{chosen || "🙂"}</Text>
                            </TouchableOpacity>
                            <EmojiHubPicker
                                visible={open}
                                onClose={() => setOpen(false)}
                                onEmojiSelected={(emoji) => {
                                    setChosen(emoji)
                                    setEmoji(emoji)
                                }}
                            />
                            <TextInput
                                placeholder="Ej: Gastos mensuales"
                                placeholderTextColor={colors.textTertiary}
                                value={name}
                                onChangeText={setName}
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.surface,
                                        color: colors.text,
                                        borderColor: colors.surfaceBorder,
                                        flex: 1,         // ocupa todo el espacio restante
                                        height: 48,      // igual altura que el emoji
                                        marginLeft: 12,  // separación entre emoji y input
                                    },
                                ]}
                            />
                        </View>


                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Moneda</Text>
                        <TouchableOpacity
                            style={[styles.selector, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
                            onPress={() => setCurrencyModalVisible(true)}
                        >
                            <Text style={styles.selectorFlag}>{getFlag(currency)}</Text>
                            <Text style={[styles.selectorText, { color: colors.text }]}>{currency}</Text>
                            <ChevronRightIcon color={colors.textTertiary} />
                        </TouchableOpacity>

                        <Text style={[styles.hintText, { color: colors.textTertiary }]}>
                            Puedes compartir la wallet con otros usuarios usando el icono de compartir
                        </Text>

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

            {optionsVisible && (
                <View style={[styles.optionsMenu, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                    <TouchableOpacity style={styles.optionItem} onPress={handleSettings}>
                        <SettingsIcon size={18} color={colors.text} />
                        <Text style={[styles.optionText, { color: colors.text }]}>Configuración</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionItem} onPress={handleLogout}>
                        <LogoutIcon size={18} color="#C62828" />
                        <Text style={[styles.optionText, { color: "#C62828" }]}>Cerrar sesión</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    headerTitleWrapper: {
        flex: 1,
    },
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

    emojiContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginBottom: 20,
    },


    selector: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    selectorFlag: { fontSize: 20 },
    selectorText: { flex: 1, fontSize: 16, fontWeight: "500" },

    hintText: { fontSize: 12, marginBottom: 24, textAlign: "center" },

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

    headerBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    optionsMenu: {
        position: "absolute",
        top: 110,
        right: 20,
        borderRadius: 14,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        minWidth: 180,
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 18,
    },
    optionText: { fontSize: 15, fontWeight: "500" },
})
