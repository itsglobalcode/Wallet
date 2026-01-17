"use client"

import { useState } from "react"
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  SafeAreaView,
  Text,
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { ThemedText } from "@/components/themed-text"

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams()
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async () => {
    if (!code || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden")
      return
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, resetToken: code, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        Alert.alert("Éxito", "Contraseña restablecida correctamente", [
          {
            text: "OK",
            onPress: () => router.replace("/login" as any),
          },
        ])
      } else {
        Alert.alert("Error", data.message || "Error al restablecer contraseña")
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el servidor")
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
              <Text style={styles.brandName}>NOMAD</Text>
              <Text style={styles.tagline}>Tu viaje empieza aquí</Text>

              <ThemedText type="title" style={styles.title}>
                Nueva Contraseña
              </ThemedText>

              <ThemedText style={styles.description}>
                Ingresa el código que recibiste en tu email y tu nueva contraseña.
              </ThemedText>

              <TextInput
                style={styles.input}
                placeholder="Código de recuperación"
                placeholderTextColor="#999"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />

              <TextInput
                style={styles.input}
                placeholder="Nueva contraseña"
                placeholderTextColor="#999"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />

              <TextInput
                style={styles.input}
                placeholder="Confirmar nueva contraseña"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
                <ThemedText style={styles.buttonText}>{loading ? "Guardando..." : "Restablecer Contraseña"}</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ThemedText style={styles.backText}>Volver</ThemedText>
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
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fafafa",
    color: "#000",
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
  backButton: {
    marginTop: 24,
    alignSelf: "center",
  },
  backText: {
    color: "#666",
    fontSize: 14,
  },
})
