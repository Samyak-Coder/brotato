import { Canvas, Circle, Group, Rect,  } from "@shopify/react-native-skia";
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue } from "react-native-reanimated";

import { CircleInterface } from "../types";
import {  _spacingForWalls, _spacingForWallsW, PLAY_HEIGHT, PLAY_WIDTH, RAIDUS, SCREEN_HEIGHT, SCREEN_WIDTH, WALL_THICKNESS } from "../constants";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { animate } from "../logic";

export default function Wall(){

    
const playerX = useSharedValue(PLAY_WIDTH / 2);
const playerY = useSharedValue(PLAY_HEIGHT / 2);
const startX = useSharedValue(PLAY_WIDTH / 2);
const startY = useSharedValue(PLAY_HEIGHT / 2);

const cameraX = useSharedValue(-(PLAY_WIDTH / 2) + SCREEN_WIDTH / 2);
const cameraY = useSharedValue(-(PLAY_HEIGHT / 2) + SCREEN_HEIGHT / 2);

const DEADZONE = SCREEN_WIDTH * 0.1;

const CircleObject: CircleInterface = {
  x: playerX,
  y: playerY,
  r: RAIDUS,
  vx: 0,
  vy: 0,
  ax: 0,
  ay: 0,
  type: "Circle",
  id: 0,
};

// got this from cladue, you can change it as you would like to
const gesture = Gesture.Pan()
  .onBegin(() => {
    startX.value = playerX.value;
    startY.value = playerY.value;
  })
  .onUpdate((e) => {
    playerX.value = startX.value + e.translationX;
    playerY.value = startY.value + e.translationY;
    // ✅ No clamping here — your useFrameCallback already calls
    //    resolveWallCollision every frame, so it's handled there
  });

// 5. Pass the player into your existing animate call. Claude the goat
useFrameCallback((frameInfo) => {
  if (!frameInfo.timeSincePreviousFrame) return;

  animate([CircleObject], frameInfo.timeSincePreviousFrame, 0);

  const playerScreenX = CircleObject.x.value + cameraX.value;
  const playerScreenY = CircleObject.y.value + cameraY.value;

  if (playerScreenX < DEADZONE)
    cameraX.value = cameraX.value + (DEADZONE - playerScreenX);
  else if (playerScreenX > SCREEN_WIDTH - DEADZONE)
    cameraX.value = cameraX.value - (playerScreenX - (SCREEN_WIDTH - DEADZONE));

  if (playerScreenY < DEADZONE)
    cameraY.value = cameraY.value + (DEADZONE - playerScreenY);
  else if (playerScreenY > SCREEN_HEIGHT - DEADZONE)
    cameraY.value = cameraY.value - (playerScreenY - (SCREEN_HEIGHT - DEADZONE));

  // Clamp: camera can't show beyond world edges
  cameraX.value = Math.min(0, Math.max(-(PLAY_WIDTH - SCREEN_WIDTH), cameraX.value));
  cameraY.value = Math.min(0, Math.max(-(PLAY_HEIGHT - SCREEN_HEIGHT), cameraY.value));
});

//Anim styles for camera (View)
const cameraStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: cameraX.value },
    { translateY: cameraY.value },
  ],
}));

  return (
  <GestureDetector gesture={gesture}>
    <Animated.View style={cameraStyle}>
        
      <Canvas style={{ width: PLAY_WIDTH, height: PLAY_HEIGHT }}>
        <Rect
          x={0}
          y={0}
          width={PLAY_WIDTH}
          height={PLAY_HEIGHT}
          color="#786658"
        />

        {/* Top wall */}
        <Rect x={0} y={0} width={PLAY_WIDTH} height={WALL_THICKNESS} color="#3a2e28" />     

        {/* Bottom wall */}
        <Rect x={0} y={PLAY_HEIGHT - WALL_THICKNESS} width={PLAY_WIDTH} height={WALL_THICKNESS} color="#3a2e28" />      

        {/* Left wall */}
        <Rect x={0} y={0} width={WALL_THICKNESS} height={PLAY_HEIGHT} color="#3a2e28" />        

        {/* Right wall */}
        <Rect x={PLAY_WIDTH - WALL_THICKNESS} y={0} width={WALL_THICKNESS} height={PLAY_HEIGHT} color="#3a2e28" />

        {/* User sprite */}
        <Circle 
            cx = {CircleObject.x}
            cy={CircleObject.y}
            r={RAIDUS}
            color={"cyan"}
        />
      </Canvas>
     
    </Animated.View> 
</GestureDetector>
  );
};
