"use client"

import { createContext, useContext, type ReactNode, useState, useEffect } from "react"
import { useColorScheme as useSystemColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

type Theme = "light" | "dark"

interface ThemeColors {
  background: string
  surface: string
  surfaceBorder: string
  text: string
  textSecondary: string
  textTertiary: string
  primary: string
  primaryText: string
  cardBackground: string
  cardBorder: string
  overlay: string
}

interface ThemeContextType {
  theme: Theme
  colors: ThemeColors
  isDark: boolean
  toggleTheme: () => void
}

const lightColors: ThemeColors = {
  background: "#ffffff",
  surface: "#f5f5f5",
  surfaceBorder: "#e0e0e0",
  text: "#000000",
  textSecondary: "#666666",
  textTertiary: "#999999",
  primary: "#000000",
  primaryText: "#ffffff",
  cardBackground: "#ffffff",
  cardBorder: "#e0e0e0",
  overlay: "rgba(0, 0, 0, 0.3)",
}

const darkColors: ThemeColors = {
  background: "#0a0a0a",
  surface: "#1a1a1a",
  surfaceBorder: "#2a2a2a",
  text: "#ffffff",
  textSecondary: "#888888",
  textTertiary: "#666666",
  primary: "#ffffff",
  primaryText: "#0a0a0a",
  cardBackground: "#1a1a1a",
  cardBorder: "#2a2a2a",
  overlay: "rgba(0, 0, 0, 0.3)",
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useSystemColorScheme()
  const [userTheme, setUserTheme] = useState<Theme | null>(null)

  useEffect(() => {
    // Load saved theme preference on mount
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("userTheme")
        if (savedTheme === "light" || savedTheme === "dark") {
          setUserTheme(savedTheme)
        }
      } catch (error) {
        console.error("Error loading theme:", error)
      }
    }
    loadTheme()
  }, [])

  // Use user preference if set, otherwise use system preference
  const isDark = userTheme !== null ? userTheme === "dark" : systemColorScheme === "dark"
  const theme: Theme = isDark ? "dark" : "light"
  const colors = isDark ? darkColors : lightColors

  const toggleTheme = async () => {
    const newTheme: Theme = isDark ? "light" : "dark"
    setUserTheme(newTheme)
    try {
      await AsyncStorage.setItem("userTheme", newTheme)
    } catch (error) {
      console.error("Error saving theme:", error)
    }
  }

  return <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
