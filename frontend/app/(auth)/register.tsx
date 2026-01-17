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
import { Link, router } from "expo-router"
import { ThemedText } from "@/components/themed-text"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function RegisterScreen() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden")
      return
    }

    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        await AsyncStorage.setItem("userId", data.user.id)
        await AsyncStorage.setItem("userEmail", email)
        await AsyncStorage.setItem("userName", name)
        await AsyncStorage.setItem("isSetup", "true")

        router.replace("/(auth)/verify-2fa")
      } else {
        Alert.alert("Error", data.message || "Error al crear la cuenta")
      }
    } catch (error) {
      console.error("Register error:", error)
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
                Crear Cuenta
              </ThemedText>

              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                <ThemedText style={styles.buttonText}>{loading ? "Cargando..." : "Registrarse"}</ThemedText>
              </TouchableOpacity>

              <Link href="/(auth)/login" style={styles.link} asChild>
                <TouchableOpacity>
                  <ThemedText style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</ThemedText>
                </TouchableOpacity>
              </Link>
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
    marginBottom: 32,
    textAlign: "center",
    fontSize: 24,
    color: "#333",
    fontWeight: "600",
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
  link: {
    marginTop: 24,
    alignSelf: "center",
  },
  linkText: {
    color: "#666",
    fontSize: 14,
  },
})
