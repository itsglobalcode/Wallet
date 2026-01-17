"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useColorScheme as useSystemColorScheme } from "react-native"

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
  const theme: Theme = systemColorScheme === "dark" ? "dark" : "light"
  const colors = theme === "dark" ? darkColors : lightColors

  return <ThemeContext.Provider value={{ theme, colors }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
