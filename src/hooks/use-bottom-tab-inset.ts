import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset } from '@/constants/theme';

export function useBottomTabInset() {
  const insets = useSafeAreaInsets();

  if (Platform.OS === 'android') {
    return BottomTabInset + insets.bottom;
  }

  return BottomTabInset;
}
