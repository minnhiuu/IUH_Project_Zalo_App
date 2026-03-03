import { useAuthStore } from '@/store'
import { authApi } from '../api'
import { getAccessToken, getRefreshToken } from '@/lib/http'
import {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useRegisterMutation
} from '../queries/use-mutations'

/**
 * Combined auth hook for easy access to all auth functionality
 * Following web project structure
 */
export const useAuth = () => {
  const store = useAuthStore()
  const loginMutation = useLoginMutation()
  const registerMutation = useRegisterMutation()
  const logoutMutation = useLogoutMutation()
  const refreshMutation = useRefreshTokenMutation()

  /**
   * Initialize auth state on app start
   */
  const initializeAuth = async (): Promise<boolean> => {
    try {
      const user = await authApi.getStoredUser()
      const accessToken = await getAccessToken()
      const refreshToken = await getRefreshToken()

      if (accessToken && refreshToken) {
        // Validate token with server
        const isValid = await authApi.validateToken(accessToken)

        if (isValid) {
          store.loginSuccess({ accessToken, refreshToken, tokenType: 'Bearer', expiresIn: 0 }, user)
          store.setInitialized(true)
          return true
        }

        // Token invalid, try refresh
        try {
          const tokens = await authApi.refreshToken(refreshToken)
          store.loginSuccess(tokens, user)
          store.setInitialized(true)
          return true
        } catch {
          // Refresh failed
        }
      }

      store.logoutSuccess()
      store.setInitialized(true)
      return false
    } catch (error) {
      console.error('Auth initialization error:', error)
      store.logoutSuccess()
      store.setInitialized(true)
      return false
    }
  }

  return {
    // State
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading || loginMutation.isPending || logoutMutation.isPending,
    isInitialized: store.isInitialized,
    error: store.error,

    // Actions
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    refreshToken: refreshMutation.mutate,
    refreshTokenAsync: refreshMutation.mutateAsync,
    initializeAuth,

    // Store actions
    setUser: store.setUser,
    updateUser: store.setUser,
    logoutLocal: store.logoutSuccess,

    // Mutation states
    loginState: {
      isPending: loginMutation.isPending,
      isError: loginMutation.isError,
      error: loginMutation.error
    },
    registerState: {
      isPending: registerMutation.isPending,
      isError: registerMutation.isError,
      error: registerMutation.error
    },
    logoutState: {
      isPending: logoutMutation.isPending,
      isError: logoutMutation.isError,
      error: logoutMutation.error
    }
  }
}

export default useAuth
