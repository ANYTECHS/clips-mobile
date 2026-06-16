import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { setupAndroidChannel } from '@/services/notifications';
import {
  registerClipStatusTask,
  unregisterClipStatusTask,
} from '@/tasks/clipStatusTask';
import { useJobStore } from '@/store/jobStore';

function useDeepLinkNotifications() {
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Handle notification tap while app is running
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { jobId } = response.notification.request.content.data as {
          jobId?: string;
        };
        if (jobId) {
          router.push(`/curation/${jobId}`);
        }
      });

    // Handle notification tap that cold-started the app
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const { jobId } = response.notification.request.content.data as {
        jobId?: string;
      };
      if (jobId) {
        router.push(`/curation/${jobId}`);
      }
    });

    return () => responseListener.current?.remove();
  }, []);
}

function useBackgroundTaskLifecycle() {
  const pendingJobs = useJobStore((s) => s.pendingJobs());

  useEffect(() => {
    if (pendingJobs.length > 0) {
      registerClipStatusTask();
    } else {
      unregisterClipStatusTask();
    }
  }, [pendingJobs.length]);
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    setupAndroidChannel();
  }, []);

  useDeepLinkNotifications();
  useBackgroundTaskLifecycle();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
