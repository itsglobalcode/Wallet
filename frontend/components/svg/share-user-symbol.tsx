import React from "react"
import Svg, { Path } from "react-native-svg"

interface UserPlusIconProps {
  size?: number
  color?: string
}

export default function UserPlusIcon({
  size = 18,
  color = "#000",
}: UserPlusIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      {/* Fondo invisible */}
      <Path d="M0 0h24v24H0z" fill="none" />

      {/* Cabeza */}
      <Path
        d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Línea horizontal del + */}
      <Path
        d="M16 19h6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Línea vertical del + */}
      <Path
        d="M19 16v6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Cuerpo */}
      <Path
        d="M6 21v-2a4 4 0 0 1 4 -4h4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
