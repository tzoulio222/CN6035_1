import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  accessToken: 'stage_access_token',
  refreshToken: 'stage_refresh_token',
};

function getApiBaseUrl() {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (envBaseUrl) {
    return envBaseUrl.replace(/\/$/, '');
  }

  // Παίρνουμε το host του Expo όταν τρέχει σε συσκευή ή emulator.
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.hostUri || '';
  const host = hostUri.split(':')[0]?.trim();
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:3000`;
  }

  // Στο Android emulator το localhost δεν δείχνει στο host PC.
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://127.0.0.1:3000';
}

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const nextConfig = config || {};
  nextConfig.headers = nextConfig.headers || {};
  const token = await SecureStore.getItemAsync(STORAGE_KEYS.accessToken);
  if (token) {
    nextConfig.headers.Authorization = `Bearer ${token}`;
  }
  return nextConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.refreshToken);
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/api/refresh`, { refreshToken });
          const { accessToken } = res.data;
          await SecureStore.setItemAsync(STORAGE_KEYS.accessToken, accessToken);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Logout user
          await SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken);
          await SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
