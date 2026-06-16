import { DarkTheme, DefaultTheme, Redirect, Slot, ThemeProvider } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { token } from '@/lib/token';
import { useAuthStore } from '@/store/auth';

// Handle magic-link deep link: clipcash://auth/callback?token=...&refresh=...
async function handleDeepLink(url: string) {
  const parsed = Linking.parse(url);
  const accessToken = parsed.queryParams?.token as string | undefined;
  const refreshToken = parsed.queryParams?.refresh as string | undefined;
  if (!accessToken) return;

  await token.saveAccess(accessToken);
  if (refreshToken) await token.saveRefresh(refreshToken);
  useAuthStore.getState().setTokens(accessToken, refreshToken ?? '');
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { status, setTokens, setStatus } = useAuthStore();

  // Bootstrap: restore tokens from SecureStore on app start
  useEffect(() => {
    token.getAccess().then((access) => {
      if (access) {
        token.getRefresh().then((refresh) => {
          setTokens(access, refresh ?? '');
        });
      } else {
        setStatus('unauthenticated');
      }
    });
  }, []);

  // Handle deep links while app is open
  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    // Handle cold-start deep link
    Linking.getInitialURL().then((url) => { if (url) handleDeepLink(url); });
    return () => sub.remove();
  }, []);

  // Routing guard: wait for auth check, then redirect accordingly
  if (status === 'loading') return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {status === 'unauthenticated' ? (
        <Redirect href="/(auth)/sign-in" />
      ) : (
        <Slot />
      )}
    </ThemeProvider>
  );
}
