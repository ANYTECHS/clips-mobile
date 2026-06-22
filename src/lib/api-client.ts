import { useAuthStore } from "@/stores/auth-store";
import axios, {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig,
} from "axios";
import { tokenStorage } from "./token-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

// ── Types ─────────────────────────────────────────────────────────────────────

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

type RefreshResponse = { accessToken: string };

// ── Singleton instance ────────────────────────────────────────────────────────

export const api: AxiosInstance = axios.create({ baseURL: BASE_URL });

// ── Request interceptor — attach access token ─────────────────────────────────

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — silent token refresh on 401 ───────────────────────

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;

    // Pass through non-401 errors and already-retried requests
    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    // Queue this request if a refresh is already in flight
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token: string) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token available");

      const { data } = await axios.post<RefreshResponse>(
        `${BASE_URL}/auth/refresh`,
        { refreshToken },
      );

      await tokenStorage.setAccessToken(data.accessToken);

      // Drain the queue — give every waiting request the new token
      refreshQueue.forEach(({ resolve }) => resolve(data.accessToken));
      refreshQueue = [];

      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (refreshError) {
      // Drain the queue with rejections
      refreshQueue.forEach(({ reject }) => reject(refreshError));
      refreshQueue = [];

      await tokenStorage.clearTokens();
      useAuthStore.getState().signOut();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
