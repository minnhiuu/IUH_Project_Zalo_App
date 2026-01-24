import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

import { authApi } from '../api';
import { authKeys } from './keys';
import { useAuthStore } from '@/store';
import { handleErrorApi } from '@/utils/error-handler';
import { getRefreshToken } from '@/lib/http';
import type { LoginPayload, RegisterPayload, RegisterVerifyPayload, AuthResponse, AuthTokens } from '@/types/auth.types';

/**
 * Login mutation hook
 */
export const useLoginMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { loginSuccess, setLoading, setError } = useAuthStore();

  return useMutation({
    mutationKey: authKeys.login(),
    mutationFn: (body: LoginPayload) => authApi.login(body),
    
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    
    onSuccess: (data: AuthResponse) => {
      loginSuccess(data.tokens, data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      
      Toast.show({
        type: 'success',
        text1: t('auth.login.loginSuccess'),
        visibilityTime: 2000,
      });
      
      router.replace('/(tabs)');
    },
    
    onError: (error: Error) => {
      setError(error.message);
      handleErrorApi({ error });
    },
    
    onSettled: () => {
      setLoading(false);
    },
  });
};

/**
 * Register mutation hook - Step 1: Initiate registration (2-step with OTP)
 * Sends OTP to email, then user needs to verify
 */
export const useRegisterMutation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { setLoading, setError } = useAuthStore();

  return useMutation({
    mutationKey: authKeys.register(),
    mutationFn: (body: RegisterPayload) => authApi.register(body),
    
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    
    onSuccess: (data, variables) => {
      Toast.show({
        type: 'success',
        text1: t('auth.register.otpSent'),
        text2: data.message,
        visibilityTime: 3000,
      });
      
      // Navigate to OTP verification screen
      router.push({
        pathname: '/auth/verify-otp' as any,
        params: { email: variables.email },
      });
    },
    
    onError: (error: Error) => {
      setError(error.message);
      handleErrorApi({ error });
    },
    
    onSettled: () => {
      setLoading(false);
    },
  });
};

/**
 * Register verify mutation hook - Step 2: Verify OTP and complete registration
 */
export const useRegisterVerifyMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { loginSuccess, setLoading, setError } = useAuthStore();

  return useMutation({
    mutationKey: authKeys.registerVerify(),
    mutationFn: (body: RegisterVerifyPayload) => authApi.registerVerify(body),
    
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    
    onSuccess: (data: AuthResponse) => {
      loginSuccess(data.tokens, data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      
      Toast.show({
        type: 'success',
        text1: t('auth.register.registerSuccess'),
        visibilityTime: 2000,
      });
      
      router.replace('/(tabs)');
    },
    
    onError: (error: Error) => {
      setError(error.message);
      handleErrorApi({ error });
    },
    
    onSettled: () => {
      setLoading(false);
    },
  });
};

/**
 * Logout mutation hook
 */
export const useLogoutMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { logoutSuccess, setLoading } = useAuthStore();

  return useMutation({
    mutationKey: authKeys.logout(),
    mutationFn: async () => {
      const refreshToken = await getRefreshToken();
      return authApi.logout(refreshToken || undefined);
    },
    
    onMutate: () => {
      setLoading(true);
    },
    
    onSuccess: () => {
      logoutSuccess();
      queryClient.clear();
      
      Toast.show({
        type: 'success',
        text1: t('auth.logout.logoutSuccess'),
        visibilityTime: 2000,
      });
      
      router.replace('/auth/login' as any);
    },
    
    onError: () => {
      // Even on error, still logout locally
      logoutSuccess();
      queryClient.clear();
      
      Toast.show({
        type: 'info',
        text1: t('auth.logout.logoutSuccess'),
        visibilityTime: 2000,
      });
      
      router.replace('/auth/login' as any);
    },
    
    onSettled: () => {
      setLoading(false);
    },
  });
};

/**
 * Refresh token mutation hook
 */
export const useRefreshTokenMutation = () => {
  const { t } = useTranslation();
  const { refreshTokenSuccess, logoutSuccess, setError } = useAuthStore();

  return useMutation({
    mutationKey: authKeys.refresh(),
    mutationFn: async (): Promise<AuthTokens> => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        throw new Error(t('auth.refresh.refreshFailed'));
      }
      return authApi.refreshToken(refreshToken);
    },
    
    onSuccess: (tokens: AuthTokens) => {
      refreshTokenSuccess(tokens);
    },
    
    onError: (error: Error) => {
      setError(error.message);
      logoutSuccess();
      
      Toast.show({
        type: 'error',
        text1: t('auth.refresh.refreshFailed'),
        visibilityTime: 3000,
      });
    },
  });
};
