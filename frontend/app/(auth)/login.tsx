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
import AsyncStorage from "@react-native-async-storage/async-storage"
import { EyeSymbol, EyeOffSymbol } from "@/components/svg/eye-symbol"

const API_URL = "http://localhost:3000"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        await AsyncStorage.setItem("userId", data.user.id)
        await AsyncStorage.setItem("userName", data.user.name)
        await AsyncStorage.setItem("userEmail", data.user.email)
        await AsyncStorage.setItem("isVerified", "true")
        Alert.alert("Éxito", "Inicio de sesión exitoso")
        router.replace("/(tabs)")
      } else {
        // Mostrar mensajes específicos según el error
        if (response.status === 401) {
          Alert.alert("Error", "Contraseña incorrecta")
        } else if (response.status === 404) {
          Alert.alert("Error", "Usuario no encontrado")
        } else {
          Alert.alert("Error", data.message || "Error al iniciar sesión")
        }
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
              <View style={styles.brandSection}>
                <Text style={styles.brandName}>NeonWallet</Text>
                <Text style={styles.tagline}>powered by Nomad</Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Contraseña"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
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

              <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? "Cargando..." : "Iniciar Sesión"}</Text>
              </TouchableOpacity>

              <Link href="/(auth)/register" style={styles.link} asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>
                    ¿No tienes cuenta? <Text style={styles.linkHighlight}>Regístrate</Text>
                  </Text>
                </TouchableOpacity>
              </Link>

              <Link href="/(auth)/forgot-password" style={styles.forgotLink} asChild>
                <TouchableOpacity>
                  <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
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
    marginBottom: 48,
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
  link: {
    marginTop: 24,
    alignSelf: "center",
  },
  linkText: {
    color: "#666",
    fontSize: 14,
  },
  linkHighlight: {
    color: "#A855F7",
    fontWeight: "600",
  },
  forgotLink: {
    marginTop: 12,
    alignSelf: "center",
  },
  forgotText: {
    color: "#666",
    fontSize: 13,
  },
})
