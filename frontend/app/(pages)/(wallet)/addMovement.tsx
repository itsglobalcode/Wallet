"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useTheme } from "@/contexts/ThemeContext"
import Options from "@/components/options"
import Svg, { Path } from "react-native-svg"

const API = "http://localhost:3000/api/wallet"

type MovementType = "expense" | "income" | "transfer"

const ACCENT = "#FF6B35"

const ArrowLeftIcon = ({ size = 22, color = "#000" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const ChevronDownIcon = ({ size = 18, color = "#999" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export default function AddMovementScreen() {
  const { colors } = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [walletType, setWalletType] = useState<"personal" | "shared">("personal")

  const [type, setType] = useState<MovementType>("expense")
  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [category, setCategory] = useState<any>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [transferToUser, setTransferToUser] = useState<any>(null)

  const [categoryModalVisible, setCategoryModalVisible] = useState(false)
  const [userModalVisible, setUserModalVisible] = useState(false)
  const [toUserModalVisible, setToUserModalVisible] = useState(false)

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [categoriesRes, walletRes] = await Promise.all([fetch(`${API}/categories`), fetch(`${API}/wallet/${id}`)])
      const categoriesData = await categoriesRes.json()
      const walletData = await walletRes.json()

      setCategories(categoriesData.categories || [])
      setUsers(walletData.users || [])
      setWalletType(walletData.type || "personal")

      if (walletData.users?.length > 0) {
        setSelectedUser(walletData.users[0])
        if (walletData.users.length > 1) {
          setTransferToUser(walletData.users[1])
        }
      }
    } catch (err) {
      console.error(err)
      Alert.alert("Error", "No se pudieron cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMovement = async () => {
    if (!amount) return Alert.alert("Error", "Ingresa una cantidad")
    if (type !== "transfer" && !category) return Alert.alert("Error", "Selecciona una categoría")
    if (!selectedUser) return Alert.alert("Error", "Selecciona un usuario")
    if (type === "transfer" && !transferToUser) return Alert.alert("Error", "Selecciona el destinatario")

    try {
      const userId = await AsyncStorage.getItem("userId")
      if (!userId) return

      if (type === "transfer") {
        const movements = [
          {
            wallet: id,
            user: selectedUser._id,
            type: "expense",
            amount: Number(amount),
            category: null,
            notes: `→ ${transferToUser.name}${notes ? ": " + notes : ""}`,
            tags: [],
            date: new Date(),
          },
          {
            wallet: id,
            user: transferToUser._id,
            type: "income",
            amount: Number(amount),
            category: null,
            notes: `← ${selectedUser.name}${notes ? ": " + notes : ""}`,
            tags: [],
            date: new Date(),
          },
        ]

        for (const mv of movements) {
          await fetch(`${API}/movements`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mv),
          })
        }

        Alert.alert("Listo", "Transferencia realizada")
        router.push(`/wallet?id=${id}`)
        return
      }

      const res = await fetch(`${API}/movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: id,
          user: selectedUser._id,
          type,
          amount: Number(amount),
          category: category._id,
          notes,
          tags: [],
          date: new Date(),
        }),
      })

      if (res.ok) {
        Alert.alert("Listo", "Movimiento creado")
        router.push(`/wallet?id=${id}`)
      } else {
        const data = await res.json()
        Alert.alert("Error", data.error || "No se pudo crear")
      }
    } catch (err) {
      console.error(err)
      Alert.alert("Error", "No se pudo conectar")
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.textTertiary} />
      </SafeAreaView>
    )
  }

  const availableTypes: MovementType[] =
    walletType === "shared" ? ["expense", "income", "transfer"] : ["expense", "income"]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
            <ArrowLeftIcon color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Nuevo movimiento</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={[styles.typeSelector, { backgroundColor: colors.surface }]}>
            {availableTypes.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, type === t && { backgroundColor: colors.cardBackground }]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeBtnText, { color: type === t ? colors.text : colors.textTertiary }]}>
                  {t === "expense" ? "Gasto" : t === "income" ? "Ingreso" : "Transferir"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.amountSection}>
            <Text style={[styles.currencySymbol, { color: colors.textTertiary }]}>€</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          {users.length > 0 && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {type === "transfer" ? "De" : "Usuario"}
              </Text>
              <TouchableOpacity
                style={[styles.selector, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
                onPress={() => setUserModalVisible(true)}
              >
                <View style={[styles.userAvatar, { backgroundColor: colors.cardBackground }]}>
                  <Text style={[styles.userAvatarText, { color: colors.text }]}>
                    {selectedUser?.name?.charAt(0) || "?"}
                  </Text>
                </View>
                <Text style={[styles.selectorText, { color: colors.text }]}>{selectedUser?.name || "Seleccionar"}</Text>
                <ChevronDownIcon color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          )}

          {type === "transfer" && users.length > 1 && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>A</Text>
              <TouchableOpacity
                style={[styles.selector, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
                onPress={() => setToUserModalVisible(true)}
              >
                <View style={[styles.userAvatar, { backgroundColor: colors.cardBackground }]}>
                  <Text style={[styles.userAvatarText, { color: colors.text }]}>
                    {transferToUser?.name?.charAt(0) || "?"}
                  </Text>
                </View>
                <Text style={[styles.selectorText, { color: colors.text }]}>
                  {transferToUser?.name || "Seleccionar"}
                </Text>
                <ChevronDownIcon color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Category (only for expense/income) */}
          {type !== "transfer" && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Categoría</Text>
              <TouchableOpacity
                style={[styles.selector, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
                onPress={() => setCategoryModalVisible(true)}
              >
                <Text style={[styles.selectorText, { color: category ? colors.text : colors.textTertiary }]}>
                  {category?.name || "Seleccionar categoría"}
                </Text>
                <ChevronDownIcon color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Notes */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nota (opcional)</Text>
            <TextInput
              style={[
                styles.notesInput,
                { backgroundColor: colors.surface, color: colors.text, borderColor: colors.surfaceBorder },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Añadir descripción..."
              placeholderTextColor={colors.textTertiary}
              multiline
            />
          </View>

          <TouchableOpacity style={[styles.submitBtn, { backgroundColor: ACCENT }]} onPress={handleCreateMovement}>
            <Text style={styles.submitBtnText}>
              {type === "transfer" ? "Transferir" : type === "expense" ? "Añadir gasto" : "Añadir ingreso"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Modal */}
      <Modal visible={categoryModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.textTertiary }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Categoría</Text>
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat._id}
                  style={[styles.modalItem, category?._id === cat._id && { backgroundColor: `${ACCENT}10` }]}
                  onPress={() => {
                    setCategory(cat)
                    setCategoryModalVisible(false)
                  }}
                >
                  <Text style={[styles.modalItemText, { color: colors.text }]}>{cat.name}</Text>
                  {category?._id === cat._id && <View style={[styles.checkDot, { backgroundColor: ACCENT }]} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setCategoryModalVisible(false)}>
              <Text style={[styles.modalCloseText, { color: colors.textSecondary }]}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* User Modal */}
      <Modal visible={userModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.textTertiary }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Seleccionar usuario</Text>
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {users.map((u) => (
                <TouchableOpacity
                  key={u._id}
                  style={[styles.modalItem, selectedUser?._id === u._id && { backgroundColor: `${ACCENT}10` }]}
                  onPress={() => {
                    setSelectedUser(u)
                    setUserModalVisible(false)
                  }}
                >
                  <View style={[styles.userAvatar, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.userAvatarText, { color: colors.text }]}>{u.name?.charAt(0)}</Text>
                  </View>
                  <Text style={[styles.modalItemText, { color: colors.text, flex: 1 }]}>{u.name}</Text>
                  {selectedUser?._id === u._id && <View style={[styles.checkDot, { backgroundColor: ACCENT }]} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setUserModalVisible(false)}>
              <Text style={[styles.modalCloseText, { color: colors.textSecondary }]}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Transfer To User Modal */}
      <Modal visible={toUserModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.textTertiary }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Transferir a</Text>
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {users
                .filter((u) => u._id !== selectedUser?._id)
                .map((u) => (
                  <TouchableOpacity
                    key={u._id}
                    style={[styles.modalItem, transferToUser?._id === u._id && { backgroundColor: `${ACCENT}10` }]}
                    onPress={() => {
                      setTransferToUser(u)
                      setToUserModalVisible(false)
                    }}
                  >
                    <View style={[styles.userAvatar, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.userAvatarText, { color: colors.text }]}>{u.name?.charAt(0)}</Text>
                    </View>
                    <Text style={[styles.modalItemText, { color: colors.text, flex: 1 }]}>{u.name}</Text>
                    {transferToUser?._id === u._id && <View style={[styles.checkDot, { backgroundColor: ACCENT }]} />}
                  </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setToUserModalVisible(false)}>
              <Text style={[styles.modalCloseText, { color: colors.textSecondary }]}>Cerrar</Text>
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
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },

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

  content: { paddingHorizontal: 24, paddingBottom: 120 },

  typeSelector: { flexDirection: "row", borderRadius: 12, padding: 4, marginBottom: 32 },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 10 },
  typeBtnText: { fontSize: 15, fontWeight: "600" },

  amountSection: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 40 },
  currencySymbol: { fontSize: 32, fontWeight: "300", marginRight: 8 },
  amountInput: { fontSize: 56, fontWeight: "700", minWidth: 100, textAlign: "center" },

  fieldGroup: { marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: "600", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },

  selector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectorText: { flex: 1, fontSize: 16, fontWeight: "500" },

  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userAvatarText: { fontSize: 14, fontWeight: "600" },

  notesInput: { borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, minHeight: 80, textAlignVertical: "top" },

  submitBtn: { paddingVertical: 18, borderRadius: 14, alignItems: "center", marginTop: 24 },
  submitBtnText: { fontSize: 17, fontWeight: "700", color: "#fff" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalContainer: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  modalItem: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 10, marginBottom: 4 },
  modalItemText: { fontSize: 16, fontWeight: "500" },
  checkDot: { width: 8, height: 8, borderRadius: 4 },
  modalClose: { paddingVertical: 16, alignItems: "center", marginTop: 8 },
  modalCloseText: { fontSize: 16, fontWeight: "600" },
})
