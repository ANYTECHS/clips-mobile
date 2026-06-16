import * as SecureStore from 'expo-secure-store';

const KEY_ACCESS = 'auth_access_token';
const KEY_REFRESH = 'auth_refresh_token';

export const token = {
  saveAccess: (t: string) => SecureStore.setItemAsync(KEY_ACCESS, t),
  saveRefresh: (t: string) => SecureStore.setItemAsync(KEY_REFRESH, t),
  getAccess: () => SecureStore.getItemAsync(KEY_ACCESS),
  getRefresh: () => SecureStore.getItemAsync(KEY_REFRESH),
  clearAll: async () => {
    await SecureStore.deleteItemAsync(KEY_ACCESS);
    await SecureStore.deleteItemAsync(KEY_REFRESH);
  },
};
