import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      {/* Keeps the phone's status bar icons (battery, wifi) visible and dark */}
      <StatusBar style="dark" />

      {/* Manages the stack of screens in your app */}
      <Stack>
        {/* Hides the default top navbar specifically for your splash/index screen */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
