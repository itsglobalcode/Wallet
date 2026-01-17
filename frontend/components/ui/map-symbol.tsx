import React from "react"
import Svg, { Path } from "react-native-svg"

type Props = {
  size?: number
  color?: string
}

export default function MapSymbol({
  size = 24,
  color = "#000",
}: Props) {
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
      <Path d="M3 7l6 -3l6 3l6 -3v13l-6 3l-6 -3l-6 3v-13" />
      <Path d="M9 4v13" />
      <Path d="M15 7v13" />
    </Svg>
  )
}
