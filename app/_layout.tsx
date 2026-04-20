import '../global.css'
import '@/tasks/background-notification-task'
import i18n from '@/i18n'
import '@/features/friend/i18n'
import '@/features/message/i18n'
import '@/features/search/i18n'
import { SEMANTIC } from '@/constants/theme'

import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { I18nextProvider } from 'react-i18next'
import { useEffect } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { useFcm } from '@/hooks'

import { GluestackProvider } from '@/components/ui/gluestack-ui-provider'
import { useAuthStore } from '@/store'
import { getAccessToken, getRefreshToken, setUnauthorizedHandler } from '@/lib/http'
import { ThemeProvider, useTheme } from '@/context'
import { storage } from '@/utils/storageUtils'

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false
    }
  }
})

function SimpleLoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: SEMANTIC.primary
      }}
    >
      <Text
        style={{
          fontSize: 48,
          fontWeight: 'bold',
          color: 'white',
          fontStyle: 'italic'
        }}
      >
        Zalo
      </Text>
      <ActivityIndicator size='large' color='white' style={{ marginTop: 20 }} />
    </View>
  )
}

/**
 * Auth Guard Component - Redirects to auth if not authenticated
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized, setInitialized, loginSuccess, logoutSuccess } = useAuthStore()

  // Khởi động FCM: xin quyền, lấy token, register device lên server
  useFcm()
  const segments = useSegments()
  const router = useRouter()

  // Initialize auth on app start
  useEffect(() => {
    let isMounted = true
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const initAuth = async () => {
      console.log('[AuthGuard] Starting auth initialization...')
      try {
        let accessToken: string | null = null
        let refreshToken: string | null = null

        try {
          // Add timeout for token retrieval
          const tokenPromise = Promise.all([getAccessToken(), getRefreshToken()])

          const result = await Promise.race([
            tokenPromise,
            new Promise<[null, null]>((resolve) => setTimeout(() => resolve([null, null]), 3000))
          ])

          accessToken = result[0]
          refreshToken = result[1]
          console.log('[AuthGuard] Tokens retrieved:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken
          })
        } catch (tokenError) {
          console.error('[AuthGuard] Error getting tokens:', tokenError)
        }

        if (!isMounted) return

        if (accessToken && refreshToken) {
          // loginSuccess will fetch user profile
          await loginSuccess()
          console.log('[AuthGuard] User logged in with existing tokens')
        } else {
          logoutSuccess()
          console.log('[AuthGuard] No tokens found, logged out')
        }
      } catch (error) {
        console.error('[AuthGuard] Auth init error:', error)
        if (isMounted) logoutSuccess()
      } finally {
        if (isMounted) {
          console.log('[AuthGuard] Setting initialized to true')
          setInitialized(true)
        }
      }
    }

    if (!isInitialized) {
      // Failsafe: ensure we initialize even if something goes wrong
      timeoutId = setTimeout(() => {
        console.warn('[AuthGuard] Initialization timeout - forcing initialized state')
        if (isMounted && !isInitialized) {
          logoutSuccess()
          setInitialized(true)
        }
      }, 5000)

      initAuth()
    }

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isInitialized, loginSuccess, logoutSuccess, setInitialized])

  useEffect(() => {
    if (!isInitialized) return

    const segmentsArray = segments as string[]
    const inAuthGroup = segmentsArray[0] === 'auth'
    const inQrGroup = segmentsArray[0] === 'qr'

    console.log('[AuthGuard] Navigation check:', {
      isAuthenticated,
      inAuthGroup,
      inQrGroup,
      segments
    })

    if (!isAuthenticated && !inAuthGroup && !inQrGroup) {
      console.log('[AuthGuard] Redirecting to /auth')
      router.replace('/auth')
    } else if (isAuthenticated && inAuthGroup) {
      console.log('[AuthGuard] Redirecting to /(tabs)')
      router.replace('/(tabs)')
    }
  }, [isAuthenticated, isInitialized, segments, router])

  if (!isInitialized) {
    return <SimpleLoadingScreen />
  }

  return <>{children}</>
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <ThemeAwareProviders />
            </ThemeProvider>
          </QueryClientProvider>
        </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

function ThemeAwareProviders() {
  const { activeTheme, isDark } = useTheme()
  const logoutSuccess = useAuthStore((state) => state.logoutSuccess)

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await storage.remove('user_data')
      logoutSuccess()
      queryClient.clear()
    })

    return () => {
      setUnauthorizedHandler(null)
    }
  }, [logoutSuccess])

  return (
    <GluestackProvider mode={activeTheme}>
      <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='(tabs)' />
            <Stack.Screen name='auth' />
            <Stack.Screen name='settings' />
            <Stack.Screen name='search' />
            <Stack.Screen name='friend-requests' />
            <Stack.Screen name='add-friend' />
            <Stack.Screen
              name='add-friend/scan'
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom'
              }}
            />
            <Stack.Screen name='user-profile/[id]' />
            <Stack.Screen name='find-friends-contacts' />
            <Stack.Screen name='message-options' />
            <Stack.Screen name='media-storage' />
            <Stack.Screen
              name='story/capture'
              options={{
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
                gestureEnabled: false,
                fullScreenGestureEnabled: false
              }}
            />
            <Stack.Screen
              name='chat/[id]'
              options={{
                animation: 'slide_from_right'
              }}
            />
            <Stack.Screen
              name='qr/index'
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom'
              }}
            />
            <Stack.Screen name='qr/confirm' />
          </Stack>
        </AuthGuard>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Toast />
      </NavigationThemeProvider>
    </GluestackProvider>
  )
}
