import React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function FriendsSymbol({
  width = 24,
  height = 24,
  color = "currentColor",
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
      <Path d="M5 5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <Path d="M5 22v-5l-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4l-1 1v5" />
      <Path d="M15 5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <Path d="M15 22v-4h-2l2-6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1l2 6h-2v4" />
    </Svg>
  );
}
