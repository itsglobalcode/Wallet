"use client"

import { useState, useEffect, useRef } from "react"
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
import { router } from "expo-router"
import { ThemedText } from "@/components/themed-text"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function Verify2FAScreen() {
    const [userId, setUserId] = useState("")
    const [email, setEmail] = useState("")
    const [isSetup, setIsSetup] = useState(false)

    const [code, setCode] = useState(["", "", "", "", "", ""])
    const inputRefs = useRef<TextInput[]>([])

    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)

    const [timeLeft, setTimeLeft] = useState(300) // 300 segundos = 5 minutos

    useEffect(() => {
        const loadStoredData = async () => {
            const storedUserId = await AsyncStorage.getItem("userId")
            const storedEmail = await AsyncStorage.getItem("userEmail")
            const storedIsSetup = await AsyncStorage.getItem("isSetup")

            if (storedUserId) setUserId(storedUserId)
            if (storedEmail) setEmail(storedEmail)
            if (storedIsSetup === "true") setIsSetup(true)
        }

        loadStoredData()
    }, [])

    useEffect(() => {
        if (timeLeft <= 0) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const handleCodeChange = (text: string, index: number) => {
        // Solo permitir números
        const numericText = text.replace(/[^0-9]/g, "")

        if (numericText.length > 1) {
            // Si pega múltiples dígitos, distribuirlos
            const digits = numericText.split("").slice(0, 6)
            const newCode = [...code]
            digits.forEach((digit, i) => {
                if (index + i < 6) {
                    newCode[index + i] = digit
                }
            })
            setCode(newCode)

            // Enfocar la siguiente casilla vacía o la última
            const nextIndex = Math.min(index + digits.length, 5)
            inputRefs.current[nextIndex]?.focus()
            return
        }

        const newCode = [...code]
        newCode[index] = numericText
        setCode(newCode)

        // Auto-focus siguiente casilla
        if (numericText && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleResendCode = async () => {
        if (!userId) {
            Alert.alert("Error", "No se encontró información del usuario")
            return
        }

        setResending(true)
        try {
            const response = await fetch("http://localhost:3000/api/auth/2fa/send-code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            })

            const data = await response.json()

            if (response.ok) {
                Alert.alert("Código reenviado", "Hemos enviado un nuevo código a tu email")
                setTimeLeft(300)
                setCode(["", "", "", "", "", ""])
                inputRefs.current[0]?.focus()
            } else {
                Alert.alert("Error", data.message || "No se pudo reenviar el código")
            }
        } catch (error) {
            Alert.alert("Error de conexión", "No se pudo conectar con el servidor")
        } finally {
            setResending(false)
        }
    }

    const handleVerify = async () => {
        const fullCode = code.join("")

        if (fullCode.length !== 6) {
            Alert.alert("Error", "Por favor ingresa el código completo de 6 dígitos")
            return
        }

        if (!userId) {
            Alert.alert("Error", "No se encontró información del usuario")
            return
        }

        if (timeLeft === 0) {
            Alert.alert("Código expirado", "El código ha expirado. Por favor solicita uno nuevo.")
            return
        }

        setLoading(true)
        try {
            const endpoint = isSetup ? "2fa/verify" : "login/2fa"

            const response = await fetch(`http://localhost:3000/api/auth/${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId, token: fullCode }),
            })

            const data = await response.json()

            if (response.ok) {
                router.replace("/(tabs)")
            } else {
                if (response.status === 400 && data.message?.includes("expirado")) {
                    Alert.alert("Código expirado", "El código ha expirado. Por favor solicita uno nuevo.")
                } else if (response.status === 400 || data.message?.includes("incorrecto")) {
                    Alert.alert("Código incorrecto", "El código que ingresaste no es válido. Verifica e intenta de nuevo.")
                } else {
                    Alert.alert("Error", data.message || "No se pudo verificar el código")
                }
                setCode(["", "", "", "", "", ""])
                inputRefs.current[0]?.focus()
            }
        } catch (error) {
            console.error("Verify error:", error)
            Alert.alert("Error de conexión", "No se pudo conectar con el servidor. Verifica tu conexión a internet.")
        } finally {
            setLoading(false)
        }
    }

    const isCodeComplete = code.every((digit) => digit !== "")

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
                                Verificación de Email
                            </ThemedText>

                            <ThemedText style={styles.description}>
                                Se ha enviado un código de 6 dígitos a tu email{email ? ` (${email})` : ""}. Este código tiene una
                                validez de 5 minutos.
                            </ThemedText>

                            <ThemedText style={styles.instructionText}>Por favor ingresa el código:</ThemedText>

                            <View style={styles.codeInputContainer}>
                                {code.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => {
                                            if (ref) {
                                                inputRefs.current[index] = ref
                                            }
                                        }}
                                        style={[styles.codeInput, digit !== "" && styles.codeInputFilled]}
                                        value={digit}
                                        onChangeText={(text) => handleCodeChange(text, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        textAlign="center"
                                        selectTextOnFocus
                                    />
                                ))}
                            </View>

                            <View style={styles.timerContainer}>
                                <ThemedText style={[styles.timerText, timeLeft < 60 && styles.timerTextUrgent]}>
                                    {timeLeft > 0 ? `Expira en ${formatTime(timeLeft)}` : "Código expirado"}
                                </ThemedText>
                            </View>

                            <TouchableOpacity
                                style={[styles.button, (!isCodeComplete || loading) && styles.buttonDisabled]}
                                onPress={handleVerify}
                                disabled={loading || !isCodeComplete || timeLeft === 0}
                            >
                                <ThemedText style={styles.buttonText}>{loading ? "Verificando..." : "Continuar"}</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.resendButton} onPress={handleResendCode} disabled={resending}>
                                <ThemedText style={styles.resendButtonText}>{resending ? "Reenviando..." : "Reenviar mail"}</ThemedText>
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
        marginBottom: 24,
        textAlign: "center",
        fontSize: 14,
        color: "#666",
        lineHeight: 22,
        paddingHorizontal: 8,
    },
    instructionText: {
        marginBottom: 16,
        textAlign: "center",
        fontSize: 15,
        color: "#333",
        fontWeight: "500",
    },
    codeInputContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 24,
        gap: 6,
    },
    codeInput: {
        width: 48,
        height: 48,
        borderWidth: 2,
        borderColor: "#e0e0e0",
        borderRadius: 10,
        fontSize: 24,
        backgroundColor: "#fafafa",
        color: "#000",
        fontWeight: "700",
        textAlign: "center",
        textAlignVertical: "center",
        paddingTop: 0,
        paddingBottom: 0,
    },
    codeInputFilled: {
        borderColor: "#000",
        backgroundColor: "#f0f0f0",
    },
    timerContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    timerText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    timerTextUrgent: {
        color: "#ff4444",
    },
    button: {
        backgroundColor: "#000",
        height: 52,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    buttonDisabled: {
        backgroundColor: "#ccc",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    resendButton: {
        height: 52,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 12,
    },
    resendButtonText: {
        color: "#666",
        fontSize: 14,
        fontWeight: "500",
    },
})
