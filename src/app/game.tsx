import { GestureHandlerRootView } from "react-native-gesture-handler";
import Wall from "./wall";
import { useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { Joystick } from "@/components/Joystick";
import { View } from "react-native";

export default function HomeScreen() {
  
  return (
    <GestureHandlerRootView>
      <Wall />
    </GestureHandlerRootView>
  );
}
