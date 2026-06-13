import { Canvas, Circle, Rect } from "@shopify/react-native-skia";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";

import { Joystick } from "@/components/Joystick";
import { Text, View } from "react-native";
import {
  ACTIVATION_R,
  BULLET_RADIUS,
  BULLET_SPEED,
  ENEMY_RADIUS,
  MAX_BULLETS,
  MAX_ENEMIES,
  PLAY_HEIGHT,
  PLAY_WIDTH,
  RADIUS,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SHOT_INTERVAL,
  WALL_THICKNESS,
} from "../constants";
import { animate, animateEnemies } from "../logic";
import { BulletInterface, CircleInterface } from "../types";
import { handleBullet } from "@/utils/utils";
import { useEffect } from "react";

let SPEED_FACTOR = 8;

export default function Wall() {
  const playerX = useSharedValue(PLAY_WIDTH / 2);
  const playerY = useSharedValue(PLAY_HEIGHT / 2);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);

  const cameraX = useSharedValue(-(PLAY_WIDTH / 2) + SCREEN_WIDTH / 2);
  const cameraY = useSharedValue(-(PLAY_HEIGHT / 2) + SCREEN_HEIGHT / 2);

  const enemyXs = useSharedValue<number[]>([]);
  const enemyYs = useSharedValue<number[]>([]);

  const lastShot = useSharedValue(0);
  const hitCount = useSharedValue(0);
  const hitCountText = useDerivedValue(() => String(hitCount.value));

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

  // ----- Bullet pool -----
  // Rules for hooks in loops: hooks must be called unconditionally at the top
  // level, so we create a fixed-size pool here (MAX_BULLETS entries) using
  // individual useSharedValue calls — no dynamic allocation inside the render.
  const bulletPool: BulletInterface[] = Array.from(
    { length: MAX_BULLETS },
    (_, i) => ({
      x: useSharedValue(-1000),
      y: useSharedValue(-1000),
      vx: useSharedValue(0),
      vy: useSharedValue(0),
      active: useSharedValue(false),
      id: i,
    }),
  );

  // ----- Enemy positions for rendering -----
  // Fixed-size derived values, one per MAX_ENEMIES slot.
  // Off-screen (-9999) when that slot has no enemy.
  // NOTE: hooks must NOT be called inside .map() — we use Array.from with a
  // fixed length so the number of hook calls is always MAX_ENEMIES, stable
  // across renders.
  const enemyPositions = Array.from({ length: MAX_ENEMIES }, (_, i) =>
    useDerivedValue(() => ({
      x: enemyXs.value[i] ?? -9999,
      y: enemyYs.value[i] ?? -9999,
    })),
  );

  // ----- Spawn -----
  useEffect(() => {
    spawnEnemies(40);
  }, []);

  function spawnEnemies(count: number) {
    const xs: number[] = [];
    const ys: number[] = [];

    for (let i = 0; i < count; i++) {
      const edge = Math.floor(Math.random() * 4);
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

  function handlePlayerMove(data: any) {
    const dx = data.position.x - 53;
    const dy = data.position.y - 44;
    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
      velocityX.value = 0;
      velocityY.value = 0;
    } else {
      velocityX.value = dx / SPEED_FACTOR;
      velocityY.value = -dy / SPEED_FACTOR;
    }
  }

  useFrameCallback((frameInfo) => {
    if (!frameInfo.timeSincePreviousFrame) return;

    // 1. Wall collision + player movement
    animate([CircleObject], frameInfo.timeSincePreviousFrame, 0);
    playerX.value += velocityX.value;
    playerY.value += velocityY.value;

    // 2. Camera tracking
    const playerScreenX = CircleObject.x.value + cameraX.value;
    const playerScreenY = CircleObject.y.value + cameraY.value;

    if (playerScreenX < DEADZONE) cameraX.value += DEADZONE - playerScreenX;
    else if (playerScreenX > SCREEN_WIDTH - DEADZONE)
      cameraX.value -= playerScreenX - (SCREEN_WIDTH - DEADZONE);

    if (playerScreenY < DEADZONE) cameraY.value += DEADZONE - playerScreenY;
    else if (playerScreenY > SCREEN_HEIGHT - DEADZONE)
      cameraY.value -= playerScreenY - (SCREEN_HEIGHT - DEADZONE);

    cameraX.value = Math.min(
      0,
      Math.max(-(PLAY_WIDTH - SCREEN_WIDTH), cameraX.value),
    );
    cameraY.value = Math.min(
      0,
      Math.max(-(PLAY_HEIGHT - SCREEN_HEIGHT), cameraY.value),
    );

    // 3. Enemy movement (flocking + chase)
    animateEnemies(enemyXs, enemyYs, playerX, playerY);

    // 4. Auto-aim: shoot at the nearest enemy within ACTIVATION_R
    lastShot.value += frameInfo.timeSincePreviousFrame;

    if (lastShot.value > SHOT_INTERVAL && enemyXs.value.length > 0) {
      // Find nearest enemy
      let nearestDist = Infinity;
      let nearestDx = 0;
      let nearestDy = 0;

      for (let i = 0; i < enemyXs.value.length; i++) {
        const dx = enemyXs.value[i] - playerX.value;
        const dy = enemyYs.value[i] - playerY.value;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < nearestDist) {
          nearestDist = d;
          nearestDx = dx;
          nearestDy = dy;
        }
      }

      if (nearestDist < ACTIVATION_R) {
        const bullet = bulletPool.find((b) => !b.active.value);
        if (bullet) {
          const d = nearestDist || 1;
          bullet.x.value = playerX.value;
          bullet.y.value = playerY.value;
          bullet.vx.value = (nearestDx / d) * BULLET_SPEED;
          bullet.vy.value = (nearestDy / d) * BULLET_SPEED;
          bullet.active.value = true;
          lastShot.value = 0;
        }
      }
    }

    // 5. Move bullets + check hits against enemy array
    handleBullet(bulletPool, enemyXs, enemyYs, hitCount);
  });

  const cameraStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cameraX.value }, { translateY: cameraY.value }],
  }));

  return (
    <View>
      {/* Joystick */}
      <View
        style={{ position: "absolute", bottom: 180, right: 50, zIndex: 1000 }}
      >
        <Joystick
          onMove={(data) => handlePlayerMove(data)}
          onStop={() => {
            velocityX.value = 0;
            velocityY.value = 0;
          }}
        />
      </View>

      {/* Hit counter */}
      <View style={{ position: "absolute", top: 20, left: 20, zIndex: 1000 }}>
        <Text
          style={{ color: "white", fontSize: 18 }}
        >{`Kills: ${hitCountText}`}</Text>
      </View>

      <Animated.View style={cameraStyle}>
        <Canvas style={{ width: PLAY_WIDTH, height: PLAY_HEIGHT }}>
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={PLAY_WIDTH}
            height={PLAY_HEIGHT}
            color="#786658"
          />

          {/* Walls */}
          <Rect
            x={0}
            y={0}
            width={PLAY_WIDTH}
            height={WALL_THICKNESS}
            color="#3a2e28"
          />
          <Rect
            x={0}
            y={PLAY_HEIGHT - WALL_THICKNESS}
            width={PLAY_WIDTH}
            height={WALL_THICKNESS}
            color="#3a2e28"
          />
          <Rect
            x={0}
            y={0}
            width={WALL_THICKNESS}
            height={PLAY_HEIGHT}
            color="#3a2e28"
          />
          <Rect
            x={PLAY_WIDTH - WALL_THICKNESS}
            y={0}
            width={WALL_THICKNESS}
            height={PLAY_HEIGHT}
            color="#3a2e28"
          />

          {/* Player */}
          <Circle
            cx={CircleObject.x}
            cy={CircleObject.y}
            r={RADIUS}
            color={animatedUserColor}
          />

          {/* Enemies — read from fixed-size derived value slots */}
          {enemyPositions.map((pos, i) => (
            <Circle
              key={i}
              cx={useDerivedValue(() => pos.value.x)}
              cy={useDerivedValue(() => pos.value.y)}
              r={ENEMY_RADIUS}
              color="red"
            />
          ))}

          {/* Bullets */}
          {bulletPool.map((b) => (
            <Circle
              key={b.id}
              cx={b.x}
              cy={b.y}
              r={BULLET_RADIUS}
              color="yellow"
            />
          ))}
        </Canvas>
      </Animated.View>
    </View>
  );
}
