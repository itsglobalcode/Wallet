import React from "react"
import { Svg, Path } from "react-native-svg"

export default function ArrowNarrowLeft({ size = 24, color = "currentColor" }) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
        >
            <Path d="M0 0h24v24H0z" fill="none" />
            <Path
                d="M5 12l14 0"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M5 12l4 4"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M5 12l4 -4"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    )
}
