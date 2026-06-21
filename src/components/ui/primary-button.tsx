import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Spacing, brandTeal } from '@/constants/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  icon?: ReactNode;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PrimaryButton({ label, onPress, disabled = false, icon }: PrimaryButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(disabled ? 0.45 : 1);

  useEffect(() => {
    opacity.value = withTiming(disabled ? 0.45 : 1, { duration: 140 });
  }, [disabled, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    if (disabled) return;
    scale.value = withTiming(0.98, { duration: 120 });
    opacity.value = withTiming(0.9, { duration: 120 });
  }

  function handlePressOut() {
    scale.value = withTiming(1, { duration: 140 });
    opacity.value = withTiming(disabled ? 0.45 : 1, { duration: 140 });
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.button, animatedStyle]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <ThemedText type="smallBold" style={styles.label}>
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: Spacing.three,
    backgroundColor: brandTeal,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#000',
    textAlign: 'center',
  },
});

export default PrimaryButton;
