import { SharedValue } from "react-native-reanimated";

type SharedVariant = "Circle";

export interface ShapeInterface {
    x: SharedValue<number>;
    y: SharedValue<number>;
    ax: number;
    ay: number;
    vx: number;
    vy: number;
    type: SharedVariant;
    id: number
}

export interface CircleInterface extends ShapeInterface{
    type: "Circle";
    r: number
}