'use client';

import React, { useEffect, useState } from "react"
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from "react-native"
import { useTheme } from "@/contexts/ThemeContext"

const API_BASE = "https://emojihub.yurace.pro/api"
const ACCENT = "#A855F7"

type EmojiItem = {
    name: string
    category: string
    group: string
    unicode: string[]
}

type CategoryEmojis = {
    [key: string]: EmojiItem[]
}

export default function EmojiHubPicker({
    visible,
    onClose,
    onEmojiSelected,
}: {
    visible: boolean
    onClose: () => void
    onEmojiSelected: (emoji: string) => void
}) {
    const { colors } = useTheme()
    const [categories, setCategories] = useState<string[]>([])
    const [activeCategory, setActiveCategory] = useState<string>("")
    const [allCategoryEmojis, setAllCategoryEmojis] = useState<CategoryEmojis>({})
    const [loading, setLoading] = useState(false)
    const [categoryEmojisLoading, setCategoryEmojisLoading] = useState<{ [key: string]: boolean }>({})

    // Obtener categorías y cargar todos los emojis al abrir
    useEffect(() => {
        if (visible) {
            fetchCategoriesAndEmojis()
        }
    }, [visible])

    const fetchCategoriesAndEmojis = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/categories`)
            const data: string[] = await res.json()
            setCategories(data)
            if (data.length > 0) {
                setActiveCategory(data[0])
            }

            // Cargar emojis de todas las categorías
            const allEmojis: CategoryEmojis = {}
            for (const category of data) {
                setCategoryEmojisLoading((prev) => ({ ...prev, [category]: true }))
                try {
                    const categorySlug = category.replace(/\s+/g, "-").toLowerCase()
                    const emojiRes = await fetch(`${API_BASE}/all/category/${categorySlug}`)
                    const emojiData: EmojiItem[] = await emojiRes.json()
                    allEmojis[category] = emojiData
                } catch (err) {
                    console.error(`Error cargando ${category}:`, err)
                    allEmojis[category] = []
                } finally {
                    setCategoryEmojisLoading((prev) => ({ ...prev, [category]: false }))
                }
            }
            setAllCategoryEmojis(allEmojis)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const unicodeToEmoji = (unicodeArr: string[]) =>
        unicodeArr.map((u) => String.fromCodePoint(parseInt(u.replace("U+", ""), 16))).join("")

    const currentEmojis = allCategoryEmojis[activeCategory] || []
    const isCurrentCategoryLoading = categoryEmojisLoading[activeCategory]

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity 
                style={styles.modalOverlay} 
                activeOpacity={1} 
                onPress={onClose}
            >
                <TouchableOpacity 
                    style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]} 
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <TouchableOpacity 
                        style={[styles.modalHandle, { backgroundColor: colors.textTertiary }]} 
                        onPress={onClose}
                    />
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Selecciona un emoji</Text>

                    {/* Categorías horizontal - Cargadas desde el header */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
                        {categories.map((cat) => {
                            const isActive = activeCategory === cat
                            const categoryEmojis = allCategoryEmojis[cat] || []
                            const emoji = categoryEmojis.length > 0 ? unicodeToEmoji(categoryEmojis[0].unicode) : "📦"

                            return (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.categoryChip, isActive && { backgroundColor: ACCENT, borderColor: ACCENT }]}
                                    onPress={() => setActiveCategory(cat)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.categoryEmoji}>{emoji}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>

                    {/* Grid de emojis */}
                    <View style={{ flex: 1 }}>
                        {isCurrentCategoryLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={ACCENT} />
                            </View>
                        ) : currentEmojis.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                                    Sin emojis disponibles
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={currentEmojis}
                                keyExtractor={(item) => item.unicode.join("")}
                                numColumns={7}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.grid}
                                renderItem={({ item }) => {
                                    const emoji = unicodeToEmoji(item.unicode)
                                    return (
                                        <TouchableOpacity
                                            style={[styles.emojiCell, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
                                            onPress={() => {
                                                onEmojiSelected(emoji)
                                                onClose()
                                            }}
                                            activeOpacity={0.6}
                                        >
                                            <Text style={styles.emojiText}>{emoji}</Text>
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                        )}
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        flex: 1,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 24,
        maxHeight: "85%",
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: "center",
        marginVertical: 12,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginHorizontal: 24,
        marginBottom: 16,
    },
    categories: {
        paddingHorizontal: 14,
        paddingBottom: 12,
        maxHeight: 60,
    },
    categoryChip: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 14,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "transparent",
        backgroundColor: "transparent",
    },
    categoryEmoji: {
        fontSize: 20,
        fontWeight: "500",
    },
    grid: {
        paddingHorizontal: 14,
        paddingBottom: 20,
        paddingTop: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 14,
        fontWeight: "500",
    },
    emojiCell: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        marginVertical: 6,
        marginHorizontal: 4,
        borderRadius: 12,
        borderWidth: 1,
        minHeight: 48,
    },
    emojiText: {
        fontSize: 28,
    },
})
