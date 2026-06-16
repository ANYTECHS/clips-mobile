import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { Alert } from 'react-native';

import { api } from '@/lib/api';
import { token } from '@/lib/token';
import { useAuthStore } from '@/store/auth';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export function useGoogleAuth() {
  const { setTokens } = useAuthStore();

  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'clipcash', path: 'auth/callback' });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri,
      scopes: ['openid', 'email', 'profile'],
      usePKCE: true,
    },
    GOOGLE_DISCOVERY,
  );

  useEffect(() => {
    if (response?.type !== 'success') return;
    const { code } = response.params;
    if (!code) return;

    api
      .post<{ accessToken: string; refreshToken: string }>('/auth/google', {
        code,
        redirectUri,
        codeVerifier: request?.codeVerifier,
      })
      .then(async ({ data }) => {
        await token.saveAccess(data.accessToken);
        await token.saveRefresh(data.refreshToken);
        setTokens(data.accessToken, data.refreshToken);
      })
      .catch(() => Alert.alert('Sign-in failed', 'Could not complete Google sign-in.'));
  }, [response]);

  return { promptAsync, disabled: !request };
}
