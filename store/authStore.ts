import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types/user.types';
import type { AuthTokens } from '@/types/auth.types';

// Auth state interface
interface AuthState {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;
  setError: (error: string | null) => void;
  
  // Auth actions
  loginSuccess: (tokens: AuthTokens, user?: User | null) => void;
  logoutSuccess: () => void;
  refreshTokenSuccess: (tokens: AuthTokens) => void;
  
  // Reset
  reset: () => void;
}

// Initial state
const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

/**
 * Auth Store - Manages authentication state using Zustand
 * NOTE: isInitialized is NOT persisted - always starts as false
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,
      
      // Basic setters
      setUser: (user) => {
        console.log('[AuthStore] setUser:', user);
        set({ user });
      },
      setTokens: (tokens) => {
        console.log('[AuthStore] setTokens:', !!tokens);
        set({ tokens });
      },
      setAuthenticated: (isAuthenticated) => {
        console.log('[AuthStore] setAuthenticated:', isAuthenticated);
        set({ isAuthenticated });
      },
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => {
        console.log('[AuthStore] setInitialized:', isInitialized);
        set({ isInitialized });
      },
      setError: (error) => set({ error }),
      
      // Login success - set tokens and optionally user
      // Backend only returns tokens on login, user is fetched separately
      loginSuccess: (tokens, user = null) => {
        console.log('[AuthStore] loginSuccess');
        set({
          tokens,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },
      
      // Logout success - clear all auth data
      logoutSuccess: () => {
        console.log('[AuthStore] logoutSuccess');
        set({
          ...initialState,
          isInitialized: true, // Keep initialized state after logout
        });
      },
      
      // Refresh token success - update tokens
      refreshTokenSuccess: (tokens) => {
        console.log('[AuthStore] refreshTokenSuccess');
        set({
          tokens,
          error: null,
        });
      },
      
      // Reset store to initial state
      reset: () => set(initialState),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user - NOT isInitialized or isAuthenticated
      // isAuthenticated will be determined by checking tokens on startup
      partialize: (state) => ({
        user: state.user,
      }),
      // When storage is rehydrated, ensure isInitialized stays false
      onRehydrateStorage: () => (state) => {
        console.log('[AuthStore] Rehydrated from storage');
        if (state) {
          state.isInitialized = false;
          state.isAuthenticated = false;
        }
      },
    }
  )
);

// Selectors for optimized re-renders
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectIsInitialized = (state: AuthState) => state.isInitialized;
export const selectError = (state: AuthState) => state.error;
export const selectTokens = (state: AuthState) => state.tokens;

export default useAuthStore;
