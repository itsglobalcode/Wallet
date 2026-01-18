import React from "react"
import Svg, { Circle, Path } from "react-native-svg"

interface GlobeIconProps {
    size?: number
    color?: string
}

export default function GlobeIcon({ size = 18, color = "#000" }: GlobeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path
      d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
      stroke={color}
      strokeWidth="2"
    />
  </Svg>
)}