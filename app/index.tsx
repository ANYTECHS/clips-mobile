import { View, Text } from "react-native";

export default function SplashScreen() {
  return (
    // flex-1 handles full height, items-center and justify-center centers everything
    <View className="flex-1 items-center justify-center bg-slate-50">
      <Text className="text-2xl font-bold text-slate-800">
        Splash Screen Layout Ready!
      </Text>
    </View>
  );
}
