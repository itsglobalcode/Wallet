"use client"

import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StyleSheet,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Animated,
    Modal,
    FlatList,
} from "react-native"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "expo-router"
import { useTheme } from "@/contexts/ThemeContext"

import ArrowLeftIcon from "@/components/svg/arrow-left"
import SwapIcon from "@/components/svg/swap-symbol"
import ChevronDownIcon from "@/components/svg/chevronDown-symbol"

const CURRENCY_API = `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${process.env.API_KEY}`

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
    { code: "INR", name: "Rupia", flag: "🇮🇳" },
    { code: "KRW", name: "Won", flag: "🇰🇷" },
    { code: "SGD", name: "Dólar SG", flag: "🇸🇬" },
    { code: "HKD", name: "Dólar HK", flag: "🇭🇰" },
    { code: "SEK", name: "Corona SE", flag: "🇸🇪" },
    { code: "NOK", name: "Corona NO", flag: "🇳🇴" },
    { code: "NZD", name: "Dólar NZ", flag: "🇳🇿" },
    { code: "ZAR", name: "Rand", flag: "🇿🇦" },
]

export default function CurrencyExchangeScreen() {
    const { colors } = useTheme()
    const router = useRouter()

    const [rates, setRates] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)

    const [fromCurrency, setFromCurrency] = useState("USD")
    const [toCurrency, setToCurrency] = useState("EUR")
    const [amount, setAmount] = useState("1")
    const [convertedAmount, setConvertedAmount] = useState("0")

    const [showFromPicker, setShowFromPicker] = useState(false)
    const [showToPicker, setShowToPicker] = useState(false)
    const [showAllRates, setShowAllRates] = useState(false)

    const rotateAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        fetchRates()
    }, [])

    useEffect(() => {
        convertCurrency()
    }, [amount, fromCurrency, toCurrency, rates])

    const fetchRates = async () => {
        try {
            setLoading(true)
            const res = await fetch(CURRENCY_API)
            const data = await res.json()
            setRates(data.rates || {})
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const convertCurrency = () => {
        if (!rates[fromCurrency] || !rates[toCurrency] || !amount) {
            setConvertedAmount("0")
            return
        }
        const fromRate = Number.parseFloat(rates[fromCurrency])
        const toRate = Number.parseFloat(rates[toCurrency])
        const amountNum = Number.parseFloat(amount) || 0
        const result = (amountNum / fromRate) * toRate
        setConvertedAmount(result.toFixed(2))
    }

    const swapCurrencies = () => {
        Animated.sequence([
            Animated.timing(rotateAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(rotateAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]).start()
        setFromCurrency(toCurrency)
        setToCurrency(fromCurrency)
    }

    const getCurrency = (code: string) => CURRENCIES.find((c) => c.code === code) || { code, name: code, flag: "🌍" }

    const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] })

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.textTertiary} />
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
                    <ArrowLeftIcon color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Cambio</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View
                    style={[styles.converterCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}
                >
                    <TouchableOpacity
                        style={[styles.currencyRow, { backgroundColor: colors.surface }]}
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

                    <TextInput
                        style={[styles.amountInput, { backgroundColor: colors.surface, color: colors.text }]}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.textTertiary}
                    />

                    <Animated.View style={[styles.swapBtnWrapper, { transform: [{ rotate: spin }] }]}>
                        <TouchableOpacity style={[styles.swapBtn, { backgroundColor: ACCENT }]} onPress={swapCurrencies}>
                            <SwapIcon size={18} color="#fff" />
                        </TouchableOpacity>
                    </Animated.View>

                    <TouchableOpacity
                        style={[styles.currencyRow, { backgroundColor: colors.surface }]}
                        onPress={() => setShowToPicker(true)}
                    >
                        <Text style={styles.currencyFlag}>{getCurrency(toCurrency).flag}</Text>
                        <View style={styles.currencyInfo}>
                            <Text style={[styles.currencyCode, { color: colors.text }]}>{toCurrency}</Text>
                            <Text style={[styles.currencyName, { color: colors.textTertiary }]}>{getCurrency(toCurrency).name}</Text>
                        </View>
                        <ChevronDownIcon color={colors.textTertiary} />
                    </TouchableOpacity>

                    <View style={[styles.resultBox, { backgroundColor: `${ACCENT}10` }]}>
                        <Text style={[styles.resultAmount, { color: colors.text }]}>
                            {Number.parseFloat(convertedAmount).toLocaleString("es-ES", { maximumFractionDigits: 2 })}
                        </Text>
                        <Text style={[styles.resultCurrency, { color: ACCENT }]}>{toCurrency}</Text>
                    </View>
                </View>

                <View style={[styles.rateInfo, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.rateText, { color: colors.textSecondary }]}>
                        1 {fromCurrency} ={" "}
                        {(Number.parseFloat(rates[toCurrency]) / Number.parseFloat(rates[fromCurrency])).toFixed(4)} {toCurrency}
                    </Text>
                </View>

                <View style={styles.ratesHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Tasas populares</Text>
                    <TouchableOpacity onPress={() => setShowAllRates(true)}>
                        <Text style={[styles.seeAllBtn, { color: ACCENT }]}>Ver todas</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.ratesGrid}>
                    {CURRENCIES.filter((c) => c.code !== "USD")
                        .slice(0, 6)
                        .map((currency) => {
                            const rate = Number.parseFloat(rates[currency.code]) || 0
                            return (
                                <TouchableOpacity
                                    key={currency.code}
                                    style={[styles.rateCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}
                                    onPress={() => {
                                        setFromCurrency("USD")
                                        setToCurrency(currency.code)
                                    }}
                                >
                                    <Text style={styles.rateCardFlag}>{currency.flag}</Text>
                                    <Text style={[styles.rateCardCode, { color: colors.text }]}>{currency.code}</Text>
                                    <Text style={[styles.rateCardValue, { color: colors.textSecondary }]}>{rate.toFixed(2)}</Text>
                                </TouchableOpacity>
                            )
                        })}
                </View>
            </ScrollView>

            {showFromPicker && (
                <View style={[styles.pickerOverlay, { backgroundColor: "rgba(0,0,0,0.4)" }]}>
                    <View style={[styles.pickerContainer, { backgroundColor: colors.cardBackground }]}>
                        <View style={[styles.pickerHandle, { backgroundColor: colors.textTertiary }]} />
                        <Text style={[styles.pickerTitle, { color: colors.text }]}>Moneda origen</Text>
                        <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
                            {CURRENCIES.map((currency) => (
                                <TouchableOpacity
                                    key={currency.code}
                                    style={[styles.pickerItem, fromCurrency === currency.code && { backgroundColor: `${ACCENT}10` }]}
                                    onPress={() => {
                                        setFromCurrency(currency.code)
                                        setShowFromPicker(false)
                                    }}
                                >
                                    <Text style={styles.pickerItemFlag}>{currency.flag}</Text>
                                    <Text style={[styles.pickerItemCode, { color: colors.text }]}>{currency.code}</Text>
                                    <Text style={[styles.pickerItemName, { color: colors.textTertiary }]}>{currency.name}</Text>
                                    {fromCurrency === currency.code && <View style={[styles.checkDot, { backgroundColor: ACCENT }]} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.pickerClose} onPress={() => setShowFromPicker(false)}>
                            <Text style={[styles.pickerCloseText, { color: colors.textSecondary }]}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {showToPicker && (
                <View style={[styles.pickerOverlay, { backgroundColor: "rgba(0,0,0,0.4)" }]}>
                    <View style={[styles.pickerContainer, { backgroundColor: colors.cardBackground }]}>
                        <View style={[styles.pickerHandle, { backgroundColor: colors.textTertiary }]} />
                        <Text style={[styles.pickerTitle, { color: colors.text }]}>Moneda destino</Text>
                        <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
                            {CURRENCIES.map((currency) => (
                                <TouchableOpacity
                                    key={currency.code}
                                    style={[styles.pickerItem, toCurrency === currency.code && { backgroundColor: `${ACCENT}10` }]}
                                    onPress={() => {
                                        setToCurrency(currency.code)
                                        setShowToPicker(false)
                                    }}
                                >
                                    <Text style={styles.pickerItemFlag}>{currency.flag}</Text>
                                    <Text style={[styles.pickerItemCode, { color: colors.text }]}>{currency.code}</Text>
                                    <Text style={[styles.pickerItemName, { color: colors.textTertiary }]}>{currency.name}</Text>
                                    {toCurrency === currency.code && <View style={[styles.checkDot, { backgroundColor: ACCENT }]} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.pickerClose} onPress={() => setShowToPicker(false)}>
                            <Text style={[styles.pickerCloseText, { color: colors.textSecondary }]}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {showAllRates && (
                <Modal visible={showAllRates} transparent animationType="slide" onRequestClose={() => setShowAllRates(false)}>
                    <View style={[styles.allRatesModal, { backgroundColor: colors.background }]}>
                        <View style={styles.allRatesHeader}>
                            <Text style={[styles.allRatesTitle, { color: colors.text }]}>Todas las tasas</Text>
                            <TouchableOpacity onPress={() => setShowAllRates(false)}>
                                <Text style={[styles.closeModalBtn, { color: ACCENT }]}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={CURRENCIES}
                            keyExtractor={(item) => item.code}
                            contentContainerStyle={styles.allRatesList}
                            renderItem={({ item }) => {
                                const rate = Number.parseFloat(rates[item.code]) || 0
                                return (
                                    <View
                                        style={[
                                            styles.allRateItem,
                                            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
                                        ]}
                                    >
                                        <Text style={styles.allRateFlag}>{item.flag}</Text>
                                        <View style={styles.allRateInfo}>
                                            <Text style={[styles.allRateCode, { color: colors.text }]}>{item.code}</Text>
                                            <Text style={[styles.allRateName, { color: colors.textTertiary }]}>{item.name}</Text>
                                        </View>
                                        <Text style={[styles.allRateValue, { color: colors.text }]}>{rate.toFixed(4)}</Text>
                                    </View>
                                )
                            }}
                        />
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    headerTitle: { fontSize: 17, fontWeight: "600" },

    content: { paddingHorizontal: 20, paddingBottom: 120 },

    converterCard: { borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 16 },

    currencyRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
    },
    currencyFlag: { fontSize: 28, marginRight: 12 },
    currencyInfo: { flex: 1 },
    currencyCode: { fontSize: 18, fontWeight: "700" },
    currencyName: { fontSize: 13, marginTop: 2 },

    amountInput: {
        borderRadius: 12,
        padding: 16,
        fontSize: 28,
        fontWeight: "700",
        textAlign: "right",
        marginBottom: 16,
    },

    swapBtnWrapper: { alignSelf: "center", marginVertical: 8 },
    swapBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },

    resultBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: 16,
        borderRadius: 12,
        marginTop: 12,
        gap: 8,
    },
    resultAmount: { fontSize: 28, fontWeight: "700" },
    resultCurrency: { fontSize: 18, fontWeight: "600" },

    rateInfo: { padding: 14, borderRadius: 12, marginBottom: 28, alignItems: "center" },
    rateText: { fontSize: 14, fontWeight: "500" },

    ratesHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: { fontSize: 18, fontWeight: "700" },
    seeAllBtn: { fontSize: 15, fontWeight: "600" },

    ratesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    rateCard: {
        width: "31%",
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        alignItems: "center",
    },
    rateCardFlag: { fontSize: 24, marginBottom: 8 },
    rateCardCode: { fontSize: 14, fontWeight: "600" },
    rateCardValue: { fontSize: 13, marginTop: 4 },

    pickerOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "flex-end" },
    pickerContainer: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    pickerHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
    pickerTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
    pickerItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 10,
        marginBottom: 4,
        gap: 12,
    },
    pickerItemFlag: { fontSize: 24 },
    pickerItemCode: { fontSize: 16, fontWeight: "600", width: 50 },
    pickerItemName: { flex: 1, fontSize: 14 },
    checkDot: { width: 8, height: 8, borderRadius: 4 },
    pickerClose: { paddingVertical: 16, alignItems: "center", marginTop: 8 },
    pickerCloseText: { fontSize: 16, fontWeight: "600" },

    allRatesModal: { flex: 1, paddingTop: 60 },
    allRatesHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    allRatesTitle: { fontSize: 24, fontWeight: "700" },
    closeModalBtn: { fontSize: 16, fontWeight: "600" },
    allRatesList: { paddingHorizontal: 20, paddingBottom: 40 },
    allRateItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 8,
    },
    allRateFlag: { fontSize: 28, marginRight: 14 },
    allRateInfo: { flex: 1 },
    allRateCode: { fontSize: 16, fontWeight: "700" },
    allRateName: { fontSize: 13, marginTop: 2 },
    allRateValue: { fontSize: 16, fontWeight: "600" },
})
