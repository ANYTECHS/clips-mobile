import { Slot } from 'expo-router';

// Route group layout — just renders the matched screen.
// The NativeTabs navigator in src/app/_layout.tsx handles tab switching;
// this file exists only so Expo Router can resolve screens in the (tabs) group.
export default function TabGroupLayout() {
  return <Slot />;
}
