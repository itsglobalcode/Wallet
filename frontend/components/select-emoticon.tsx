import { useState } from "react"
import {
    View,
    Text,
    Modal,
    SafeAreaView,
    Pressable,
    StyleSheet,
    Platform,
} from "react-native"
import EmojiSelector from "react-native-emoji-selector"

type Props = {
    value?: string
    onChange: (emoji: string) => void
    colors: any
}

export default function EmojiSelectorField({
    value = "🙂",
    onChange,
    colors,
}: Props) {
    const [visible, setVisible] = useState(false)

    return (
        <>
            {/* SMALL SELECTOR */}
            <Pressable
                onPress={() => setVisible(true)}
                style={({ pressed }) => [
                    styles.trigger,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.surfaceBorder,
                        opacity: pressed ? 0.85 : 1,
                    },
                ]}
            >
                <Text style={styles.emoji}>{value}</Text>
            </Pressable>

            {/* MODAL */}
            <Modal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.modalRoot}>
                    {/* Overlay */}
                    <Pressable
                        style={styles.overlay}
                        onPress={() => setVisible(false)}
                    />

                    {/* Bottom sheet */}
                    <View
                        style={[
                            styles.sheet,
                            { backgroundColor: colors.cardBackground },
                        ]}
                    >
                        {/* Handle */}
                        <View
                            style={[
                                styles.handle,
                                { backgroundColor: colors.textTertiary },
                            ]}
                        />

                        {/* Header */}
                        <Text
                            style={[
                                styles.title,
                                { color: colors.text },
                            ]}
                        >
                            Elige un emoji
                        </Text>

                        <SafeAreaView style={{ flex: 1 }}>
                            <EmojiSelector
                                onEmojiSelected={(emoji) => {
                                    onChange(emoji)
                                    setVisible(false)
                                }}
                                showSearchBar
                                showTabs
                                showHistory
                                columns={8}
                            />
                        </SafeAreaView>
                    </View>
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    trigger: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOpacity: Platform.OS === "ios" ? 0.12 : 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    emoji: {
        fontSize: 22,
    },
    modalRoot: {
        flex: 1,
        justifyContent: "flex-end",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.45)",
    },
    sheet: {
        height: "72%",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: "hidden",
    },
    handle: {
        width: 44,
        height: 4,
        borderRadius: 2,
        alignSelf: "center",
        marginVertical: 12,
        opacity: 0.6,
    },
    title: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
})
