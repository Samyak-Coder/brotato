import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Wall from './wall';
import { useEffect } from 'react';
import * as ScreenOrientation from "expo-screen-orientation";

export default function HomeScreen() {
  useEffect(() => {
    const setOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };
  
    setOrientation();
  
    return () => {
      void ScreenOrientation.unlockAsync();
    };
  }, []);
  return (
    <GestureHandlerRootView>
      <Wall />
    </GestureHandlerRootView>
  );
}