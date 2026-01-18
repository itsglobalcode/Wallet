import React from "react"
import Svg, { Path } from "react-native-svg"

interface ChevronDownIconProps {
    size?: number
    color?: string
}

export default function ChevronDownIcon({ size = 16, color = "#999" }: ChevronDownIconProps) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    )
}