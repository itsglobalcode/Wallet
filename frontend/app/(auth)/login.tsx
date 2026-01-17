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

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        await AsyncStorage.setItem("userId", data.userId)
        if (data.requires2FA) {
          router.replace("/(auth)/verify-2fa")
        } else {
          Alert.alert("Éxito", "Inicio de sesión exitoso")
          router.replace("/(pages)/home")
        }
      } else {
        Alert.alert("Error", data.message || "Error al iniciar sesión")
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
                Bienvenido
              </ThemedText>

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

              <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                <ThemedText style={styles.buttonText}>{loading ? "Cargando..." : "Iniciar Sesión"}</ThemedText>
              </TouchableOpacity>

              <Link href="/(auth)/register" style={styles.link} asChild>
                <TouchableOpacity>
                  <ThemedText style={styles.linkText}>¿No tienes cuenta? Regístrate</ThemedText>
                </TouchableOpacity>
              </Link>

              <Link href="/(auth)/forgot-password" style={styles.forgotLink} asChild>
                <TouchableOpacity>
                  <ThemedText style={styles.forgotText}>¿Olvidaste tu contraseña?</ThemedText>
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
  forgotLink: {
    marginTop: 16,
    alignSelf: "center",
  },
  forgotText: {
    color: "#666",
    fontSize: 13,
  },
})
