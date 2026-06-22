import type { ReactNode } from 'react';
import { StyleSheet, Text, type GestureResponderEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { brandTeal, Spacing } from '@/constants/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  icon?: ReactNode;
};

export function PrimaryButton({ label, onPress, disabled = false, icon }: PrimaryButtonProps) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: disabled ? 0.45 : pressed.value ? 0.82 : 1,
    transform: [{ scale: pressed.value ? 0.98 : 1 }],
  }));

  return (
    <Animated.Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withSpring(1, { damping: 18, stiffness: 280 });
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, { damping: 18, stiffness: 280 });
      }}
      style={[styles.button, animatedStyle]}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </Animated.Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: brandTeal,
    borderRadius: Spacing.three,
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  label: {
    color: '#07120E',
    fontSize: 16,
    fontWeight: '700',
  },
});
