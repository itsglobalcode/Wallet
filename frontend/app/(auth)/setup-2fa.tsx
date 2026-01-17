"use client"

import { useState, useEffect } from "react"
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  SafeAreaView,
  Text,
  Image,
  ActivityIndicator,
  Clipboard,
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { ThemedText } from "@/components/themed-text"

export default function Setup2FAScreen() {
  const { userId } = useLocalSearchParams()
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQRCode()
  }, [])

  const fetchQRCode = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/2fa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })
      const data = await response.json()

      if (response.ok) {
        setQrCode(data.qrCode)
        setSecret(data.manualCode)
      } else {
        Alert.alert("Error", data.message || "No se pudo generar el código QR")
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  const handleCopySecret = async () => {
    await Clipboard.setString(secret)
    Alert.alert("Copiado", "El código ha sido copiado al portapapeles")
  }

  const handleContinue = () => {
    router.push({
      pathname: "/(auth)/verify-2fa",
      params: { userId, isSetup: "true" },
    })
  }

  const handleSkip = () => {
    router.replace("/(auth)/quiz")
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.centerWrapper}>
            <View style={styles.content}>
              <Text style={styles.brandName}>NOMAD</Text>
              <Text style={styles.tagline}>Tu viaje empieza aquí</Text>

              <ThemedText type="title" style={styles.title}>
                Autenticación 2FA
              </ThemedText>

              <ThemedText style={styles.description}>
                Recomendamos activar la autenticación de dos factores para mayor seguridad de tu cuenta. Si decides
                activarla, escanea este código QR con Google Authenticator o Authy.
              </ThemedText>

              {loading ? (
                <ActivityIndicator size="large" color="#000" style={styles.loader} />
              ) : (
                <>
                  <View style={styles.qrContainer}>
                    <Image source={{ uri: qrCode }} style={styles.qrCode} resizeMode="contain" />
                  </View>

                  <TouchableOpacity style={styles.secretContainer} onPress={handleCopySecret} activeOpacity={0.7}>
                    <ThemedText style={styles.secretLabel}>Código manual (toca para copiar):</ThemedText>
                    <ThemedText style={styles.secretText}>{secret}</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.button} onPress={handleContinue}>
                    <ThemedText style={styles.buttonText}>Continuar</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <ThemedText style={styles.skipButtonText}>Omitir por ahora</ThemedText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100%",
  },
  content: {
    backgroundColor: "#fff",
    padding: 40,
    width: "100%",
    maxWidth: 400,
  },
  brandName: {
    fontSize: 36,
    fontWeight: "900",
    color: "#000",
    marginBottom: 8,
    letterSpacing: 4,
    textAlign: "center",
  },
  tagline: {
    fontSize: 14,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
    fontWeight: "400",
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 24,
    color: "#333",
    fontWeight: "600",
  },
  description: {
    marginBottom: 32,
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  loader: {
    marginVertical: 40,
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 24,
    padding: 20,
    backgroundColor: "#fafafa",
    borderRadius: 12,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  secretContainer: {
    padding: 16,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    marginBottom: 24,
  },
  secretLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  secretText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 2,
  },
  button: {
    backgroundColor: "#000",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  skipButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
})
