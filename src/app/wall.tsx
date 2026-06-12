import { Canvas, Circle, Rect } from "@shopify/react-native-skia";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";

import { Joystick } from "@/components/Joystick";
import { View } from "react-native";
import {
  ENEMY_RADIUS,
  MAX_ENEMIES,
  PLAY_HEIGHT,
  PLAY_WIDTH,
  RADIUS,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  WALL_THICKNESS,
} from "../constants";
import { animate, animateEnemies } from "../logic";
import { CircleInterface } from "../types";
import { calcDistance, enemyVel } from "@/utils/utils";
import { useEffect, useState } from "react";
import { runOnJS } from "react-native-worklets";

let SPEED_FACTOR = 8; // Increasing will decrease the player's speed

export default function Wall() {
  const playerX = useSharedValue(PLAY_WIDTH / 2);
  const playerY = useSharedValue(PLAY_HEIGHT / 2);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);

  const cameraX = useSharedValue(-(PLAY_WIDTH / 2) + SCREEN_WIDTH / 2);
  const cameraY = useSharedValue(-(PLAY_HEIGHT / 2) + SCREEN_HEIGHT / 2);

  const enemyXs = useSharedValue<number[]>([]);
  const enemyYs = useSharedValue<number[]>([]);

  //collision

  //used for testing
  const userColor = useSharedValue("cyan");
  const animatedUserColor = useDerivedValue(() => userColor.value);

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

  // Spawns enemies at the beginning

  useEffect(() => {
    spawnEnemies(50);
  }, []);

  function spawnEnemies(count: number) {
    const xs: number[] = [];
    const ys: number[] = [];

    for (let i = 0; i < count; i++) {
      const edge = Math.floor(Math.random() * 4); // 0=top, 1=bottom, 2=left, 3=right

      switch (edge) {
        case 0: // top
          xs.push(Math.random() * PLAY_WIDTH);
          ys.push(WALL_THICKNESS + ENEMY_RADIUS);
          break;
        case 1: // bottom
          xs.push(Math.random() * PLAY_WIDTH);
          ys.push(PLAY_HEIGHT - WALL_THICKNESS - ENEMY_RADIUS);
          break;
        case 2: // left
          xs.push(WALL_THICKNESS + ENEMY_RADIUS);
          ys.push(Math.random() * PLAY_HEIGHT);
          break;
        case 3: // right
          xs.push(PLAY_WIDTH - WALL_THICKNESS - ENEMY_RADIUS);
          ys.push(Math.random() * PLAY_HEIGHT);
          break;
      }
    }

    enemyXs.value = xs;
    enemyYs.value = ys;
  }

  const enemyPositions = Array.from({ length: MAX_ENEMIES }, (_, i) =>
    useDerivedValue(() => ({
      x: enemyXs.value[i] ?? -9999, // off-screen if not spawned
      y: enemyYs.value[i] ?? -9999,
    })),
  );

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
  }

  //Pass the player into your existing animate call.
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

    // Old code:

    // enemyX.value += enemyVel(playerX, playerY, enemyX, enemyY).vx;
    // enemyY.value += enemyVel(playerX, playerY, enemyX, enemyY).vy;

    // New code:
    animateEnemies(enemyXs, enemyYs, playerX, playerY);

    cameraX.value = Math.min(
      0,
      Math.max(-(PLAY_WIDTH - SCREEN_WIDTH), cameraX.value),
    );
    cameraY.value = Math.min(
      0,
      Math.max(-(PLAY_HEIGHT - SCREEN_HEIGHT), cameraY.value),
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
            color={animatedUserColor}
          />
          {enemyPositions.map((pos, i) => (
            <Circle
              key={i}
              cx={useDerivedValue(() => pos.value.x)}
              cy={useDerivedValue(() => pos.value.y)}
              r={ENEMY_RADIUS}
              color="red"
            />
          ))}
        </Canvas>
      </Animated.View>
      {/* </GestureDetector> */}
    </View>
  );
}
