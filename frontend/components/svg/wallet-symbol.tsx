import React from "react"
import Svg, { Path } from "react-native-svg"

type Props = {
  size?: number
  color?: string
}

export default function WalletSymbol({
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
      <Path d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12" />
      <Path d="M20 12v4h-4a2 2 0 0 1 0 -4h4" />
    </Svg>
  )
}
