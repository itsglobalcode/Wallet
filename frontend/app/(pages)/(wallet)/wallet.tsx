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
} from "react-native"
import { useEffect, useState } from "react"
import { useLocalSearchParams, useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Options from "@/components/options"
import Plus from "@/components/ui/plus-symbol"
import { useTheme } from "@/contexts/ThemeContext"
import Svg, { Path, Circle } from "react-native-svg"

const USERS_API = "http://localhost:3000/api/search"
const WALLET_API = "http://localhost:3000/api/wallet"

type Tab = "movimientos" | "saldos"

const ACCENT = "#FF6B35"

const ArrowLeftIcon = ({ size = 22, color = "#000" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
)

const SearchIcon = ({ size = 20, color = "#000" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
        <Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
)

const DotsIcon = ({ size = 20, color = "#000" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="5" r="1.5" fill={color} />
        <Circle cx="12" cy="12" r="1.5" fill={color} />
        <Circle cx="12" cy="19" r="1.5" fill={color} />
    </Svg>
)

const ExchangeIcon = ({ size = 20, color = "#000" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M16 3l4 4-4 4M4 17l4-4 4 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M20 7H4M4 17h16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
)

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

    useEffect(() => {
        const loadUserId = async () => {
            const userId = await AsyncStorage.getItem("userId")
            if (!userId) return
            setUser(userId)
        }
        loadUserId()
        if (!id) return
        loadData()
    }, [id])

    const loadData = async () => {
        if (!id) return
        setLoading(true)
        try {
            const userId = await AsyncStorage.getItem("userId")
            if (!userId) return
            const walletRes = await fetch(`${WALLET_API}/get-wallet?id=${id}`)
            const walletData = await walletRes.json()
            setWallet(walletData)
            const movementsRes = await fetch(`${WALLET_API}/wallet/${id}/movements`)
            const movementsData = await movementsRes.json()
            setMovements(movementsData.movements || [])
            const balanceMap: Record<string, any> = {}
            movementsData.movements.forEach((m: any) => {
                const uid = m.user._id
                if (!balanceMap[uid]) balanceMap[uid] = { userId: uid, name: m.user.name || "Usuario", balance: 0 }
                balanceMap[uid].balance += m.type === "expense" ? -m.amount : m.amount
            })
            setBalances(Object.values(balanceMap))
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const searchUsers = async (text: string) => {
        setSearch(text)
        setSelectedUser(null)
        if (text.length < 2) {
            setUsers([])
            return
        }
        try {
            setLoadingUsers(true)
            const res = await fetch(`${USERS_API}/users?query=${text}`)
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
        // TODO: Implement API call to update wallet
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
                body: JSON.stringify({ id }) 
            })
        } catch (err) {
            console.error(err)
        }
        setShowDeleteModal(false)
        router.back()
    }

    const totalBalance = movements.reduce((acc, m) => acc + (m.type === "expense" ? -m.amount : m.amount), 0)

    if (loading) {
        return (
            <SafeAreaView style={[styles.loading, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.textTertiary} />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.headerBtn, { backgroundColor: colors.surface }]}>
                    <ArrowLeftIcon color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.surface }]}>
                        <SearchIcon color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.headerBtn, { backgroundColor: colors.surface }]}
                        onPress={() => router.push("/currency-exchange" as any)}
                    >
                        <ExchangeIcon color={colors.text} />
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
                <Text style={[styles.walletName, { color: colors.text }]}>{wallet?.name}</Text>
                <View style={styles.balanceSection}>
                    <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Balance total</Text>
                    <Text style={[styles.totalBalance, { color: totalBalance >= 0 ? "#2E7D32" : "#C62828" }]}>
                        {totalBalance >= 0 ? "+" : ""}
                        {totalBalance.toFixed(2)}
                        <Text style={styles.balanceCurrency}> €</Text>
                    </Text>
                </View>
                <View style={styles.walletTags}>
                    <View style={[styles.tag, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.tagText, { color: colors.textSecondary }]}>{wallet?.currency}</Text>
                    </View>
                    <View style={[styles.tag, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                            {wallet?.type === "shared" ? "Compartida" : "Personal"}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={[styles.tabs, { borderBottomColor: colors.surfaceBorder }]}>
                {(["movimientos", "saldos"] as Tab[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.tabActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, { color: activeTab === tab ? colors.text : colors.textTertiary }]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                        {activeTab === tab && <View style={[styles.tabLine, { backgroundColor: ACCENT }]} />}
                    </TouchableOpacity>
                ))}
            </View>

            {activeTab === "movimientos" ? (
                <FlatList
                    contentContainerStyle={styles.list}
                    data={movements}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                            <View style={[styles.cardIcon, { backgroundColor: item.type === "expense" ? "#FFEBEE" : "#E8F5E9" }]}>
                                <Text style={{ fontSize: 16 }}>{item.type === "expense" ? "↑" : "↓"}</Text>
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.category?.name || "Sin categoría"}</Text>
                                <Text style={[styles.cardSub, { color: colors.textTertiary }]}>{item.user?.name || "Usuario"}</Text>
                            </View>
                            <Text style={[styles.cardAmount, { color: item.type === "expense" ? "#C62828" : "#2E7D32" }]}>
                                {item.type === "expense" ? "-" : "+"}
                                {item.amount.toFixed(2)}
                            </Text>
                        </View>
                    )}
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
                            </View>
                            <Text style={[styles.cardAmount, { color: item.balance >= 0 ? "#2E7D32" : "#C62828" }]}>
                                {item.balance >= 0 ? "+" : ""}
                                {item.balance.toFixed(2)}
                            </Text>
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

            <Modal visible={optionsVisible} transparent animationType="fade" onRequestClose={() => setOptionsVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOptionsVisible(false)}>
                    <View style={[styles.optionsMenu, { backgroundColor: colors.cardBackground }]}>
                        {wallet?.type === "shared" && (
                            <>
                                <TouchableOpacity
                                    style={styles.optionItem}
                                    onPress={() => {
                                        setOptionsVisible(false)
                                        setShowAddFriendModal(true)
                                    }}
                                >
                                    <Text style={[styles.optionText, { color: colors.text }]}>Agregar amigo</Text>
                                </TouchableOpacity>
                                <View style={[styles.divider, { backgroundColor: colors.surfaceBorder }]} />
                            </>
                        )}
                        <TouchableOpacity style={styles.optionItem} onPress={handleEditWallet}>
                            <Text style={[styles.optionText, { color: colors.text }]}>Editar wallet</Text>
                        </TouchableOpacity>
                        <View style={[styles.divider, { backgroundColor: colors.surfaceBorder }]} />
                        <TouchableOpacity style={styles.optionItem} onPress={handleDeleteWallet}>
                            <Text style={[styles.optionText, { color: "#C62828" }]}>Eliminar wallet</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal
                visible={showAddFriendModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAddFriendModal(false)}
            >
                <View style={styles.modalBottomOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
                        <View style={[styles.modalHandle, { backgroundColor: colors.textTertiary }]} />
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Agregar amigo</Text>
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
                                        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
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
                                <Text style={styles.confirmBtnText}>{posting ? "..." : "Agregar"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
                            style={[styles.currencySelector, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
                        >
                            {["EUR", "USD", "GBP", "JPY"].map((curr) => (
                                <TouchableOpacity
                                    key={curr}
                                    style={[styles.currencyOption, editCurrency === curr && { backgroundColor: `${ACCENT}15` }]}
                                    onPress={() => setEditCurrency(curr)}
                                >
                                    <Text style={[styles.currencyText, { color: editCurrency === curr ? ACCENT : colors.text }]}>
                                        {curr}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {wallet?.type === "shared" && (
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

            <Options />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: "center", alignItems: "center" },

    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    headerActions: { flexDirection: "row", gap: 8 },

    walletInfo: { paddingHorizontal: 24, paddingBottom: 24, alignItems: "center" },
    walletName: { fontSize: 18, fontWeight: "600", letterSpacing: -0.3, marginBottom: 16 },
    balanceSection: { alignItems: "center", marginBottom: 16 },
    balanceLabel: { fontSize: 13, fontWeight: "500", marginBottom: 6 },
    totalBalance: { fontSize: 44, fontWeight: "700", letterSpacing: -1.5 },
    balanceCurrency: { fontSize: 24, fontWeight: "400" },
    walletTags: { flexDirection: "row", gap: 8 },
    tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    tagText: { fontSize: 13, fontWeight: "500" },

    tabs: { flexDirection: "row", marginHorizontal: 20, borderBottomWidth: 1 },
    tab: { paddingVertical: 14, marginRight: 24, position: "relative" },
    tabActive: {},
    tabText: { fontSize: 15, fontWeight: "600" },
    tabLine: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2, borderRadius: 1 },

    list: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 140 },
    card: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
    },
    cardIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginRight: 12 },
    avatarText: { fontSize: 16, fontWeight: "600" },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
    cardSub: { fontSize: 13 },
    cardAmount: { fontSize: 16, fontWeight: "700" },

    emptyList: { paddingTop: 60, alignItems: "center" },
    emptyText: { fontSize: 15 },

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

    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
    optionsMenu: { borderRadius: 14, padding: 8, width: 200 },
    optionItem: { paddingVertical: 14, paddingHorizontal: 16 },
    optionText: { fontSize: 15, fontWeight: "500" },
    divider: { height: 1 },

    modalBottomOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
    modalContainer: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
    input: { borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, marginBottom: 16 },
    userItem: { padding: 12, borderRadius: 10, marginBottom: 6 },
    userName: { fontSize: 15, fontWeight: "600" },
    userEmail: { fontSize: 13, marginTop: 2 },
    modalActions: { flexDirection: "row", gap: 12, marginTop: 16 },
    cancelBtn: { flex: 1, paddingVertical: 16, alignItems: "center" },
    cancelBtnText: { fontSize: 16, fontWeight: "600" },
    confirmBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: "center" },
    confirmBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },

    label: { fontSize: 13, fontWeight: "600", marginBottom: 8, marginTop: 8 },
    currencySelector: { flexDirection: "row", borderRadius: 12, padding: 4, borderWidth: 1, marginBottom: 16 },
    currencyOption: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
    currencyText: { fontSize: 15, fontWeight: "600" },

    deleteModalContainer: { borderRadius: 18, padding: 24, marginHorizontal: 24, maxWidth: 340 },
    deleteModalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
    deleteModalText: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
    deleteModalActions: { flexDirection: "row", gap: 12 },
    deleteModalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
    deleteModalBtnText: { fontSize: 16, fontWeight: "600" },
})
