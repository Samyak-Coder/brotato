import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

//long is width, shorter is height, since useEffect for orientation can mount before or after this file.
export const SCREEN_WIDTH = Math.max(width, height); 
export const SCREEN_HEIGHT = Math.min(width, height);

export const WALL_THICKNESS = 30;
export const PLAY_WIDTH = SCREEN_WIDTH * 1.5;
export const PLAY_HEIGHT = SCREEN_HEIGHT * 1.3;
export const RADIUS = 20;
export const _spacingForWallsW = PLAY_WIDTH - SCREEN_WIDTH;
export const _spacingForWalls = PLAY_HEIGHT - SCREEN_HEIGHT;
export const ENEMY_SPEED = 2;
export const ENEMY_RADIUS = 15;

export const MAX_BULLETS = 20;
export const BULLET_SPEED = 5;
export const BULLET_RADIUS = 8;

export const SHOT_INTERVAL = 800
export const ACTIVATION_R = SCREEN_WIDTH/2