import React from "react"
import Svg, { Path } from "react-native-svg"

type Props = {
    width?: number
    height?: number
    color?: string
}

export default function SearchSymbol({ 
    width = 24, 
    height = 24, 
    color = "currentColor" 
}: Props) {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <Path d="M6 9l6 6l6 -6" />
        </Svg>
    )
}
