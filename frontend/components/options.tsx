"use client"

import { View, StyleSheet, TouchableOpacity } from "react-native"
import { Link, usePathname } from "expo-router"
import HomeSymbol from "./ui/home-symbol"
import SearchSymbol from "./ui/search-symbol"
import MapSymbol from "./ui/map-symbol"
import WalletSymbol from "./ui/wallet-symbol"
import UserSymbol from "./ui/user-symbol"

export default function Options() {
  const pathname = usePathname()
  const isHomeActive = pathname === "/"

  return (
    <View style={styles.bottomBar}>
      <Link href="/(pages)/home" asChild>
        <TouchableOpacity style={styles.tabButton} activeOpacity={0.6}>
          <HomeSymbol color={isHomeActive ? "#000" : "#999"} />
        </TouchableOpacity>
      </Link>
      <Link href="/(pages)/search" asChild>
        <TouchableOpacity style={styles.tabButton} activeOpacity={0.6}>
          <SearchSymbol color={isHomeActive ? "#000" : "#999"} />
        </TouchableOpacity>
      </Link>
      <Link href="/(pages)/map" asChild>
        <TouchableOpacity style={styles.tabButton} activeOpacity={0.6}>
          <MapSymbol color={isHomeActive ? "#000" : "#999"} />
        </TouchableOpacity>
      </Link>
      <Link href="/(pages)/(wallet)/wallets" asChild>
        <TouchableOpacity style={styles.tabButton} activeOpacity={0.6}>
          <WalletSymbol color={isHomeActive ? "#000" : "#999"} />
        </TouchableOpacity>
      </Link>
      <Link href="/(pages)/user" asChild>
        <TouchableOpacity style={styles.tabButton} activeOpacity={0.6}>
          <UserSymbol color={isHomeActive ? "#000" : "#999"} />
        </TouchableOpacity>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    zIndex: 1000,
  },

  tabButton: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
})
