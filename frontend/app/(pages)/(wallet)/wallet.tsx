"use client"

import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    StyleSheet,
    ActivityIndicator,
    Modal,
    TextInput,
    Animated,
} from "react-native"
import { useEffect, useState, useRef } from "react"
import { useLocalSearchParams, useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Plus from "@/components/svg/plus-symbol"
import { useTheme } from "@/contexts/ThemeContext"
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg"

import DotsIcon from "@/components/svg/dots-symbol"
import ArrowLeftIcon from "@/components/svg/arrow-left"
import ChevronDownIcon from "@/components/svg/chevronDown-symbol"
import SwapIcon from "@/components/svg/swap-symbol"
import GlobeIcon from "@/components/svg/globe-symbol"
import ShareUserIcon from "@/components/svg/share-user-symbol"
import SettingsIcon from "@/components/svg/settings-symbol"
import TrashIcon from "@/components/svg/trash-icon"

const API_URL = process.env.EXPO_PUBLIC_API_URL

const USERS_API = `${API_URL}/api/search`
const WALLET_API = `${API_URL}/api/wallet`
const CURRENCY_API = `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${process.env.EXPO_PUBLIC_CURRENCY_API_KEY}`

type Tab = "movimientos" | "saldos" | "conversor"

const ACCENT = "#A855F7"

const CURRENCIES = [
    { code: "USD", name: "Dólar", flag: "🇺🇸" },
    { code: "EUR", name: "Euro", flag: "🇪🇺" },
    { code: "GBP", name: "Libra", flag: "🇬🇧" },
    { code: "JPY", name: "Yen", flag: "🇯🇵" },
    { code: "CHF", name: "Franco", flag: "🇨🇭" },
    { code: "CAD", name: "Dólar CA", flag: "🇨🇦" },
    { code: "AUD", name: "Dólar AU", flag: "🇦🇺" },
    { code: "CNY", name: "Yuan", flag: "🇨🇳" },
    { code: "MXN", name: "Peso MX", flag: "🇲🇽" },
    { code: "BRL", name: "Real", flag: "🇧🇷" },
]

const getCurrency = (code: string) => CURRENCIES.find((c) => c.code === code) || { code, name: code, flag: "🌍" }

export default function WalletDetailScreen() {
    const { colors } = useTheme()
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()

    const [activeTab, setActiveTab] = useState<Tab>("movimientos")
    const [wallet, setWallet] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any | null>(null)
    const [movements, setMovements] = useState<any[]>([])
    const [balances, setBalances] = useState<any[]>([])
    const [optionsVisible, setOptionsVisible] = useState(false)
    const [showAddFriendModal, setShowAddFriendModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [editName, setEditName] = useState("")
    const [editCurrency, setEditCurrency] = useState("")
    const [editBudget, setEditBudget] = useState("")
    const [search, setSearch] = useState("")
    const [users, setUsers] = useState<any[]>([])
    const [selectedUser, setSelectedUser] = useState<any | null>(null)
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [posting, setPosting] = useState(false)

    const [rates, setRates] = useState<Record<string, string>>({})
    const [ratesLoading, setRatesLoading] = useState(false)
    const [converterAmount, setConverterAmount] = useState("100")
    const [fromCurrency, setFromCurrency] = useState("USD")
    const [toCurrency, setToCurrency] = useState("EUR")
    const [travelMode, setTravelMode] = useState(false)
    const [homeCurrency, setHomeCurrency] = useState("EUR")
    const [localCurrency, setLocalCurrency] = useState("JPY")
    const [showFromPicker, setShowFromPicker] = useState(false)
    const [showToPicker, setShowToPicker] = useState(false)
    const rotateAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        const loadUserId = async () => {
            const userId = await AsyncStorage.getItem("userId")
            if (!userId) return
            setUser(userId)
        }
        loadUserId()
        if (!id) return
        loadData()
        fetchRates()
    }, [id])

    const fetchRates = async () => {
        try {
            setRatesLoading(true)
            const res = await fetch(CURRENCY_API)
            const data = await res.json()
            setRates(data.rates || {})
        } catch (err) {
            console.error(err)
        } finally {
            setRatesLoading(false)
        }
    }

    const convertAmount = (amount: number, from: string, to: string) => {
        if (!rates[from] || !rates[to]) return 0
        const fromRate = Number.parseFloat(rates[from])
        const toRate = Number.parseFloat(rates[to])
        return (amount / fromRate) * toRate
    }

    const getExchangeRate = (from: string, to: string) => {
        if (!rates[from] || !rates[to]) return 0
        return Number.parseFloat(rates[to]) / Number.parseFloat(rates[from])
    }

    const swapCurrencies = () => {
        Animated.sequence([
            Animated.timing(rotateAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(rotateAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]).start()
        setFromCurrency(toCurrency)
        setToCurrency(fromCurrency)
    }

    const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] })

    const loadData = async () => {
        if (!id) return
        setLoading(true)
        try {
            const userId = await AsyncStorage.getItem("userId")
            if (!userId) return
            const walletRes = await fetch(`${WALLET_API}/get-wallet?id=${id}`)
            const walletData = await walletRes.json()
            setWallet(walletData)
            if (walletData.currency) {
                setToCurrency(walletData.currency)
                setHomeCurrency(walletData.currency)
            }
            const movementsRes = await fetch(`${WALLET_API}/wallet/${id}/movements`)
            const movementsData = await movementsRes.json()
            setMovements(movementsData.movements || [])

            // Calcular saldos correctamente para wallets compartidas
            const balanceMap: Record<string, any> = {}

            // Identificar transferencias (tienen flechas → o ← en las notas)
            const isTransfer = (m: any) => m.notes && (m.notes.includes("→") || m.notes.includes("←"))

            // Primero, calcular cuánto ha pagado cada usuario (solo gastos reales, no transferencias)
            movementsData.movements.forEach((m: any) => {
                const uid = m.user._id
                if (!balanceMap[uid]) {
                    balanceMap[uid] = {
                        userId: uid,
                        name: m.user.name || "Usuario",
                        paid: 0,
                        received: 0,
                        transferAdjustment: 0
                    }
                }

                // Si es una transferencia, ajustar el saldo directamente
                if (isTransfer(m)) {
                    if (m.type === "expense") {
                        // El que envía dinero reduce su deuda (paga)
                        balanceMap[uid].transferAdjustment += m.amount
                    } else if (m.type === "income") {
                        // El que recibe dinero aumenta su deuda (debe más o le deben menos)
                        balanceMap[uid].transferAdjustment -= m.amount
                    }
                } else {
                    // Solo contar gastos e ingresos que NO sean transferencias
                    if (m.type === "expense") {
                        balanceMap[uid].paid += m.amount
                    } else if (m.type === "income") {
                        balanceMap[uid].received += m.amount
                    }
                }
            })

            // Calcular el total de gastos REALES (excluyendo transferencias)
            const totalExpensesForBalance = movementsData.movements
                .filter((m: any) => m.type === "expense" && !isTransfer(m))
                .reduce((acc: number, m: any) => acc + m.amount, 0)

            // Número de usuarios en la wallet
            const numUsers = Object.keys(balanceMap).length

            // Calcular lo que cada usuario debería haber pagado (parte justa)
            const fairShare = numUsers > 0 ? totalExpensesForBalance / numUsers : 0

            // Calcular el saldo de cada usuario
            const balancesArray = Object.values(balanceMap).map((user: any) => {
                // Saldo = lo que pagó - lo que debería haber pagado + ajustes de transferencias
                // Si es negativo: debe dinero (rojo)
                // Si es positivo: le deben dinero (verde)
                const balance = user.paid - fairShare + user.transferAdjustment

                return {
                    userId: user.userId,
                    name: user.name,
                    balance: balance
                }
            })

            setBalances(balancesArray)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const searchUsers = async (text: string) => {
        setSearch(text)
        setSelectedUser(null)
        const userId = await AsyncStorage.getItem("userId")
        if (text.length < 2) {
            setUsers([])
            return
        }
        try {
            setLoadingUsers(true)
            const res = await fetch(`${USERS_API}/users?query=${text}&id={userId}`)
            const data = await res.json()
            setUsers(data.users || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingUsers(false)
        }
    }

    const addUserToWallet = async () => {
        if (!selectedUser) return
        try {
            setPosting(true)
            await fetch(`${WALLET_API}/invite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletId: id, userId: selectedUser._id, inviteId: user }),
            })
            setShowAddFriendModal(false)
            setSearch("")
            setUsers([])
            setSelectedUser(null)
        } catch (err) {
            console.error(err)
        } finally {
            setPosting(false)
        }
    }

    const handleEditWallet = () => {
        setEditName(wallet?.name || "")
        setEditCurrency(wallet?.currency || "EUR")
        setEditBudget(wallet?.budget?.toString() || "")
        setOptionsVisible(false)
        setShowEditModal(true)
    }

    const saveWalletChanges = async () => {
        try {
            await fetch(`${WALLET_API}/edit-wallet`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, name: editName, currency: editCurrency, budget: editBudget }),
            })
        } catch (err) {
            console.error(err)
        }
        setShowEditModal(false)
        await loadData()
    }

    const handleDeleteWallet = () => {
        setOptionsVisible(false)
        setShowDeleteModal(true)
    }

    const confirmDeleteWallet = async () => {
        try {
            await fetch(`${WALLET_API}/delete-wallet`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            })
        } catch (err) {
            console.error(err)
        }
        setShowDeleteModal(false)
        router.push("/wallets")
    }

    const totalBalance = movements.reduce((acc, m) => acc + (m.type === "expense" ? -m.amount : m.amount), 0)

    const totalExpenses = movements.filter((m) => m.type === "expense").reduce((acc, m) => acc + m.amount, 0)

    if (loading) {
        return (
            <SafeAreaView style={[styles.loading, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.textTertiary} />
            </SafeAreaView>
        )
    }

    const renderConverterTab = () => {
        const convertedAmount = convertAmount(Number.parseFloat(converterAmount) || 0, fromCurrency, toCurrency)
        const rate = getExchangeRate(fromCurrency, toCurrency)
        const totalInHome = convertAmount(totalExpenses, wallet?.currency || "EUR", homeCurrency)

        return (
            <View style={styles.converterContainer}>

                {travelMode ? (
                    /* Travel Mode View */
                    <View style={styles.travelModeContent}>
                        <View style={[styles.travelSummaryCard, { backgroundColor: `${ACCENT}10`, borderColor: `${ACCENT}30` }]}>
                            <Text style={[styles.travelSummaryLabel, { color: colors.textSecondary }]}>
                                Total gastado en {wallet?.currency}
                            </Text>
                            <Text style={[styles.travelSummaryAmount, { color: colors.text }]}>
                                {totalExpenses.toFixed(2)} {wallet?.currency}
                            </Text>
                            <View style={styles.travelSummaryDivider} />
                            <Text style={[styles.travelSummaryLabel, { color: colors.textSecondary }]}>
                                Equivalente en {homeCurrency}
                            </Text>
                            <Text style={[styles.travelSummaryConverted, { color: ACCENT }]}>
                                ≈ {totalInHome.toFixed(2)} {homeCurrency}
                            </Text>
                        </View>

                        <Text style={[styles.recentRatesTitle, { color: colors.text }]}>
                            Tasa actual: 1 {wallet?.currency} = {getExchangeRate(wallet?.currency || "EUR", homeCurrency).toFixed(4)}{" "}
                            {homeCurrency}
                        </Text>

                        {/* Recent movements with conversion */}
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Últimos gastos convertidos</Text>
                        {movements
                            .filter((m) => m.type === "expense")
                            .slice(0, 5)
                            .map((m) => {
                                const converted = convertAmount(m.amount, wallet?.currency || "EUR", homeCurrency)
                                return (
                                    <View key={m._id} style={[styles.convertedMovementCard, { backgroundColor: colors.surface }]}>
                                        <View style={styles.convertedMovementLeft}>
                                            <Text style={[styles.convertedMovementCategory, { color: colors.text }]}>
                                                {m.category?.name || "Sin categoría"}
                                            </Text>
                                            <Text style={[styles.convertedMovementOriginal, { color: colors.textTertiary }]}>
                                                {m.amount.toFixed(2)} {wallet?.currency}
                                            </Text>
                                        </View>
                                        <Text style={[styles.convertedMovementValue, { color: ACCENT }]}>
                                            ≈ {converted.toFixed(2)} {homeCurrency}
                                        </Text>
                                    </View>
                                )
                            })}
                    </View>
                ) : (
                    /* Quick Converter View */
                    <View style={styles.quickConverterContent}>
                        <View
                            style={[styles.converterCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}
                        >
                            {/* From Currency */}
                            <TouchableOpacity
                                style={[styles.currencySelector, { backgroundColor: colors.surface }]}
                                onPress={() => setShowFromPicker(true)}
                            >
                                <Text style={styles.currencyFlag}>{getCurrency(fromCurrency).flag}</Text>
                                <View style={styles.currencyInfo}>
                                    <Text style={[styles.currencyCode, { color: colors.text }]}>{fromCurrency}</Text>
                                    <Text style={[styles.currencyName, { color: colors.textTertiary }]}>
                                        {getCurrency(fromCurrency).name}
                                    </Text>
                                </View>
                                <ChevronDownIcon color={colors.textTertiary} />
                            </TouchableOpacity>

                            {/* Amount Input */}
                            <TextInput
                                style={[styles.converterInput, { backgroundColor: colors.surface, color: colors.text }]}
                                value={converterAmount}
                                onChangeText={setConverterAmount}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={colors.textTertiary}
                            />

                            {/* Swap Button */}
                            <Animated.View style={[styles.swapBtnWrapper, { transform: [{ rotate: spin }] }]}>
                                <TouchableOpacity style={[styles.swapBtn, { backgroundColor: ACCENT }]} onPress={swapCurrencies}>
                                    <SwapIcon size={16} color="#fff" />
                                </TouchableOpacity>
                            </Animated.View>

                            {/* To Currency */}
                            <TouchableOpacity
                                style={[styles.currencySelector, { backgroundColor: colors.surface }]}
                                onPress={() => setShowToPicker(true)}
                            >
                                <Text style={styles.currencyFlag}>{getCurrency(toCurrency).flag}</Text>
                                <View style={styles.currencyInfo}>
                                    <Text style={[styles.currencyCode, { color: colors.text }]}>{toCurrency}</Text>
                                    <Text style={[styles.currencyName, { color: colors.textTertiary }]}>
                                        {getCurrency(toCurrency).name}
                                    </Text>
                                </View>
                                <ChevronDownIcon color={colors.textTertiary} />
                            </TouchableOpacity>

                            {/* Result */}
                            <View style={[styles.converterResult, { backgroundColor: `${ACCENT}10` }]}>
                                <Text style={[styles.converterResultAmount, { color: colors.text }]}>
                                    {convertedAmount.toLocaleString("es-ES", { maximumFractionDigits: 2 })}
                                </Text>
                                <Text style={[styles.converterResultCurrency, { color: ACCENT }]}>{toCurrency}</Text>
                            </View>
                        </View>

                        {/* Exchange Rate Info */}
                        <View style={[styles.rateInfoBox, { backgroundColor: colors.surface }]}>
                            <GlobeIcon size={16} color={colors.textTertiary} />
                            <Text style={[styles.rateInfoText, { color: colors.textSecondary }]}>
                                1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.headerBtn, { backgroundColor: colors.surface }]}>
                    <ArrowLeftIcon color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={[styles.shareBtn]} onPress={() => setShowAddFriendModal(true)}>
                        <ShareUserIcon size={26} color={ACCENT} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.headerBtn, { backgroundColor: colors.surface }]}
                        onPress={() => setOptionsVisible(!optionsVisible)}
                    >
                        <DotsIcon color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.walletInfo}>
                <View style={styles.walletIcon}>
                    <Text style={[styles.walletIconText, { color: colors.text }]}>{wallet?.icon}</Text>
                </View>
                <Text style={[styles.walletName, { color: colors.text }]}>{wallet?.name}</Text>
                <View style={styles.balanceSection}>
                    <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Balance total</Text>
                    <Text style={[styles.totalBalance, { color: totalBalance >= 0 ? "#2E7D32" : "#C62828" }]}>
                        {totalBalance >= 0 ? "+" : ""}
                        {totalBalance.toFixed(2)}
                        <Text style={styles.balanceCurrency}> {wallet?.currency || "€"}</Text>
                    </Text>
                </View>
                <View style={styles.walletTags}>
                    <View style={[styles.tag, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.tagText, { color: colors.textSecondary }]}>{wallet?.currency}</Text>
                    </View>
                    <View style={[styles.tag, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                            {wallet?.users?.length > 1 ? "Compartida" : "Personal"}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={[styles.tabs, { borderBottomColor: colors.surfaceBorder }]}>
                {(["movimientos", "saldos", "conversor"] as Tab[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.tabActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, { color: activeTab === tab ? colors.text : colors.textTertiary }]}>
                            {tab === "conversor" ? "Conversor" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                        {activeTab === tab && <View style={[styles.tabLine, { backgroundColor: ACCENT }]} />}
                    </TouchableOpacity>
                ))}
            </View>

            {activeTab === "conversor" ? (
                renderConverterTab()
            ) : activeTab === "movimientos" ? (
                <FlatList
                    contentContainerStyle={styles.list}
                    data={movements}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        const convertedToHome =
                            wallet?.currency !== homeCurrency
                                ? convertAmount(item.amount, wallet?.currency || "EUR", homeCurrency)
                                : null
                        const originalCurrency = item.originalCurrency || wallet?.currency
                        const showConversion =
                            item.originalAmount && item.originalCurrency && item.originalCurrency !== wallet?.currency
                        return (
                            <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                                <View style={[styles.cardIcon, { backgroundColor: item.type === "expense" ? "#FFEBEE" : "#E8F5E9" }]}>
                                    <Text style={{ fontSize: 16 }}>{item.type === "expense" ? "↑" : "↓"}</Text>
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                                        {item.category?.name || "Sin categoría"}
                                    </Text>
                                    <Text style={[styles.cardSub, { color: colors.textTertiary }]}>{item.user?.name || "Usuario"}</Text>
                                    {showConversion && (
                                        <Text style={[styles.cardOriginalAmount, { color: colors.textTertiary }]}>
                                            Original: {item.originalAmount.toFixed(2)} {item.originalCurrency} (tasa:{" "}
                                            {item.exchangeRate?.toFixed(4)})
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.cardAmounts}>
                                    <Text style={[styles.cardAmount, { color: item.type === "expense" ? "#C62828" : "#2E7D32" }]}>
                                        {item.type === "expense" ? "-" : "+"}
                                        {item.amount.toFixed(2)} {wallet?.currency}
                                    </Text>
                                    {convertedToHome && (
                                        <Text style={[styles.cardConvertedAmount, { color: colors.textTertiary }]}>
                                            ≈ {convertedToHome.toFixed(2)} {homeCurrency}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        )
                    }}
                    ListEmptyComponent={
                        <View style={styles.emptyList}>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sin movimientos</Text>
                        </View>
                    }
                />
            ) : (
                <FlatList
                    contentContainerStyle={styles.list}
                    data={balances}
                    keyExtractor={(item) => item.userId}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                            <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                                <Text style={[styles.avatarText, { color: colors.text }]}>{item.name.charAt(0)}</Text>
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
                                <Text
                                    style={[
                                        styles.balanceStatusText,
                                        { color: item.balance < 0 ? "#C62828" : item.balance > 0 ? "#2E7D32" : colors.textTertiary },
                                    ]}
                                >
                                    {item.balance < 0
                                        ? `Debe ${Math.abs(item.balance).toFixed(2)} ${wallet?.currency || "€"}`
                                        : item.balance > 0
                                            ? `Se le debe ${item.balance.toFixed(2)} ${wallet?.currency || "€"}`
                                            : "Saldado"}
                                </Text>
                            </View>
                            <View style={styles.balanceAmountContainer}>
                                <Text style={[styles.cardAmount, { color: item.balance >= 0 ? "#2E7D32" : "#C62828" }]}>
                                    {item.balance >= 0 ? "+" : ""}
                                    {item.balance.toFixed(2)}
                                </Text>
                                <Text style={[styles.balanceCurrencyLabel, { color: colors.textTertiary }]}>
                                    {wallet?.currency || "€"}
                                </Text>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyList}>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sin saldos</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: ACCENT }]}
                onPress={() => router.push(`/addMovement?id=${id}` as any)}
            >
                <Plus color="#fff" />
            </TouchableOpacity>

            {optionsVisible && (
                <View style={[styles.optionsMenu, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                    <TouchableOpacity style={styles.optionItem} onPress={handleEditWallet}>
                        <SettingsIcon size={18} color={colors.text} />
                        <Text style={[styles.optionText, { color: colors.text }]}>Editar wallet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionItem} onPress={handleDeleteWallet}>
                        <TrashIcon size={18} color="#C62828" />
                        <Text style={[styles.optionText, { color: "#C62828" }]}>Borrar wallet</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Add Friend Modal */}
            <Modal
                visible={showAddFriendModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAddFriendModal(false)}
            >
                <View style={styles.modalBottomOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
                        <View style={[styles.modalHandle, { backgroundColor: colors.textTertiary }]} />
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Compartir wallet</Text>
                        <TextInput
                            placeholder="Buscar por nombre"
                            placeholderTextColor={colors.textTertiary}
                            value={search}
                            onChangeText={searchUsers}
                            style={[
                                styles.input,
                                { backgroundColor: colors.surface, color: colors.text, borderColor: colors.surfaceBorder },
                            ]}
                        />
                        {loadingUsers ? (
                            <ActivityIndicator style={{ marginTop: 20 }} color={colors.textTertiary} />
                        ) : (
                            <FlatList
                                data={users}
                                keyExtractor={(item) => item._id}
                                style={{ maxHeight: 180 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.userItem,
                                            { backgroundColor: selectedUser?._id === item._id ? `${ACCENT}15` : colors.surface },
                                        ]}
                                        onPress={() => setSelectedUser(item)}
                                    >
                                        <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddFriendModal(false)}>
                                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: ACCENT }, !selectedUser && { opacity: 0.5 }]}
                                disabled={!selectedUser || posting}
                                onPress={addUserToWallet}
                            >
                                <Text style={styles.confirmBtnText}>{posting ? "..." : "Invitar"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Modal */}
            <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
                <View style={styles.modalBottomOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
                        <View style={[styles.modalHandle, { backgroundColor: colors.textTertiary }]} />
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Editar wallet</Text>

                        <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre</Text>
                        <TextInput
                            placeholder="Nombre de la wallet"
                            placeholderTextColor={colors.textTertiary}
                            value={editName}
                            onChangeText={setEditName}
                            style={[
                                styles.input,
                                { backgroundColor: colors.surface, color: colors.text, borderColor: colors.surfaceBorder },
                            ]}
                        />

                        <Text style={[styles.label, { color: colors.textSecondary }]}>Moneda</Text>
                        <View
                            style={[
                                styles.currencyEditSelector,
                                { backgroundColor: colors.surface, borderColor: colors.surfaceBorder },
                            ]}
                        >
                            {["EUR", "USD", "GBP", "JPY"].map((curr) => (
                                <TouchableOpacity
                                    key={curr}
                                    style={[styles.currencyOption, editCurrency === curr && { backgroundColor: `${ACCENT}15` }]}
                                    onPress={() => setEditCurrency(curr)}
                                >
                                    <Text style={[styles.currencyEditText, { color: editCurrency === curr ? ACCENT : colors.text }]}>
                                        {curr}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {wallet?.users?.length > 1 && (
                            <>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Presupuesto mensual</Text>
                                <TextInput
                                    placeholder="0.00"
                                    placeholderTextColor={colors.textTertiary}
                                    value={editBudget}
                                    onChangeText={setEditBudget}
                                    keyboardType="numeric"
                                    style={[
                                        styles.input,
                                        { backgroundColor: colors.surface, color: colors.text, borderColor: colors.surfaceBorder },
                                    ]}
                                />
                            </>
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEditModal(false)}>
                                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: ACCENT }]} onPress={saveWalletChanges}>
                                <Text style={styles.confirmBtnText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Modal */}
            <Modal
                visible={showDeleteModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.deleteModalContainer, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.deleteModalTitle, { color: colors.text }]}>¿Eliminar wallet?</Text>
                        <Text style={[styles.deleteModalText, { color: colors.textSecondary }]}>
                            Esta acción no se puede deshacer. Se eliminarán todos los movimientos asociados.
                        </Text>
                        <View style={styles.deleteModalActions}>
                            <TouchableOpacity
                                style={[styles.deleteModalBtn, { backgroundColor: colors.surface }]}
                                onPress={() => setShowDeleteModal(false)}
                            >
                                <Text style={[styles.deleteModalBtnText, { color: colors.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.deleteModalBtn, { backgroundColor: "#C62828" }]}
                                onPress={confirmDeleteWallet}
                            >
                                <Text style={[styles.deleteModalBtnText, { color: "#fff" }]}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Currency Picker Modals */}
            {showFromPicker && (
                <Modal
                    visible={showFromPicker}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowFromPicker(false)}
                >
                    <View style={styles.modalBottomOverlay}>
                        <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
                            <View style={[styles.modalHandle, { backgroundColor: colors.textTertiary }]} />
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Moneda origen</Text>
                            <FlatList
                                data={CURRENCIES}
                                keyExtractor={(item) => item.code}
                                style={{ maxHeight: 300 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.pickerItem, fromCurrency === item.code && { backgroundColor: `${ACCENT}10` }]}
                                        onPress={() => {
                                            setFromCurrency(item.code)
                                            setShowFromPicker(false)
                                        }}
                                    >
                                        <Text style={styles.pickerItemFlag}>{item.flag}</Text>
                                        <Text style={[styles.pickerItemCode, { color: colors.text }]}>{item.code}</Text>
                                        <Text style={[styles.pickerItemName, { color: colors.textTertiary }]}>{item.name}</Text>
                                        {fromCurrency === item.code && <View style={[styles.checkDot, { backgroundColor: ACCENT }]} />}
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowFromPicker(false)}>
                                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}

            {showToPicker && (
                <Modal visible={showToPicker} transparent animationType="slide" onRequestClose={() => setShowToPicker(false)}>
                    <View style={styles.modalBottomOverlay}>
                        <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
                            <View style={[styles.modalHandle, { backgroundColor: colors.textTertiary }]} />
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Moneda destino</Text>
                            <FlatList
                                data={CURRENCIES}
                                keyExtractor={(item) => item.code}
                                style={{ maxHeight: 300 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.pickerItem, toCurrency === item.code && { backgroundColor: `${ACCENT}10` }]}
                                        onPress={() => {
                                            setToCurrency(item.code)
                                            setShowToPicker(false)
                                        }}
                                    >
                                        <Text style={styles.pickerItemFlag}>{item.flag}</Text>
                                        <Text style={[styles.pickerItemCode, { color: colors.text }]}>{item.code}</Text>
                                        <Text style={[styles.pickerItemName, { color: colors.textTertiary }]}>{item.name}</Text>
                                        {toCurrency === item.code && <View style={[styles.checkDot, { backgroundColor: ACCENT }]} />}
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowToPicker(false)}>
                                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: "center", alignItems: "center" },

    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
    shareBtn: { padding: 8 },
    walletHeader: { flexDirection: "column", alignItems: "center", gap: 12 },
    walletInfo: { paddingHorizontal: 24, paddingVertical: 16, justifyContent: "center", alignItems: "center" },
    walletIcon: { width: 50, height: 50, borderRadius: 100, justifyContent: "center", alignItems: "center", marginBottom: 12, backgroundColor: "rgba(255,255,255,0.1)" },
    walletIconText: { fontSize: 24 },
    walletName: { fontSize: 28, fontWeight: "700", marginBottom: 12 },
    balanceSection: { marginBottom: 12 },
    balanceLabel: { fontSize: 13, marginBottom: 4, textAlign: "center" },
    totalBalance: { fontSize: 32, fontWeight: "700", textAlign: "center" },
    balanceCurrency: { fontSize: 20, fontWeight: "400", textAlign: "center" },
    walletTags: { flexDirection: "row", gap: 8 },
    tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    tagText: { fontSize: 13, fontWeight: "500", textAlign: "center" },

    tabs: { flexDirection: "row", borderBottomWidth: 1, marginHorizontal: 20 },
    tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
    tabActive: {},
    tabText: { fontSize: 15, fontWeight: "600" },
    tabLine: { position: "absolute", bottom: 0, height: 3, width: "60%", borderRadius: 2 },

    list: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 140 },

    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 10,
    },
    cardIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
    cardSub: { fontSize: 13 },
    balanceStatusText: { fontSize: 14, fontWeight: "600", marginTop: 2 },
    cardOriginalAmount: { fontSize: 11, marginTop: 4, fontStyle: "italic" },
    cardAmounts: { alignItems: "flex-end" },
    cardAmount: { fontSize: 16, fontWeight: "700" },
    cardConvertedAmount: { fontSize: 12, marginTop: 2 },
    balanceAmountContainer: { alignItems: "flex-end" },
    balanceCurrencyLabel: { fontSize: 12, marginTop: 2, fontWeight: "500" },

    avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginRight: 12 },
    avatarText: { fontSize: 16, fontWeight: "700" },

    emptyList: { alignItems: "center", paddingTop: 60 },
    emptyText: { fontSize: 15 },

    addButton: {
        position: "absolute",
        bottom: 40,
        alignSelf: "center",
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
    },

    converterContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },

    travelModeToggle: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 12,
        gap: 10,
        marginBottom: 20,
    },
    travelModeText: { flex: 1, fontSize: 15, fontWeight: "600" },
    toggleDot: { width: 8, height: 8, borderRadius: 4 },

    travelModeContent: { flex: 1 },
    travelSummaryCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 20,
        alignItems: "center",
    },
    travelSummaryLabel: { fontSize: 13, marginBottom: 4 },
    travelSummaryAmount: { fontSize: 28, fontWeight: "700", marginBottom: 12 },
    travelSummaryDivider: { height: 1, backgroundColor: "rgba(168,85,247,0.2)", width: "100%", marginVertical: 12 },
    travelSummaryConverted: { fontSize: 24, fontWeight: "700" },

    recentRatesTitle: { fontSize: 13, textAlign: "center", marginBottom: 20, fontWeight: "500" },
    sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },

    convertedMovementCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 12,
        marginBottom: 8,
    },
    convertedMovementLeft: { flex: 1 },
    convertedMovementCategory: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
    convertedMovementOriginal: { fontSize: 13 },
    convertedMovementValue: { fontSize: 15, fontWeight: "700" },

    quickConverterContent: { flex: 1 },
    converterCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 16 },

    currencySelector: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    currencyFlag: { fontSize: 24, marginRight: 12 },
    currencyInfo: { flex: 1 },
    currencyCode: { fontSize: 16, fontWeight: "700" },
    currencyName: { fontSize: 12, marginTop: 2 },

    converterInput: {
        borderRadius: 12,
        padding: 14,
        fontSize: 24,
        fontWeight: "700",
        textAlign: "right",
        marginBottom: 12,
    },

    swapBtnWrapper: { alignSelf: "center", marginVertical: 4 },
    swapBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },

    converterResult: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: 14,
        borderRadius: 12,
        marginTop: 8,
        gap: 8,
    },
    converterResultAmount: { fontSize: 24, fontWeight: "700" },
    converterResultCurrency: { fontSize: 16, fontWeight: "600" },

    rateInfoBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        borderRadius: 10,
        gap: 8,
    },
    rateInfoText: { fontSize: 14, fontWeight: "500" },

    // Options menu styles - actualizado para incluir iconos
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

    // Modal styles
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modalBottomOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
    modalContainer: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20 },

    label: { fontSize: 12, fontWeight: "600", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
    input: { borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, marginBottom: 16 },

    currencyEditSelector: { flexDirection: "row", borderRadius: 12, padding: 4, borderWidth: 1, marginBottom: 20 },
    currencyOption: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 10 },
    currencyEditText: { fontSize: 15, fontWeight: "600" },

    modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
    cancelBtn: { flex: 1, paddingVertical: 16, alignItems: "center" },
    cancelBtnText: { fontSize: 16, fontWeight: "600" },
    confirmBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: "center" },
    confirmBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },

    userItem: { padding: 14, borderRadius: 10, marginBottom: 8 },
    userName: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
    userEmail: { fontSize: 13 },

    deleteModalContainer: { width: "85%", borderRadius: 20, padding: 24 },
    deleteModalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12, textAlign: "center" },
    deleteModalText: { fontSize: 15, textAlign: "center", marginBottom: 24, lineHeight: 22 },
    deleteModalActions: { flexDirection: "row", gap: 12 },
    deleteModalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
    deleteModalBtnText: { fontSize: 16, fontWeight: "600" },

    pickerItem: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 10, marginBottom: 4, gap: 12 },
    pickerItemFlag: { fontSize: 24 },
    pickerItemCode: { fontSize: 16, fontWeight: "600", width: 50 },
    pickerItemName: { flex: 1, fontSize: 14 },
    checkDot: { width: 8, height: 8, borderRadius: 4 },
})
