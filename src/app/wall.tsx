//touch wall
import { Canvas, Circle, dist, Rect } from "@shopify/react-native-skia";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";

import { Joystick } from "@/components/Joystick";
import { calcDistance, enemyVel, handleBullet } from "@/utils/utils";
import { Text, TouchableOpacity, View } from "react-native";
import {
  ACTIVATION_R,
  BULLET_RADIUS,
  BULLET_SPEED,
  ENEMY_RADIUS,
  MAX_BULLETS,
  PLAY_HEIGHT,
  PLAY_WIDTH,
  RADIUS,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SHOT_INTERVAL,
  WALL_THICKNESS
} from "../constants";
import { animate } from "../logic";
import { BulletInterface, CircleInterface } from "../types";

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

  const lastShot = useSharedValue(0)

  const userColor= useSharedValue("cyan")
  const animatedUserColor = useDerivedValue(()=>userColor.value)

  const DEADZONE = SCREEN_WIDTH * 0.1;
  

  const CircleObject: CircleInterface = {
    x: playerX,
    y: playerY,
    r: RADIUS,
    vx: 0,
    vy: 0,
    type: "Circle",
    id: 0,
  };

  //used Array.from to create new arrays (total of max_bullets) with the defaults
  const bulletPool: BulletInterface[] = Array.from({ length: MAX_BULLETS }, (_, i) => ({
  x: useSharedValue(-1000),
  y: useSharedValue(-1000),
  vx: useSharedValue(0),
  vy: useSharedValue(0),
  active: useSharedValue(false),
  id: i,
}));

const hitCount = useSharedValue(0); 
const hitCountText = useDerivedValue(()=>hitCount.value)

  const shoot = (distToEnemy: number, dx: number, dy: number) =>{
    "worklet"
    const bullet = bulletPool.find((e)=> !e.active.value)
    if (bullet) {
      const dist = distToEnemy || 1; // avoid div by zero
      bullet.x.value = playerX.value;
      bullet.y.value = playerY.value;
      bullet.vx.value = (dx / dist) * BULLET_SPEED;
      bullet.vy.value = (dy / dist) * BULLET_SPEED;
      bullet.active.value = true;
    }
  }

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


  useFrameCallback((frameInfo) => {
    if (!frameInfo.timeSincePreviousFrame) return;

    animate([CircleObject], frameInfo.timeSincePreviousFrame, 0);

    const playerScreenX = CircleObject.x.value + cameraX.value;
    const playerScreenY = CircleObject.y.value + cameraY.value;

    playerX.value += velocityX.value;
    playerY.value += velocityY.value;

    // autoshoot -----
    const dx = enemyX.value - playerX.value;
    const dy = enemyY.value - playerY.value;
    const distToEnemy = Math.sqrt(dx * dx + dy * dy);


    // const distToEnemy = calcDistance({x: playerX.value, y: playerY.value}, {x: enemyX.value, y: enemyY.value})
    lastShot.value += frameInfo.timeSincePreviousFrame

    if (distToEnemy < ACTIVATION_R && lastShot.value > SHOT_INTERVAL) {
    lastShot.value = 0;

    const bullet = bulletPool.find((b) => !b.active.value);
    if (bullet) {
      const dist = distToEnemy || 1; // avoid div by zero
      bullet.x.value = playerX.value;
      bullet.y.value = playerY.value;
      bullet.vx.value = (dx / dist) * BULLET_SPEED;
      bullet.vy.value = (dy / dist) * BULLET_SPEED;
      bullet.active.value = true;
    }
  }

    handleBullet(bulletPool, {x: enemyX.value, y: enemyY.value}, hitCount)

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

          {/* for testing bullets */}
          <View style={{ position: "absolute", top: 20, left: 20, zIndex: 1000 }}>
      <Text
      style={{ color: "white", fontSize: 18 }}
      >{`Hit count: ${hitCountText}`}</Text>
    </View>

    {/* Shoot button */}
    {/* <TouchableOpacity
      onPress={shoot}
      style={{
        position: "absolute",
        bottom: 180,
        left: 50,
        zIndex: 1000,
        backgroundColor: "red",
        padding: 20,
        borderRadius: 50,
      }}
    >
      <Text style={{ color: "white" }}>SHOOT</Text>
    </TouchableOpacity> */}

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
          <Circle 
            cx={enemyX}
            cy={enemyY}
            r={ENEMY_RADIUS}
            color={"red"}
          />

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
      {/* </GestureDetector> */}
    </View>
  );
}
