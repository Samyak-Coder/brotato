import React from "react";
import { useWindowDimensions, View } from "react-native";
import { Canvas, Circle, Group, Rect,  } from "@shopify/react-native-skia";
import Animated from "react-native-reanimated";
import * as ScreenOrientation from "expo-screen-orientation";

const WALL_THICKNESS = 40

export default function Brotata(){
  const {width, height} = useWindowDimensions();
  const _playWidth = width*1.5
  const _playHeight = height*1.5
  const r = width * 0.33;
  return (
    <View>
      <Canvas style={{ width, height }}>
        <Rect 
          x={0}
          y={0}
          width={_playWidth}
          height={_playHeight}
          color={'#786658'}
        />

        {/* walls */}
        {/* Top wall */}
        <Rect
          x={0}
          y={0}
          width={_playWidth}
          height={WALL_THICKNESS}
          color="#3a2e28"
        />

        {/* Bottom wall */}
        <Rect
          x={0}
          y={_playHeight - WALL_THICKNESS}
          width={_playWidth}
          height={WALL_THICKNESS}
          color="#3a2e28"
        />

        {/* Left wall */}
        <Rect
          x={0}
          y={0}
          width={WALL_THICKNESS}
          height={_playHeight}
          color="#3a2e28"
        />

        {/* Right wall */}
        <Rect
          x={_playWidth - WALL_THICKNESS}
          y={0}
          width={WALL_THICKNESS}
          height={_playHeight}
          color="#3a2e28"
        />

      </Canvas>
    </View>
  );
};
