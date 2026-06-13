import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";

export default function TabLayout() {
  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");gi
  }, []);

  return (
    <>
      <StatusBar hidden={true} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
