import { Canvas, Circle, Rect } from "@shopify/react-native-skia";
import Animated, {
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";

import { Joystick } from "@/components/Joystick";
import { View } from "react-native";
import {
  PLAY_HEIGHT,
  PLAY_WIDTH,
  RADIUS,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  WALL_THICKNESS
} from "../constants";
import { animate } from "../logic";
import { CircleInterface } from "../types";
import { enemyVel } from "@/utils/utils";

let SPEED_FACTOR = 8; // Increasing will decrease the player's speed

export default function Wall() {
  const playerX = useSharedValue(PLAY_WIDTH / 2);
  const playerY = useSharedValue(PLAY_HEIGHT / 2);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);

  const cameraX = useSharedValue(-(PLAY_WIDTH / 2) + SCREEN_WIDTH / 2);
  const cameraY = useSharedValue(-(PLAY_HEIGHT / 2) + SCREEN_HEIGHT / 2);

  const enemyX = useSharedValue(0);
  const enemyY = useSharedValue(0);

  const DEADZONE = SCREEN_WIDTH * 0.1;

  const CircleObject: CircleInterface = {
    x: playerX,
    y: playerY,
    r: RADIUS,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0,
    type: "Circle",
    id: 0,
  };

  function handlePlayerMove(data: any) {
    // console.log(data.position.x - 53, data.position.y - 44);
    // velocityX.value = (data.position.x - 53) / SPEED_FACTOR;
    // velocityY.value = (data.position.y - 44) / SPEED_FACTOR;

    const dx = data.position.x - 53;
    const dy = data.position.y - 44;

    // Apply a small deadzone to prevent "ghost" movement
    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
      velocityX.value = 0;
      velocityY.value = 0;
    } else {
      velocityX.value = dx / SPEED_FACTOR;
      velocityY.value = -dy / SPEED_FACTOR; // Invert Y if needed
    }
    // playerX.value = playerX.value + (data.position.x - 53) / SPEED_FACTOR;
    // playerY.value = playerY.value - (data.position.y - 44) / SPEED_FACTOR;
  }

  //Pass the player into your existing animate call. Claude the goat
  useFrameCallback((frameInfo) => {
    if (!frameInfo.timeSincePreviousFrame) return;

    animate([CircleObject], frameInfo.timeSincePreviousFrame, 0);

    const playerScreenX = CircleObject.x.value + cameraX.value;
    const playerScreenY = CircleObject.y.value + cameraY.value;

    playerX.value += velocityX.value;
    playerY.value += velocityY.value;

    

    if (playerScreenX < DEADZONE)
      cameraX.value = cameraX.value + (DEADZONE - playerScreenX);
    else if (playerScreenX > SCREEN_WIDTH - DEADZONE)
      cameraX.value =
        cameraX.value - (playerScreenX - (SCREEN_WIDTH - DEADZONE));

    if (playerScreenY < DEADZONE)
      cameraY.value = cameraY.value + (DEADZONE - playerScreenY);
    else if (playerScreenY > SCREEN_HEIGHT - DEADZONE)
      cameraY.value =
        cameraY.value - (playerScreenY - (SCREEN_HEIGHT - DEADZONE));

      
enemyX.value += enemyVel(playerX, playerY, enemyX, enemyY).vx
    enemyY.value += enemyVel(playerX, playerY, enemyX, enemyY).vy
    // Clamp: camera can't show beyond world edges
    cameraX.value = Math.min(0, Math.max(-(PLAY_WIDTH - SCREEN_WIDTH), cameraX.value),
    );
    cameraY.value = Math.min(0, Math.max(-(PLAY_HEIGHT - SCREEN_HEIGHT), cameraY.value),
    );
  });

  //Anim styles for camera (View)
  const cameraStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cameraX.value }, { translateY: cameraY.value }],
  }));

  return (
    // <GestureDetector gesture={gesture}>
    <View>
      <View
        style={{
          position: "absolute",
          bottom: 180,
          right: 50,
          zIndex: 1000,
        }}
      >
        <Joystick
          onMove={(data) => handlePlayerMove(data)}
          onStop={() => {
            // Explicitly kill the velocity when the user stops touching
            velocityX.value = 0;
            velocityY.value = 0;
          }}
        />
      </View>
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
          <Rect
            x={0}
            y={0}
            width={PLAY_WIDTH}
            height={WALL_THICKNESS}
            color="#3a2e28"
          />

          {/* Bottom wall */}
          <Rect
            x={0}
            y={PLAY_HEIGHT - WALL_THICKNESS}
            width={PLAY_WIDTH}
            height={WALL_THICKNESS}
            color="#3a2e28"
          />

          {/* Left wall */}
          <Rect
            x={0}
            y={0}
            width={WALL_THICKNESS}
            height={PLAY_HEIGHT}
            color="#3a2e28"
          />

          {/* Right wall */}
          <Rect
            x={PLAY_WIDTH - WALL_THICKNESS}
            y={0}
            width={WALL_THICKNESS}
            height={PLAY_HEIGHT}
            color="#3a2e28"
          />

          {/* User sprite */}
          <Circle
            cx={CircleObject.x}
            cy={CircleObject.y}
            r={RADIUS}
            color={"cyan"}
          />
          <Rect 
            x={enemyX}
            y={enemyY}
            width={10}
            height={10}
            color={"red"}
          />
        </Canvas>
      </Animated.View>
      {/* </GestureDetector> */}
    </View>
  );
}
