import { create } from 'zustand'
import type { UserResponse } from '@/features/user/schemas/user.schema'
import { userApi } from '@/features/user/api/user.api'
import { storage } from '@/utils/storageUtils'

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
  // UI State
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  
  // User data
  user: UserResponse | null

  // Actions
  setAuthenticated: (isAuthenticated: boolean) => void
  setLoading: (isLoading: boolean) => void
  setInitialized: (isInitialized: boolean) => void
  setError: (error: string | null) => void
  setUser: (user: UserResponse | null) => void

  // Convenience methods
  loginSuccess: () => Promise<void>
  logoutSuccess: () => void
  reset: () => void
}

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  user: null
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

  setUser: (user) => {
    console.log('[AuthStore] setUser:', user?.email)
    set({ user })
  },

  // Login success - fetch and store user data
  loginSuccess: async () => {
    console.log('[AuthStore] loginSuccess - fetching user profile')
    
    let userData: UserResponse | null = null
    
    try {
      // Fetch fresh user profile
      const userResponse = await userApi.getMyProfile()
      userData = userResponse.data.data
      
      // Store user data in storage
      await storage.set('user_data', userData)
      console.log('[AuthStore] User profile fetched:', userData.email)
    } catch (error) {
      console.error('[AuthStore] Failed to fetch user profile:', error)
      
      // Fallback: Load from storage
      try {
        const cachedUser = await storage.get('user_data')
        if (cachedUser && typeof cachedUser === 'object' && 'id' in cachedUser) {
          userData = cachedUser as UserResponse
          console.log('[AuthStore] Loaded user from storage:', userData.email)
        }
      } catch (storageError) {
        console.error('[AuthStore] Failed to load user from storage:', storageError)
      }
    }
    
    set({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      user: userData
    })
  },

  // Logout success - clear all state
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
export const selectUser = (state: AuthState) => state.user

export default useAuthStore
