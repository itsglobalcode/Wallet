import React from "react"
import Svg, { Path } from "react-native-svg"

interface SwapIconProps {
    size?: number
    color?: string
}

export default function SwapIcon({ size = 20, color = "#000" }: SwapIconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M7 10l5-5 5 5M7 14l5 5 5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    )
}