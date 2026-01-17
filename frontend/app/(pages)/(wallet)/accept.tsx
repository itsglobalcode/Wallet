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


const API_URL = "http://localhost:3000/api/wallet"

export default function AcceptInvite() {
    const { id, token } = useLocalSearchParams<{ id: string; token: string }>()
    const router = useRouter()

    console.log("id:", id, "token:", token)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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

                const res = await fetch(`${API_URL}/accept-invite`, {
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
            } catch (err) {
                console.error(err)
                setError("Error al aceptar la invitación")
                setLoading(false)
            }
        }

        acceptInvite()
    }, [token])

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" />
                <Text style={styles.infoText}>Aceptando invitación...</Text>
            </SafeAreaView>
        )
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                    <Text style={styles.buttonText}>Volver</Text>
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
    errorText: {
        fontSize: 16,
        color: "#e74c3c",
        textAlign: "center",
        marginBottom: 20,
    },
    button: {
        backgroundColor: "rgb(255, 107, 53)",
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
