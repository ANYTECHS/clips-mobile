import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useCallback } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { OfflineBanner } from '@/components/offline-banner';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { ClipSelectionState } from '@/stores/clips-store';

// Placeholder API function — replace with your real API client call.
async function syncClipSelection(_clipId: string, _state: ClipSelectionState) {
  // e.g. await api.patch(`/clips/${_clipId}`, { selected: _state === 'selected' });
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const apiFn = useCallback(syncClipSelection, []);
  const isOnline = useNetworkStatus(apiFn);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
      <OfflineBanner isOnline={isOnline} />
    </ThemeProvider>
  );
}
