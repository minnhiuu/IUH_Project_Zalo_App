import { create } from 'zustand'
import { UserResponse } from '@/features/user/schemas/user.schema'

interface AuthState {
  // UI State
  user: UserResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  fcmToken: string | null

  // Actions
  setAuthenticated: (isAuthenticated: boolean) => void
  setLoading: (isLoading: boolean) => void
  setInitialized: (isInitialized: boolean) => void
  setError: (error: string | null) => void
  setFcmToken: (fcmToken: string | null) => void
  setUser: (user: UserResponse | null) => void

  // Convenience methods
  loginSuccess: (tokens?: any, user?: UserResponse | null) => void
  logoutSuccess: () => void
  reset: () => void
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  fcmToken: null
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  ...initialState,

  // Basic setters
  setAuthenticated: (isAuthenticated) => {
    console.log('[AuthStore] setAuthenticated:', isAuthenticated)
    set({ isAuthenticated })
  },

  setLoading: (isLoading) => set({ isLoading }),

  setInitialized: (isInitialized) => {
    console.log('[AuthStore] setInitialized:', isInitialized)
    set({ isInitialized })
  },

  setError: (error) => set({ error }),

  setFcmToken: (fcmToken) => set({ fcmToken }),

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  // Login success - update UI state and user
  loginSuccess: (tokens, user) => {
    console.log('[AuthStore] loginSuccess', { tokens, user })
    set((state) => ({
      user: user ?? state.user,
      isAuthenticated: true,
      isLoading: false,
      error: null
    }))
  },

  // Logout success - clear all UI state
  // Tokens cleared from secure storage separately
  // React Query cache cleared separately
  logoutSuccess: () => {
    console.log('[AuthStore] logoutSuccess')
    set({
      ...initialState,
      isInitialized: true // Keep initialized state after logout
    })
  },

  // Reset store to initial state
  reset: () => set(initialState)
}))

// Selectors for optimized re-renders
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated
export const selectIsLoading = (state: AuthState) => state.isLoading
export const selectIsInitialized = (state: AuthState) => state.isInitialized
export const selectError = (state: AuthState) => state.error

export default useAuthStore
