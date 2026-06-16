import { Redirect, Slot } from 'expo-router';

import { useAuthStore } from '@/store/auth';

export default function AuthLayout() {
  const status = useAuthStore((s) => s.status);

  if (status === 'authenticated') return <Redirect href="/(tabs)" />;

  return <Slot />;
}
