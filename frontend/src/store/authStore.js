import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
  accessToken: 'stage_access_token',
  refreshToken: 'stage_refresh_token',
  user: 'stage_user',
};

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,

  initialize: async () => {
    try {
      const [accessToken, refreshToken, userStr] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.accessToken),
        SecureStore.getItemAsync(STORAGE_KEYS.refreshToken),
        SecureStore.getItemAsync(STORAGE_KEYS.user),
      ]);

      set({
        accessToken,
        refreshToken,
        user: userStr ? JSON.parse(userStr) : null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load auth state', error);
      set({ isLoading: false });
    }
  },

  setSession: async (session) => {
    try {
      if (session) {
        await Promise.all([
          SecureStore.setItemAsync(STORAGE_KEYS.accessToken, session.accessToken),
          SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, session.refreshToken),
          SecureStore.setItemAsync(STORAGE_KEYS.user, JSON.stringify(session.user)),
        ]);
        set({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          user: session.user,
        });
      } else {
        await Promise.all([
          SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken),
          SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken),
          SecureStore.deleteItemAsync(STORAGE_KEYS.user),
        ]);
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        });
      }
    } catch (error) {
      console.error('Failed to save session', error);
    }
  },

  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken),
      SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken),
      SecureStore.deleteItemAsync(STORAGE_KEYS.user),
    ]);
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));
