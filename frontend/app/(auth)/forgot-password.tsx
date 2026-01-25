"use client"

import { useState } from "react"
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  SafeAreaView,
  Text,
} from "react-native"
import { router } from "expo-router"

const API_URL = process.env.EXPO_PUBLIC_API_URL

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMessage("Por favor ingresa tu email")
      return
    }

    setLoading(true)
    setErrorMessage("")
    setSuccessMessage("")
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage("Se ha enviado un enlace de recuperación a tu email")
        setTimeout(() => {
          router.push("/(auth)/reset-password" as any)
        }, 2000)
      } else {
        setErrorMessage(data.message || "Error al enviar enlace")
      }
    } catch (error) {
      setErrorMessage("No se pudo conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.centerWrapper}>
            <View style={styles.content}>
              <View style={styles.brandSection}>
                <Text style={styles.brandName}>NeonWallet</Text>
                <Text style={styles.tagline}>powered by Nomad</Text>
              </View>

              <Text style={styles.title}>Recuperar Contraseña</Text>

              <Text style={styles.description}>
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
              </Text>

              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {successMessage ? (
                <View style={styles.successContainer}>
                  <Text style={styles.successText}>{successMessage}</Text>
                </View>
              ) : null}

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={(text) => {
                  setEmail(text)
                  setErrorMessage("")
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TouchableOpacity style={styles.button} onPress={handleForgotPassword} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? "Enviando..." : "Enviar Enlace"}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backText}>Volver al inicio de sesión</Text>
              </TouchableOpacity>
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
    backgroundColor: "#0a0a0a",
  },
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
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
    padding: 32,
    width: "100%",
    maxWidth: 380,
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  brandName: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: "#666",
    marginTop: 6,
    fontWeight: "400",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 20,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 14,
    paddingHorizontal: 18,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: "#111",
    color: "#fff",
  },
  button: {
    backgroundColor: "#A855F7",
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 24,
    alignSelf: "center",
  },
  backText: {
    color: "#666",
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: "#fee",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#fcc",
  },
  errorText: {
    color: "#c00",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  successContainer: {
    backgroundColor: "#efe",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#cfc",
  },
  successText: {
    color: "#0a0",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
})
