import React from "react"
import Svg, { Path } from "react-native-svg"

interface SettingsIconProps {
  size?: number
  color?: string
}

export default function SettingsIcon({
  size = 18,
  color = "#000",
}: SettingsIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path d="M0 0h24v24H0z" fill="none" />

      <Path
        d="M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284
           c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27
           a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27
           a2.225 2.225 0 0 1 -1.158 -1.948v-7.285
           c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98
           a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Path
        d="M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
