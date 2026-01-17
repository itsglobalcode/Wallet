"use client"

import type React from "react"
import { View, StyleSheet } from "react-native"
import Svg, { Path, G } from "react-native-svg"

interface WorldMapSVGProps {
  visitedCountries: string[]
  onCountryPress: (countryId: string) => void
  defaultColor?: string
  visitedColor?: string
  strokeColor?: string
  width?: number
  height?: number
}

const WorldMapSVG: React.FC<WorldMapSVGProps> = ({
  visitedCountries,
  onCountryPress,
  defaultColor = "#ececec",
  visitedColor = "#ff6b35",
  strokeColor = "#cccccc",
  width = 400,
  height = 250,
}) => {
  const countries = [
    // North America
    { id: "US", d: "M 150 150 L 200 150 L 200 200 L 150 200 Z" },
    { id: "CA", d: "M 150 100 L 200 100 L 200 150 L 150 150 Z" },
    { id: "MX", d: "M 150 200 L 180 200 L 180 230 L 150 230 Z" },

    // Europe
    { id: "ES", d: "M 380 220 L 395 220 L 395 240 L 380 240 Z" },
    { id: "PT", d: "M 370 225 L 380 225 L 380 240 L 370 240 Z" },
    { id: "FR", d: "M 390 200 L 410 200 L 410 230 L 390 230 Z" },
    { id: "IT", d: "M 420 210 L 430 210 L 430 240 L 420 240 Z" },
    { id: "DE", d: "M 410 180 L 430 180 L 430 200 L 410 200 Z" },
    { id: "GB", d: "M 375 170 L 385 170 L 385 190 L 375 190 Z" },

    // Africa
    { id: "MA", d: "M 380 250 L 395 250 L 395 270 L 380 270 Z" },
    { id: "ZA", d: "M 420 380 L 440 380 L 440 410 L 420 410 Z" },

    // Asia
    { id: "JP", d: "M 700 180 L 715 180 L 715 200 L 700 200 Z" },
    { id: "TH", d: "M 600 260 L 620 260 L 620 290 L 600 290 Z" },
    { id: "IN", d: "M 550 270 L 580 270 L 580 320 L 550 320 Z" },
    { id: "CN", d: "M 600 150 L 680 150 L 680 230 L 600 230 Z" },

    // Oceania
    { id: "AU", d: "M 720 380 L 750 380 L 750 410 L 720 410 Z" },
    { id: "NZ", d: "M 760 400 L 775 400 L 775 420 L 760 420 Z" },
  ]

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg viewBox="0 0 960 600" width={width} height={height}>
        <G>
          {countries.map((country) => (
            <Path
              key={country.id}
              d={country.d}
              fill={visitedCountries.includes(country.id) ? visitedColor : defaultColor}
              stroke={strokeColor}
              strokeWidth="1"
              onPress={() => onCountryPress(country.id)}
            />
          ))}
        </G>
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
  },
})

export default WorldMapSVG
