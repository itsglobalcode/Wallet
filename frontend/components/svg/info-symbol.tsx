import React from "react"
import Svg, { Circle, Path } from "react-native-svg"

interface InfoIconProps {
    size?: number
    color?: string
}

export default function InfoIcon({ size = 20, color = "#000" }: InfoIconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
            <Path d="M12 16v-4M12 8h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
    )
}