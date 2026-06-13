import { SharedValue } from "react-native-reanimated";
import { ViewProps } from "react-native";

type SharedVariant = "Circle";

export interface ShapeInterface {
  x: SharedValue<number>;
  y: SharedValue<number>;
  ax: number;
  ay: number;
  vx: number;
  vy: number;
  type: SharedVariant;
  id: number;
}

export interface CircleInterface extends ShapeInterface {
  type: "Circle";
  r: number;
}

export interface IReactNativeJoystickEvent {
  type: "move" | "stop" | "start";
  position: {
    x: number;
    y: number;
  };
  force: number;
  angle: {
    radian: number;
    degree: number;
  };
}

export interface IReactNativeJoystickProps extends ViewProps {
  onStart?: (e: IReactNativeJoystickEvent) => void;
  onMove?: (e: IReactNativeJoystickEvent) => void;
  onStop?: (e: IReactNativeJoystickEvent) => void;
  radius?: number;
  color?: string;
}

export interface BulletInterface {
  x: SharedValue<number>;
  y: SharedValue<number>;
  vx: SharedValue<number>;
  vy: SharedValue<number>;
  active: SharedValue<boolean>;
  id: number;
}
