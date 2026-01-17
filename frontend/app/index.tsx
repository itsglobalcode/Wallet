"use client"

import { useEffect } from "react"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { View, ActivityIndicator } from "react-native"

export default function Index() {
    const router = useRouter()

    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
        try {
            const userId = await AsyncStorage.getItem("userId")
            const isVerified = await AsyncStorage.getItem("isVerified")

            if (userId && isVerified === "true") {
                router.replace("/(tabs)")
            } else {
                router.replace("/(auth)/login")
            }
        } catch (error) {
            console.error("Error verificando autenticación:", error)
            // En caso de error, ir a login
            router.replace("/(auth)/login")
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
        </View>
    )
}
