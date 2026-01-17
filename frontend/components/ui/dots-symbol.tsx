import React from "react"
import { Svg, Path } from "react-native-svg"

export default function DotsVertical({ size = 24, color = "currentColor" }) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
        >
            <Path d="M0 0h24v24H0z" fill="none" />
            <Path
                d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M11 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M11 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    )
}
