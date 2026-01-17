import * as React from "react"
import Svg, { Path } from "react-native-svg"

export default function ArrowNarrowRightIcon(props: any) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <Path d="M5 12h14" />
      <Path d="M15 16l4-4" />
      <Path d="M15 8l4 4" />
    </Svg>
  )
}
