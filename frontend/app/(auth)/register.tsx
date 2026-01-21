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

export default function RegisterScreen() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
        await AsyncStorage.setItem("isVerified", "true")
        Alert.alert("Éxito", "Cuenta creada correctamente")
        router.replace("/(tabs)")
      } else {
        // Mostrar mensajes específicos según el error
        if (response.status === 409 || data.message?.includes("ya existe") || data.message?.includes("already exists")) {
          Alert.alert("Error", "Este email ya está registrado")
        } else if (data.message?.includes("formato")) {
          Alert.alert("Error", "Email con formato inválido")
        } else {
          Alert.alert("Error", data.message || "Error al crear la cuenta")
        }
      }
    } catch {
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
                placeholder="Nombre completo"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
              />

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

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirmar contraseña"
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

              <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? "Cargando..." : "Crear cuenta"}</Text>
              </TouchableOpacity>

              <Link href="/(auth)/login" style={styles.link} asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>
                    ¿Ya tienes cuenta? <Text style={styles.linkHighlight}>Inicia sesión</Text>
                  </Text>
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
})
