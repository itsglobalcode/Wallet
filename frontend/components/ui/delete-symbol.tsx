import React from "react"
import { Svg, Path } from "react-native-svg"

interface DeleteIconProps {
  size?: number
  color?: string
}

export default function DeleteIcon({ size = 24, color = "red" }: DeleteIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <Path d="M4 7h16" />
      <Path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
      <Path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
      <Path d="M10 12l4 4m0 -4l-4 4" />
    </Svg>
  )
}
