import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deviceApi } from '../api/device.api'
import { authApi } from '@/features/auth/api/auth.api'
import { deviceKeys } from './keys'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'

export const useDeleteDevice = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (deviceId: string) => deviceApi.deleteDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.myDevices() })
      Toast.show({
        type: 'success',
        text1: t('settings.deviceManagement.deleteSuccess')
      })
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: t('settings.deviceManagement.deleteError')
      })
    }
  })
}

export const useLogoutOtherDevices = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: () => authApi.logoutOthers(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.myDevices() })
      Toast.show({
        type: 'success',
        text1: t('settings.deviceManagement.logoutOthersSuccess')
      })
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: t('settings.deviceManagement.logoutOthersError')
      })
    }
  })
}
