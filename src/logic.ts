import { _spacingForWalls, _spacingForWallsW, PLAY_HEIGHT, PLAY_WIDTH, WALL_THICKNESS } from "./constants";
import { CircleInterface, ShapeInterface } from "./types";


export const resolveWallCollision = (o: ShapeInterface) => {
  "worklet"
  const circle = o as CircleInterface;
  const r = circle.r;

  // Left wall
  if (circle.x.value - r < WALL_THICKNESS)
    circle.x.value = WALL_THICKNESS + r;

  // Right wall
  if (circle.x.value + r > PLAY_WIDTH - WALL_THICKNESS)
    circle.x.value = PLAY_WIDTH - WALL_THICKNESS - r;

  // Top wall
  if (circle.y.value - r < WALL_THICKNESS)
    circle.y.value = WALL_THICKNESS + r;

  // Bottom wall
  if (circle.y.value + r > PLAY_HEIGHT - WALL_THICKNESS)
    circle.y.value = PLAY_HEIGHT - WALL_THICKNESS - r;
};

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