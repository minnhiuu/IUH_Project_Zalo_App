import "../global.css";
import "@/i18n"; // Initialize i18n

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { I18nextProvider } from "react-i18next";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";

import { GluestackProvider } from "@/components/ui";
import { useColorScheme } from "@/hooks/use-color-scheme";
import i18n from "@/i18n";
import { useAuthStore } from "@/store";
import { getAccessToken, getRefreshToken } from "@/lib/http";



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});


function SimpleLoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0068FF' }}>
      <Text style={{ fontSize: 48, fontWeight: 'bold', color: 'white', fontStyle: 'italic' }}>Zalo</Text>
      <ActivityIndicator size="large" color="white" style={{ marginTop: 20 }} />
    </View>
  );
}

/**
 * Auth Guard Component - Redirects to auth if not authenticated
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized, setInitialized, loginSuccess, logoutSuccess } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Initialize auth on app start
  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const initAuth = async () => {
      console.log('[AuthGuard] Starting auth initialization...');
      try {
        let accessToken: string | null = null;
        let refreshToken: string | null = null;
        
        try {
          // Add timeout for token retrieval
          const tokenPromise = Promise.all([
            getAccessToken(),
            getRefreshToken(),
          ]);
          
          const [access, refresh] = await Promise.race([
            tokenPromise,
            new Promise<[null, null]>((resolve) => 
              setTimeout(() => resolve([null, null]), 3000)
            ),
          ]);
          
          accessToken = access;
          refreshToken = refresh;
          console.log('[AuthGuard] Tokens retrieved:', { 
            hasAccessToken: !!accessToken, 
            hasRefreshToken: !!refreshToken 
          });
        } catch (tokenError) {
          console.error('[AuthGuard] Error getting tokens:', tokenError);
        }

        if (!isMounted) return;

        if (accessToken && refreshToken) {
          loginSuccess(
            { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: 0 },
            null
          );
          console.log('[AuthGuard] User logged in with existing tokens');
        } else {
          logoutSuccess();
          console.log('[AuthGuard] No tokens found, logged out');
        }
      } catch (error) {
        console.error('[AuthGuard] Auth init error:', error);
        if (isMounted) logoutSuccess();
      } finally {
        if (isMounted) {
          console.log('[AuthGuard] Setting initialized to true');
          setInitialized(true);
        }
      }
    };

    if (!isInitialized) {
      // Failsafe: ensure we initialize even if something goes wrong
      timeoutId = setTimeout(() => {
        console.warn('[AuthGuard] Initialization timeout - forcing initialized state');
        if (isMounted && !useAuthStore.getState().isInitialized) {
          logoutSuccess();
          setInitialized(true);
        }
      }, 5000);

      initAuth();
    }

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "auth";
    console.log('[AuthGuard] Navigation check:', { isAuthenticated, inAuthGroup, segments });

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to auth if not authenticated
      console.log('[AuthGuard] Redirecting to /auth');
      router.replace("/auth");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if authenticated and trying to access auth
      console.log('[AuthGuard] Redirecting to /(tabs)');
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isInitialized, segments]);

  // Show loading screen while initializing
  console.log('[AuthGuard] Render - isInitialized:', isInitialized);
  if (!isInitialized) {
    return <SimpleLoadingScreen />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <GluestackProvider>
              <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
              >
                <AuthGuard>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="auth" />
                  </Stack>
                </AuthGuard>
                <StatusBar style="auto" />
                <Toast />
              </ThemeProvider>
            </GluestackProvider>
          </QueryClientProvider>
        </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
