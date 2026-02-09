import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'

import { authApi } from '../api'
import { authKeys } from './keys'
import { useAuthStore } from '@/store'
import { handleErrorApi } from '@/utils/error-handler'
import { getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from '@/lib/http'
import { storage } from '@/utils/storageUtils'
import { userApi } from '@/features/user/api/user.api'
import { userKeys } from '@/features/user/queries/keys'

export const useLoginMutation = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { loginSuccess, setLoading, setError } = useAuthStore()

  return useMutation({
    mutationKey: authKeys.login(),
    mutationFn: authApi.login,

    onMutate: () => {
      setLoading(true)
      setError(null)
    },

    onSuccess: async (response) => {
      const tokens = response.data.data

      await setAccessToken(tokens.accessToken)
      await setRefreshToken(tokens.refreshToken)

      // loginSuccess will fetch user profile
      await loginSuccess()

      Toast.show({
        type: 'success',
        text1: t('auth.login.loginSuccess'),
        visibilityTime: 2000
      })

      router.replace('/(tabs)')
    },

    onError: (error: Error) => {
      setError(error.message)
      handleErrorApi({ error })
    },

    onSettled: () => {
      setLoading(false)
    }
  })
}

export const useRegisterMutation = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { setLoading, setError } = useAuthStore()

  return useMutation({
    mutationKey: authKeys.register(),
    mutationFn: authApi.register,

    onMutate: () => {
      setLoading(true)
      setError(null)
    },

    onSuccess: (response, variables) => {
      Toast.show({
        type: 'success',
        text1: t('auth.register.otpSent'),
        text2: response.data.data.message,
        visibilityTime: 3000
      })

      router.push({
        pathname: '/auth/verify-otp' as any,
        params: { email: variables.email }
      })
    },

    onError: (error: Error) => {
      setError(error.message)
      handleErrorApi({ error })
    },

    onSettled: () => {
      setLoading(false)
    }
  })
}

export const useRegisterVerifyMutation = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { loginSuccess, setLoading, setError } = useAuthStore()

  return useMutation({
    mutationKey: authKeys.registerVerify(),
    mutationFn: authApi.registerVerify,

    onMutate: () => {
      setLoading(true)
      setError(null)
    },

    onSuccess: async (response) => {
      const tokens = response.data.data

      await setAccessToken(tokens.accessToken)
      await setRefreshToken(tokens.refreshToken)

      // loginSuccess will fetch user profile
      await loginSuccess()

      Toast.show({
        type: 'success',
        text1: t('auth.register.registerSuccess'),
        visibilityTime: 2000
      })

      router.replace('/(tabs)')
    },

    onError: (error: Error) => {
      setError(error.message)
      handleErrorApi({ error })
    },

    onSettled: () => {
      setLoading(false)
    }
  })
}

export const useLogoutMutation = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { logoutSuccess, setLoading } = useAuthStore()

  return useMutation({
    mutationKey: authKeys.logout(),
    mutationFn: async () => {
      const refreshToken = await getRefreshToken()
      return authApi.logout(refreshToken ? { refreshToken } : {})
    },

    onMutate: () => {
      setLoading(true)
    },

    onSuccess: async () => {
      await clearTokens()
      await storage.remove('user_data')

      logoutSuccess()
      queryClient.clear()

      Toast.show({
        type: 'success',
        text1: t('auth.logout.logoutSuccess'),
        visibilityTime: 2000
      })

      router.replace('/auth/login' as any)
    },

    onError: async () => {
      await clearTokens()
      await storage.remove('user_data')

      logoutSuccess()
      queryClient.clear()

      Toast.show({
        type: 'info',
        text1: t('auth.logout.logoutSuccess'),
        visibilityTime: 2000
      })

      router.replace('/auth/login' as any)
    },

    onSettled: () => {
      setLoading(false)
    }
  })
}

export const useRefreshTokenMutation = () => {
  const { t } = useTranslation()
  const { logoutSuccess, setError } = useAuthStore()

  return useMutation({
    mutationKey: authKeys.refresh(),
    mutationFn: async () => {
      const refreshToken = await getRefreshToken()
      if (!refreshToken) {
        throw new Error(t('auth.refresh.refreshFailed'))
      }
      return authApi.refresh({ deviceId: 'mobile-device', refreshToken })
    },

    onSuccess: async (response) => {
      const tokens = response.data.data

      await setAccessToken(tokens.accessToken)
      await setRefreshToken(tokens.refreshToken)
    },

    onError: (error: Error) => {
      setError(error.message)
      logoutSuccess()

      Toast.show({
        type: 'error',
        text1: t('auth.refresh.refreshFailed'),
        visibilityTime: 3000
      })
    }
  })
}

export const useForgotPasswordMutation = () => {
  const { t } = useTranslation()
  const { setLoading, setError } = useAuthStore()

  return useMutation({
    mutationKey: authKeys.forgotPassword(),
    mutationFn: authApi.forgotPassword,

    onMutate: () => {
      setLoading(true)
      setError(null)
    },

    onSuccess: (response) => {
      Toast.show({
        type: 'success',
        text1: t('auth.forgotPassword.otpSent'),
        text2: response.data.data.message,
        visibilityTime: 3000
      })
    },

    onError: (error: Error) => {
      setError(error.message)
      handleErrorApi({ error })
    },

    onSettled: () => {
      setLoading(false)
    }
  })
}

export const useResetPasswordMutation = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { loginSuccess, setLoading, setError } = useAuthStore()

  return useMutation({
    mutationKey: authKeys.resetPassword(),
    mutationFn: authApi.resetPassword,

    onMutate: () => {
      setLoading(true)
      setError(null)
    },

    onSuccess: async (response) => {
      const tokens = response.data.data

      await setAccessToken(tokens.accessToken)
      await setRefreshToken(tokens.refreshToken)

      // loginSuccess will fetch user profile
      await loginSuccess()

      Toast.show({
        type: 'success',
        text1: t('auth.resetPassword.success'),
        visibilityTime: 2000
      })

      router.replace('/(tabs)')
    },

    onError: (error: Error) => {
      setError(error.message)
      handleErrorApi({ error })
    },

    onSettled: () => {
      setLoading(false)
    }
  })
}

export const useQrScanMutation = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationKey: authKeys.scanQr(),
    mutationFn: authApi.scanQr,
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: t('auth.qrLogin.scanned'),
        visibilityTime: 2000
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}

export const useQrAcceptMutation = () => {
  const { t } = useTranslation()
  const router = useRouter()

  return useMutation({
    mutationKey: authKeys.acceptQr(),
    mutationFn: authApi.acceptQr,
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: t('auth.qrLogin.confirmed'),
        visibilityTime: 2000
      })
      router.back()
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}

export const useQrRejectMutation = () => {
  const { t } = useTranslation()
  const router = useRouter()

  return useMutation({
    mutationKey: authKeys.rejectQr(),
    mutationFn: authApi.rejectQr,
    onSuccess: () => {
      Toast.show({
        type: 'info',
        text1: t('auth.qrLogin.rejected'),
        visibilityTime: 2000
      })
      router.back()
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}

export const useQrMobileMutation = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: authApi.qrMobile,
    onSuccess: (_, variables) => {
      Toast.show({
        type: 'success',
        visibilityTime: 2000
      })
      router.back()
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}

export const useChangePasswordMutation = () => {
  const { t } = useTranslation()
  const router = useRouter()

  return useMutation({
    mutationKey: authKeys.changePassword(),
    mutationFn: authApi.changePassword,

    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: t('settings.changePassword.success'),
        visibilityTime: 2000
      })
      router.back()
    },

    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}
