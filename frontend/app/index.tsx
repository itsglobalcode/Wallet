"use client"

import mobileAds from 'react-native-google-mobile-ads';
import { useEffect } from "react"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { View, ActivityIndicator, Linking } from "react-native"

export default function Index() {
    const router = useRouter()

    useEffect(() => {
        mobileAds().initialize();
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
        try {

            const initialUrl = await Linking.getInitialURL();

            if (initialUrl?.includes("reset-password") || initialUrl?.includes("accept")) {
                return; 
            }

            const userId = await AsyncStorage.getItem("userId")
            const isVerified = await AsyncStorage.getItem("isVerified")

            if (userId && isVerified === "true") {
                router.replace("/(tabs)")
            } else {
                router.replace("/(auth)/login")
            }
        } catch (error) {
            console.error("Error verificando autenticación:", error)
            router.replace("/(auth)/login")
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
        </View>
    )
}
