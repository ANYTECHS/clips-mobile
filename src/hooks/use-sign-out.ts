import { token } from '@/lib/token';
import { useAuthStore } from '@/store/auth';

export function useSignOut() {
  const signOut = useAuthStore((s) => s.signOut);
  return async () => {
    await token.clearAll();
    signOut();
  };
}
