"use client"

import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, Switch, Linking } from "react-native"
import { useRouter } from "expo-router"
import { useTheme } from "@/contexts/ThemeContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

import ArrowLeft from "@/components/svg/arrow-left"
import MoonIcon from "@/components/svg/moon-symbol"
import SunIcon from "@/components/svg/sun-symbol"
import InfoIcon from "@/components/svg/info-symbol"
import GlobeIcon from "@/components/svg/globe-symbol"

import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.BANNER : String(process.env.EXPO_PUBLIC_AD_UNIT_ID);

const ACCENT = "#A855F7"

const API_URL = process.env.EXPO_PUBLIC_URL

export default function UserSettingsScreen() {
    const { colors, isDark, toggleTheme } = useTheme()
    const { language, setLanguage, t } = useLanguage()
    const router = useRouter()
    const [userName, setUserName] = useState("Usuario")

    useEffect(() => {
        const loadUserData = async () => {
            const storedName = await AsyncStorage.getItem("userName")
            if (storedName) setUserName(storedName)
        }
        loadUserData()
    }, [])

    const handleThemeToggle = () => {
        toggleTheme()
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.headerBtn, { backgroundColor: colors.surface }]}>
                    <ArrowLeft color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t("settings")}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* User Info Section */}
                <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("profile")}</Text>
                    <View style={styles.userCard}>
                        <View style={styles.userAvatar}>
                            <Text style={styles.avatarText}>{userName?.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
                            <Text style={[styles.userEmail, { color: colors.textTertiary }]}>{t("neonWalletUser")}</Text>
                        </View>
                    </View>
                </View>

                {/* Theme Settings */}
                <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("appearance")}</Text>
                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            {isDark ? <MoonIcon size={20} color={ACCENT} /> : <SunIcon size={20} color={ACCENT} />}
                            <View style={styles.settingTextWrapper}>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>
                                    {isDark ? t("darkTheme") : t("lightTheme")}
                                </Text>
                                <Text style={[styles.settingDescription, { color: colors.textTertiary }]}>
                                    {isDark ? t("darkModeActive") : t("lightModeActive")}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={handleThemeToggle}
                            trackColor={{ false: colors.surface, true: ACCENT }}
                            thumbColor={isDark ? "#fff" : colors.text}
                        />
                    </View>
                </View>

                {/* Language Settings */}
                <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("language")}</Text>
                    <View style={styles.languageSelector}>
                        <View style={styles.languageHeader}>
                            <GlobeIcon size={20} color={ACCENT} />
                            <Text style={[styles.languageLabel, { color: colors.text }]}>{t("selectLanguage")}</Text>
                        </View>
                        <View style={styles.languageButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.languageButton,
                                    {
                                        backgroundColor: language === "es" ? ACCENT : colors.surface,
                                        borderColor: language === "es" ? ACCENT : colors.surfaceBorder,
                                    }
                                ]}
                                onPress={() => setLanguage("es")}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.languageFlag}>🇪🇸</Text>
                                <Text style={[
                                    styles.languageText,
                                    { color: language === "es" ? "#fff" : colors.text }
                                ]}>
                                    {t("spanish")}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.languageButton,
                                    {
                                        backgroundColor: language === "en" ? ACCENT : colors.surface,
                                        borderColor: language === "en" ? ACCENT : colors.surfaceBorder,
                                    }
                                ]}
                                onPress={() => setLanguage("en")}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.languageFlag}>🇬🇧</Text>
                                <Text style={[
                                    styles.languageText,
                                    { color: language === "en" ? "#fff" : colors.text }
                                ]}>
                                    {t("english")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* App Info */}
                <TouchableOpacity onPress={() => Linking.openURL("https://thenomadapp.net")} activeOpacity={0.7}>
                    <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("about")}</Text>
                        <View style={[styles.infoBox, { backgroundColor: `${ACCENT}10`, borderColor: `${ACCENT}30` }]}>
                            <InfoIcon size={20} color={ACCENT} />
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoBrand, { color: colors.text }]}>NeonWallet</Text>
                                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                                    {t("neonWalletDescription")}
                                </Text>
                                <Text style={[styles.infoPowered, { color: ACCENT }]}>{t("poweredBy")}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={{ height: 60, justifyContent: "center", alignItems: "center" }}>
                    <BannerAd
                        unitId={adUnitId}
                        size={BannerAdSize.BANNER}
                        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                    />
                </View>

                {/* Version Info */}
                <View style={styles.versionBox}>
                    <Text style={[styles.versionText, { color: colors.textTertiary }]}>{t("version")}</Text>
                    <Text style={[styles.versionSubtext, { color: colors.textTertiary }]}>{t("copyright")}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        gap: 20,
    },
    section: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 8,
    },
    userCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#A855F7",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
    },
    settingLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    settingTextWrapper: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 13,
    },
    languageSelector: {
        gap: 12,
    },
    languageHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 4,
    },
    languageLabel: {
        fontSize: 15,
        fontWeight: "600",
    },
    languageButtons: {
        flexDirection: "row",
        gap: 12,
    },
    languageButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
    },
    languageFlag: {
        fontSize: 20,
    },
    languageText: {
        fontSize: 15,
        fontWeight: "600",
    },
    infoBox: {
        flexDirection: "row",
        gap: 12,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "flex-start",
    },
    infoContent: {
        flex: 1,
    },
    infoBrand: {
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 8,
    },
    infoPowered: {
        fontSize: 12,
        fontWeight: "600",
    },
    nomadSection: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        gap: 8,
    },
    nomadTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 8,
    },
    nomadText: {
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 12,
    },
    nomadFeatures: {
        fontSize: 13,
        lineHeight: 20,
        fontWeight: "500",
    },
    versionBox: {
        alignItems: "center",
        paddingVertical: 24,
    },
    versionText: {
        fontSize: 13,
        fontWeight: "500",
    },
    versionSubtext: {
        fontSize: 12,
        marginTop: 4,
    },
})