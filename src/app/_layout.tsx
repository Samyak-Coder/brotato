import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";

export default function TabLayout() {
  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
  }, []);

  return (
    <>

      <Stack screenOptions={{ headerShown: false }} >
        <Stack.Screen name={'index'} />
        <Stack.Screen name={'gameOver'} />
        <Stack.Screen name={'game'} />
      </Stack>

    </>
  );
}
