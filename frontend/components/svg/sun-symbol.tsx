import React from "react"
import Svg, { Circle, Path } from "react-native-svg"

interface SunIconProps {
  size?: number
  color?: string
}

export default function SunIcon({ size = 20, color = "#000" }: SunIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2" />
    <Path
      d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
)}