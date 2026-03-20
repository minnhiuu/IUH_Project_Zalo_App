// Storage utilities using SecureStore and AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'

const SECURE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  DEVICE_ID: 'device_id',
  ACCEPT_LANGUAGE: 'accept_language',
}

const STORAGE_KEYS = {
  USER_DATA: 'user_data',
  APP_SETTINGS: 'app_settings',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  RECENT_SEARCHES: 'recent_searches',
  SEARCH_SHOW_QUICK_ACCESS: 'search_show_quick_access',
  SEARCH_SAVE_CONTACTS: 'search_save_contacts',
  SEARCH_SAVE_QUERIES: 'search_save_queries'
}

// Secure storage for sensitive data (tokens)
export const secureStorage = {
  setAccessToken: async (token: string): Promise<void> => {
    await SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, token)
  },

  getAccessToken: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN)
  },

  setRefreshToken: async (token: string): Promise<void> => {
    await SecureStore.setItemAsync(SECURE_KEYS.REFRESH_TOKEN, token)
  },

  getRefreshToken: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(SECURE_KEYS.REFRESH_TOKEN)
  },

  clearTokens: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN)
    await SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN)
  },

  setDeviceId: async (deviceId: string): Promise<void> => {
    await SecureStore.setItemAsync(SECURE_KEYS.DEVICE_ID, deviceId)
  },

  getDeviceId: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(SECURE_KEYS.DEVICE_ID)
  },

  setAcceptLanguage: async (lang: string): Promise<void> => {
    await SecureStore.setItemAsync(SECURE_KEYS.ACCEPT_LANGUAGE, lang)
  },

  getAcceptLanguage: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(SECURE_KEYS.ACCEPT_LANGUAGE)
  },

  clearAcceptLanguage: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(SECURE_KEYS.ACCEPT_LANGUAGE)
  },
}

// AsyncStorage for non-sensitive data
export const storage = {
  set: async <T>(key: string, value: T): Promise<void> => {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  },

  get: async <T>(key: string): Promise<T | null> => {
    const value = await AsyncStorage.getItem(key)
    return value ? JSON.parse(value) : null
  },

  remove: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key)
  },

  clear: async (): Promise<void> => {
    await AsyncStorage.clear()
  },

  // Specific helpers
  setUserData: async (userData: object): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
  },

  getUserData: async <T>(): Promise<T | null> => {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA)
    return data ? JSON.parse(data) : null
  },

  setOnboardingCompleted: async (completed: boolean): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, JSON.stringify(completed))
  },

  isOnboardingCompleted: async (): Promise<boolean> => {
    const completed = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)
    return completed === 'true'
  }
}

export { SECURE_KEYS, STORAGE_KEYS }
