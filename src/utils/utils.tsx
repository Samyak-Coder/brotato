  import { SharedValue, useSharedValue } from "react-native-reanimated";
  import { BULLET_RADIUS, ENEMY_RADIUS, ENEMY_SPEED, OUT_OF_THE_BOX, PLAY_HEIGHT, PLAY_WIDTH, RADIUS, SCREEN_HEIGHT, SCREEN_WIDTH, WALL_THICKNESS } from "@/constants";
  import { BulletInterface } from "@/types";


  export const calcDistance = (
      p1: { x: number; y: number },
      p2: { x: number; y: number },
    ) => {
    "worklet"
      "worklet"
    const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;

    return Math.sqrt(dx * dx + dy * dy);
  };

// NOT USED ANYMORE:
export const enemyVel = (
  playerX: SharedValue<number>,
  playerY: SharedValue<number>,
  enemyX: SharedValue<number>,
  enemyY: SharedValue<number>,
) => {
  "worklet";
  const distance = calcDistance(
    { x: playerX.value, y: playerY.value },
    { x: enemyX.value, y: enemyY.value },
  );
  const vx = ((playerX.value - enemyX.value) / distance) * ENEMY_SPEED;
  const vy = ((playerY.value - enemyY.value) / distance) * ENEMY_SPEED;
  return { vx, vy };
};

export const calcAngle = (
  p1: { x: number; y: number },
  p2: { x: number; y: number },
) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const rawAngle = radiansToDegrees(Math.atan2(dy, dx));
  if (rawAngle < 0) return 180 - Math.abs(rawAngle);
  else return rawAngle + 180;
};

export const degreesToRadians = (a: number) => a * (Math.PI / 180);
export const radiansToDegrees = (a: number) => a * (180 / Math.PI);

export const findCoord = (
  position: { x: number; y: number },
  distance: number,
  angle: number,
) => {
  const b = { x: 0, y: 0 };
  angle = degreesToRadians(angle);
  b.x = position.x + distance * Math.cos(angle);
  b.y = position.y + distance * Math.sin(angle);
  if (b.y < 0) b.y += 150;
  return b;
};

//   export const isCollision = (
//   enemy: { x: number; y: number },
//   player: { x: number; y: number },
//   radius: number
// ) => {
//   "worklet"
//   let testX = enemy.x;  // plain variables, not shared values
//   let testY = enemy.y;

//   if (enemy.x < player.x - radius) testX = player.x - radius;
//   else if (enemy.x < player.x + radius) testX = player.x + radius;
//   if (enemy.y > player.y - radius) testY = player.y - radius;
//   else if (enemy.y > player.y + radius) testY = player.y + radius;

//   const dist = calcDistance({ x: enemy.x, y: enemy.y }, { x: testX, y: testY });
//   return dist <= radius;
// };

export const enemyCollision =(
  enemyXs: SharedValue<number[]>,
  enemyYs: SharedValue<number[]>,
  playerX: SharedValue<number>,
  playerY: SharedValue<number>,
  XP: SharedValue<number>,
  bulletPool: BulletInterface[],
  lastHit: SharedValue<number>,
  number: number,
)=>{
  "worklet"
  const xs = enemyXs.value
  const ys = enemyYs.value

  lastHit.value += number

  

  for (let i=0; i<xs.length; i++){
      const dist = calcDistance({x: xs[i], y: ys[i]}, {x:playerX.value, y: playerY.value});

      if (dist < RADIUS + ENEMY_RADIUS && lastHit.value>500) {
        lastHit.value = 0
        XP.value -= 1;
        console.log(XP.value)

        if(XP.value<=0){
          playerX.value = PLAY_WIDTH / 2
          playerY.value = PLAY_HEIGHT / 2
          
          bulletPool.forEach((b)=>{
            b.active.value = false;
            b.x.value = OUT_OF_THE_BOX
            b.y.value = OUT_OF_THE_BOX
          })

          enemyXs.value = []
          enemyYs.value = []

          XP.value = 3
          return true
          
        }
        
      }
      
    }

}

  export const handleBullet = (
  bulletPool: BulletInterface[],
  enemyXs: SharedValue<number[]>,
  enemyYs: SharedValue<number[]>,
  hitCount: SharedValue<number>
) => {
  "worklet"

  const xs = enemyXs.value;
  const ys = enemyYs.value;

  for (const b of bulletPool) {
    if (!b.active.value) continue;

    b.x.value += b.vx.value;
    b.y.value += b.vy.value;

    //touch wall?
    if (
      b.x.value < WALL_THICKNESS || b.x.value > PLAY_WIDTH - WALL_THICKNESS || b.y.value < WALL_THICKNESS || b.y.value > PLAY_HEIGHT - WALL_THICKNESS
    ) {
      b.active.value = false;
      b.x.value = OUT_OF_THE_BOX;
      b.y.value = OUT_OF_THE_BOX;
      continue;
    }

    for (let i=0; i<xs.length; i++){
      const dist = calcDistance({x: xs[i], y: ys[i]}, {x: b.x.value, y: b.y.value});

      if (dist < BULLET_RADIUS + ENEMY_RADIUS) {
        hitCount.value += 1;
        b.active.value = false;
        b.x.value = OUT_OF_THE_BOX;
        b.y.value = OUT_OF_THE_BOX;
        //removing
        const newXs = xs.slice();
        const newYs = ys.slice();
        newXs.splice(i,1)
        newYs.splice(i,1)
        enemyXs.value = newXs;
        enemyYs.value = newYs;
        break;
      }
      
    }
    
  }

};