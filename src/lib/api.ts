import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { token } from './token';
import { useAuthStore } from '@/store/auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = axios.create({ baseURL: BASE_URL });

// Attach access token to every request
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const access = await token.getAccess();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// On 401 — try refresh once, then sign out
let isRefreshing = false;
let waitQueue: Array<(t: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        waitQueue.push((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshToken = await token.getRefresh();
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${BASE_URL}/auth/refresh`,
        { refreshToken },
      );

      await token.saveAccess(data.accessToken);
      await token.saveRefresh(data.refreshToken);
      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);

      waitQueue.forEach((cb) => cb(data.accessToken));
      waitQueue = [];

      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch {
      waitQueue = [];
      await token.clearAll();
      useAuthStore.getState().signOut();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
