import { Canvas, Circle, dist, Rect } from "@shopify/react-native-skia";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";

import { Joystick } from "@/components/Joystick";
import { calcDistance, enemyCollision, enemyVel, handleBullet } from "@/utils/utils";
import { Text, View } from "react-native";
import {
  ACTIVATION_R,
  BULLET_RADIUS,
  BULLET_SPEED,
  ENEMY_RADIUS,
  MAX_BULLETS,
  MAX_ENEMIES,
  OUT_OF_THE_BOX,
  PLAY_HEIGHT,
  PLAY_WIDTH,
  RADIUS,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SHOT_INTERVAL,
  WALL_THICKNESS
} from "../constants";
import { animate, animateEnemies } from "../logic";
import { CircleInterface, BulletInterface } from "../types";
import { useEffect, useState } from "react";
import { runOnJS } from "react-native-worklets";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { router } from "expo-router";
import gameOver from "./gameOver";

let SPEED_FACTOR = 8; // Increasing will decrease the player's speed

export default function Wall() {
  const playerX = useSharedValue(PLAY_WIDTH / 2);
  const playerY = useSharedValue(PLAY_HEIGHT / 2);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);
  const XP = useSharedValue(3)

  const cameraX = useSharedValue(-(PLAY_WIDTH / 2) + SCREEN_WIDTH / 2);
  const cameraY = useSharedValue(-(PLAY_HEIGHT / 2) + SCREEN_HEIGHT / 2);

  const enemyXs = useSharedValue<number[]>([]);
  const enemyYs = useSharedValue<number[]>([]);

  //collision
  const lastHit = useSharedValue(0)
  //used for testing
  const userColor = useSharedValue("cyan");
  const animatedUserColor = useDerivedValue(() => userColor.value);

  // const enemyX = useSharedValue(0); these are the niggas who have seen time
  // const enemyY = useSharedValue(0);

  const lastShot = useSharedValue(0)
  const DEADZONE = SCREEN_WIDTH * 0.1;
  
  //joystick detectionn ----------
  // const startX = useSharedValue(0);
  // const startY = useSharedValue(0);
  const [stickVisible, setStickVisible] = useState<boolean>(true)
  // const gesture = Gesture.Tap()
  //   .onBegin((event)=>{
  //     startX.value = event.absoluteX;
  //     startY.value = event.absoluteY;
  //     runOnJS(setStickVisible)(true)
  //   })
  //   .onEnd(()=>{runOnJS(setStickVisible)(false)})
    //-53-20
    // const joystickStyle = useAnimatedStyle(()=>({
    //   position: 'absolute',
    //   top: startY.value - 73,
    //   left: startX.value - 73,
    //   zIndex: 1000
    // }))



  const CircleObject: CircleInterface = {
    x: playerX,
    y: playerY,
    r: RADIUS,
    vx: 0,
    vy: 0,
    type: "Circle",
    id: 0,
  };

  // Spawns enemies at the beginning

  useEffect(() => {
    spawnEnemies(10);
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
      x: enemyXs.value[i] ?? OUT_OF_THE_BOX, // off-screen if not spawned
      y: enemyYs.value[i] ?? OUT_OF_THE_BOX,
    })),
  );
  //used Array.from to create new arrays (total of max_bullets) with the defaults
  const bulletPool: BulletInterface[] = Array.from({ length: MAX_BULLETS }, (_, i) => ({
  x: useSharedValue(OUT_OF_THE_BOX),
  y: useSharedValue(OUT_OF_THE_BOX),
  vx: useSharedValue(0),
  vy: useSharedValue(0),
  active: useSharedValue(false),
  id: i,
}));

const hitCount = useSharedValue(0); 
const hitCountText = useDerivedValue(()=>hitCount.value)

  // const shoot = (distToEnemy: number, dx: number, dy: number) =>{
  //   "worklet"
  //   const bullet = bulletPool.find((e)=> !e.active.value)
  //   if (bullet) {
  //     const dist = distToEnemy || 1; // avoid div by zero
  //     bullet.x.value = playerX.value;
  //     bullet.y.value = playerY.value;
  //     bullet.vx.value = (dx / dist) * BULLET_SPEED;
  //     bullet.vy.value = (dy / dist) * BULLET_SPEED;
  //     bullet.active.value = true;
  //   }
  // }

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

  const goToGameOver = ()=>{
    router.push('/gameOver')
  }
  // const onGameOVer = () =>{
  //     router.push({pathname: '/gameOver', params:{lost: 'true'}})
  //   }
  

  // 5. Pass the player into your existing animate call. Claude the goat
  useFrameCallback((frameInfo) => {
    if (!frameInfo.timeSincePreviousFrame) return;

    animate([CircleObject], frameInfo.timeSincePreviousFrame, 0);

    const playerScreenX = CircleObject.x.value + cameraX.value;
    const playerScreenY = CircleObject.y.value + cameraY.value;

    playerX.value += velocityX.value;
    playerY.value += velocityY.value;

    // autoshoot ----------
    
    const xs = enemyXs.value
    const ys = enemyYs.value

    let closestDist = Infinity 
    let closestDx = 0;
    let closestDy = 0;

    for(let i=0; i<xs.length; i++){
      const dx = xs[i] - playerX.value;
      const dy = ys[i] - playerY.value;
      const distToEnemy = Math.sqrt(dx * dx + dy * dy);
      if(distToEnemy < closestDist){
        closestDist = distToEnemy;
        closestDx = dx;
        closestDy = dy
      }
    }

    lastShot.value += frameInfo.timeSincePreviousFrame

    if (closestDist < ACTIVATION_R && lastShot.value > SHOT_INTERVAL) {
      lastShot.value = 0;

      const bullet = bulletPool.find((b) => !b.active.value);
      if (bullet) {
        const dist = closestDist || 1; // avoid div by zero
        bullet.x.value = playerX.value;
        bullet.y.value = playerY.value;
        bullet.vx.value = (closestDx / dist) * BULLET_SPEED;
        bullet.vy.value = (closestDy / dist) * BULLET_SPEED;
        bullet.active.value = true;
      }
    }

    handleBullet(bulletPool, enemyXs, enemyYs, hitCount)

    enemyCollision(enemyXs, enemyYs, playerX, playerY, XP, bulletPool, lastHit, frameInfo.timeSincePreviousFrame)

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

    if(enemyXs.value.length === 0 && XP.value >0){
      runOnJS(goToGameOver)()
    }

    cameraX.value = Math.min(
      0,
      Math.max(-(PLAY_WIDTH - SCREEN_WIDTH), cameraX.value),
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
      
        {stickVisible && (

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

        )}          

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
      // </GestureDetector>
    
  );
}