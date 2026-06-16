import { create } from 'zustand';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  accessToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  setStatus: (status: AuthStatus) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  accessToken: null,
  setTokens: (access) => set({ accessToken: access, status: 'authenticated' }),
  setStatus: (status) => set({ status }),
  signOut: () => set({ accessToken: null, status: 'unauthenticated' }),
}));
