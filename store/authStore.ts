import { create } from 'zustand';

/**
 * Auth Store - UI State Only
 * 
 * Principles:
 * - Server data (user) → React Query (useMyProfile)
 * - UI state → Zustand Store (this file)
 * - Tokens → Secure Storage (expo-secure-store)
 * 
 * Store can be lost, but tokens in secure storage persist.
 * No duplicate state - user data comes from React Query cache.
 */

interface AuthState {
  // UI State only
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;
  setError: (error: string | null) => void;
  
  // Convenience methods
  loginSuccess: () => void;
  logoutSuccess: () => void;
  reset: () => void;
}

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  ...initialState,
  
  // Basic setters
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
  
  // Login success - only update UI state
  // Tokens stored in secure storage
  // User data fetched via React Query
  loginSuccess: () => {
    console.log('[AuthStore] loginSuccess');
    set({
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  },
  
  // Logout success - clear all UI state
  // Tokens cleared from secure storage separately
  // React Query cache cleared separately
  logoutSuccess: () => {
    console.log('[AuthStore] logoutSuccess');
    set({
      ...initialState,
      isInitialized: true, // Keep initialized state after logout
    });
  },
  
  // Reset store to initial state
  reset: () => set(initialState),
}));

// Selectors for optimized re-renders
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectIsInitialized = (state: AuthState) => state.isInitialized;
export const selectError = (state: AuthState) => state.error;

export default useAuthStore;
