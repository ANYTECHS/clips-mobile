import { DarkTheme, DefaultTheme, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { useAuthStore } from '@/store/auth-store';

function AuthGate() {
  const { isAuthenticated, isLoading, refreshToken } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // On mount, attempt to restore the token from secure storage.
  useEffect(() => {
    refreshToken();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const onAuthScreen = segments[0] === 'login';

    if (!isAuthenticated && !onAuthScreen) {
      router.replace('/login');
    } else if (isAuthenticated && onAuthScreen) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthGate />
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
