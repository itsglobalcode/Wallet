"use client"

import { useEffect, useState } from "react"
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
} from "react-native"
import { router } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function QuizScreen() {
    const [userId, setUserId] = useState<string | null>(null)
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    const currentQuiz = quizzes[currentIndex]
    const isLast = currentIndex === quizzes.length - 1
    const hasSelected = answers[currentIndex] !== undefined
    const progress = quizzes.length
        ? ((currentIndex + 1) / quizzes.length) * 100
        : 0
    useEffect(() => {
        const init = async () => {
            const storedUserId = await AsyncStorage.getItem("userId")
            setUserId(storedUserId)

            try {
                const res = await fetch("http://localhost:3000/api/quiz/get")
                const data = await res.json()

                if (Array.isArray(data)) {
                    setQuizzes(data)
                } else {
                    console.error("La API no devuelve un array")
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        init()
    }, [])

    const handleSelectOption = (option: string) => {
        const nextAnswers = [...answers]
        nextAnswers[currentIndex] = option
        setAnswers(nextAnswers)
    }

    const handleContinue = () => {
        if (!hasSelected) return

        if (!isLast) {
            setCurrentIndex((prev) => prev + 1)
        } else {
            handleFinishQuiz()
        }
    }

    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1)
        }
    }

    const handleFinishQuiz = async () => {
        try {
            await fetch("http://localhost:3000/api/quiz/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: userId,
                    answers,
                }),
            })

            router.replace("/(tabs)")
        } catch (error) {
            console.error("Error enviando quiz:", error)
        }
    }

    if (loading || !currentQuiz) return null

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Progress */}
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>

            <View style={styles.container}>
                {/* Mascota + burbuja */}
                <View style={styles.header}>
                    <Image
                        source={require("../../assets/images/milo.png")}
                        style={styles.mascot}
                        resizeMode="contain"
                    />

                    <View style={styles.bubbleContainer} key={currentIndex}>
                        <View style={styles.speechBubble}>
                            <Text style={styles.speechText}>
                                {currentQuiz.question}
                            </Text>
                        </View>

                        <View style={styles.triangleBorder} />
                        <View style={styles.triangleInner} />
                    </View>
                </View>

                {/* Opciones */}
                <View style={styles.optionsWrapper}>
                    {currentQuiz.options.map((option: string, index: number) => {
                        const isSelected = answers[currentIndex] === option

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.optionButton,
                                    isSelected && styles.optionSelected,
                                ]}
                                onPress={() => handleSelectOption(option)}
                                activeOpacity={0.85}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        isSelected && styles.optionTextSelected,
                                    ]}
                                >
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={handleBack}
                    disabled={currentIndex === 0}
                    style={[
                        styles.navButton,
                        currentIndex === 0 && { opacity: 0.4 },
                    ]}
                >
                    <Text style={styles.navButtonText}>Atrás</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleContinue}
                    disabled={!hasSelected}
                    style={[
                        styles.navButton,
                        !hasSelected && { opacity: 0.4 },
                    ]}
                >
                    <Text style={styles.navButtonText}>
                        {isLast ? "Finalizar" : "Continuar"}
                    </Text>
                </TouchableOpacity>
            </View>
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
        padding: 20,
    },

    progressBarBackground: {
        height: 6,
        backgroundColor: "#eee",
        marginTop: 20,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 3,
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#000",
        borderRadius: 3,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 40,
    },
    mascot: {
        width: 120,
        height: 120,
        marginRight: 16,
    },
    bubbleContainer: {
        flex: 1,
        position: "relative",
    },
    speechBubble: {
        backgroundColor: "#f2f2f2",
        borderWidth: 2,
        borderColor: "#000",
        borderRadius: 16,
        padding: 16,
    },
    speechText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#000",
    },

    triangleBorder: {
        position: "absolute",
        left: -6,
        top: 18,
        width: 0,
        height: 0,
        borderTopWidth: 8,
        borderBottomWidth: 8,
        borderRightWidth: 10,
        borderTopColor: "transparent",
        borderBottomColor: "transparent",
        borderRightColor: "#000",
    },
    triangleInner: {
        position: "absolute",
        left: -4,
        top: 18,
        width: 0,
        height: 0,
        borderTopWidth: 8,
        borderBottomWidth: 8,
        borderRightWidth: 10,
        borderTopColor: "transparent",
        borderBottomColor: "transparent",
        borderRightColor: "#f2f2f2",
    },

    optionsWrapper: {
        gap: 14,
    },
    optionButton: {
        borderWidth: 2,
        borderColor: "#000",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: "#f9f9f9",
    },
    optionSelected: {
        backgroundColor: "#000",
    },
    optionText: {
        textAlign: "center",
        fontSize: 16,
        color: "#000",
        fontWeight: "600",
    },
    optionTextSelected: {
        color: "#fff",
    },

    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderColor: "#eee",
    },
    navButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: "#000",
        borderRadius: 12,
    },
    navButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
})
