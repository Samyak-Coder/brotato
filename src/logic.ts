<<<<<<< HEAD
import { SharedValue } from "react-native-reanimated";
import {
  _spacingForWalls,
  _spacingForWallsW,
  PLAY_HEIGHT,
  PLAY_WIDTH,
  WALL_THICKNESS,
  ENEMY_SPEED,
  ENEMY_RADIUS,
} from "./constants";
import { CircleInterface, ShapeInterface } from "./types";

export const resolveWallCollision = (o: ShapeInterface) => {
  "worklet";
=======
import { _spacingForWalls, _spacingForWallsW, PLAY_HEIGHT, PLAY_WIDTH, WALL_THICKNESS } from "./constants";
import { CircleInterface, ShapeInterface } from "./types";


export const resolveWallCollision = (o: ShapeInterface) => {
  "worklet"
>>>>>>> origin/main
  const circle = o as CircleInterface;
  const r = circle.r;

  // Left wall
<<<<<<< HEAD
  if (circle.x.value - r < WALL_THICKNESS) circle.x.value = WALL_THICKNESS + r;
=======
  if (circle.x.value - r < WALL_THICKNESS)
    circle.x.value = WALL_THICKNESS + r;
>>>>>>> origin/main

  // Right wall
  if (circle.x.value + r > PLAY_WIDTH - WALL_THICKNESS)
    circle.x.value = PLAY_WIDTH - WALL_THICKNESS - r;

  // Top wall
<<<<<<< HEAD
  if (circle.y.value - r < WALL_THICKNESS) circle.y.value = WALL_THICKNESS + r;
=======
  if (circle.y.value - r < WALL_THICKNESS)
    circle.y.value = WALL_THICKNESS + r;
>>>>>>> origin/main

  // Bottom wall
  if (circle.y.value + r > PLAY_HEIGHT - WALL_THICKNESS)
    circle.y.value = PLAY_HEIGHT - WALL_THICKNESS - r;
};

<<<<<<< HEAD
// In logic.ts
export const animateEnemies = (
  enemyXs: SharedValue<number[]>,
  enemyYs: SharedValue<number[]>,
  playerX: SharedValue<number>,
  playerY: SharedValue<number>,
) => {
  "worklet";
  const xs = enemyXs.value.slice();
  const ys = enemyYs.value.slice();
  const count = xs.length;
  const SEPARATION_RADIUS = ENEMY_RADIUS * 2.5;
  const SEPARATION_FORCE = 1.2;

  for (let i = 0; i < count; i++) {
    // --- Chase player ---
    const dx = playerX.value - xs[i];
    const dy = playerY.value - ys[i];
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    let moveX = (dx / dist) * ENEMY_SPEED;
    let moveY = (dy / dist) * ENEMY_SPEED;

    // --- Separation from other enemies ---
    for (let j = 0; j < count; j++) {
      if (i === j) continue;

      const ex = xs[i] - xs[j];
      const ey = ys[i] - ys[j];
      const eDist = Math.sqrt(ex * ex + ey * ey) || 1;

      if (eDist < SEPARATION_RADIUS) {
        // Push i away from j, stronger the closer they are
        const force =
          ((SEPARATION_RADIUS - eDist) / SEPARATION_RADIUS) * SEPARATION_FORCE;
        moveX += (ex / eDist) * force;
        moveY += (ey / eDist) * force;
      }
    }

    xs[i] += moveX;
    ys[i] += moveY;
  }

  enemyXs.value = xs;
  enemyYs.value = ys;
};

export const animate = (
  objects: ShapeInterface[],
  timeSincePreviousFrame: number,
  enemyCount: number,
) => {
  "worklet";
  //what
  for (const o of objects) {
    if (o.type === "Circle") {
      resolveWallCollision(o);
    }
  }
};
=======
export const animate = (
    objects: ShapeInterface[],
    timeSincePreviousFrame: number,
    enemyCount: number
)=>{
    "worklet"
//what
    for(const o of objects){
        if(o.type === "Circle"){
            resolveWallCollision(o);
        }
    }
}
>>>>>>> origin/main
