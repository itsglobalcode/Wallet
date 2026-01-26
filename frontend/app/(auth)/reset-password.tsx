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
import { router, useLocalSearchParams } from "expo-router"
import { EyeSymbol, EyeOffSymbol } from "@/components/svg/eye-symbol"

const API_URL = process.env.EXPO_PUBLIC_URL 

export default function AuthResetPasswordScreen() {
  const { token } = useLocalSearchParams()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleResetPassword = async () => {
    if (!token) {
      setErrorMessage("Token inválido. Solicita un nuevo enlace de recuperación.")
      return
    }

    if (!newPassword || !confirmPassword) {
      setErrorMessage("Por favor completa todos los campos")
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden")
      return
    }

    if (newPassword.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)
    setErrorMessage("")
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resetToken: token, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        router.replace("/(auth)/login" as any)
      } else {
        setErrorMessage("Error al restablecer contraseña")
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

              <Text style={styles.title}>Nueva Contraseña</Text>

              <Text style={styles.description}>Ingresa tu nueva contraseña para acceder a tu cuenta.</Text>

              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Nueva contraseña"
                  placeholderTextColor="#666"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text)
                    setErrorMessage("")
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffSymbol size={20} color="#666" />
                  ) : (
                    <EyeSymbol size={20} color="#666" />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirmar nueva contraseña"
                  placeholderTextColor="#666"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOffSymbol size={20} color="#666" />
                  ) : (
                    <EyeSymbol size={20} color="#666" />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? "Guardando..." : "Restablecer Contraseña"}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backText}>Volver</Text>
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 14,
    marginBottom: 14,
    backgroundColor: "#111",
    paddingRight: 12,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 18,
    fontSize: 16,
    color: "#fff",
  },
  eyeButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
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
})
