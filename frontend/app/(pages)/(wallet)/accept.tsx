"use client"

import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    StyleSheet,
} from "react-native"
import { useEffect, useState } from "react"
import { useRouter, useLocalSearchParams } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"

const API_URL = process.env.EXPO_PUBLIC_API_URL
const WALLET_API = `${API_URL}/api/wallet`

export default function AcceptInvite() {
    const { id, token } = useLocalSearchParams<{ id: string; token: string }>()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!token) {
            setError("Token no proporcionado")
            setLoading(false)
            return
        }

        const acceptInvite = async () => {
            try {
                const userId = await AsyncStorage.getItem("userId")
                if (!userId) {
                    setError("Usuario no autenticado")
                    setLoading(false)
                    return
                }
                const res = await fetch(`${WALLET_API}/accept-invite`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ inviteId: id, token: token }),
                })

                const data = await res.json()

                if (!res.ok) {
                    setError(data.error || "Error al aceptar la invitación")
                    setLoading(false)
                    return
                }

                // Aceptación exitosa - mostrar feedback breve y redirigir
                setSuccess(true)
                setLoading(false)
                setTimeout(() => {
                    router.replace("/wallets")
                }, 800)
            } catch {
                setError("Error al aceptar la invitación")
                setLoading(false)
            }
        }

        acceptInvite()
    }, [token])

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#A855F7" />
                <Text style={styles.infoText}>Aceptando invitación...</Text>
            </SafeAreaView>
        )
    }

    if (success) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.successIcon}>
                    <Text style={styles.successEmoji}>✓</Text>
                </View>
                <Text style={styles.successText}>Aceptado</Text>
            </SafeAreaView>
        )
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.button} onPress={() => router.push("/wallets")}>
                    <Text style={styles.buttonText}>Ir a Wallets</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }

    return null
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 20,
    },
    infoText: {
        marginTop: 20,
        fontSize: 16,
        color: "#000",
        fontWeight: "600",
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#A855F7",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    successEmoji: {
        fontSize: 40,
        color: "#fff",
        fontWeight: "700",
    },
    successText: {
        fontSize: 20,
        color: "#A855F7",
        fontWeight: "700",
    },
    errorText: {
        fontSize: 16,
        color: "#e74c3c",
        textAlign: "center",
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#A855F7",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
    },
})
